/*
The MIT License (MIT)
Copyright (c) 2022 Nikolay Suslov and the Krestianstvo.org project contributors.
(https://github.com/NikolaySuslov/krestianstvo/blob/master/LICENSE.md)

Based on Recursive, interactable portals implemented using THREE.js by 
Reed Metzler-Gilbertz (metzlr) https://github.com/metzlr/portals

*/

import { createEffect } from 'solid-js';
import { createStore } from "solid-js/store";
import * as THREE from "three";

const fullscreenQuadVert = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 1.0, 1.0);
}
`
const fullscreenQuadFrag = `#version 300 es
precision highp float;
out vec4 outColor;

void main() {
  outColor = vec4(1.0, 0, 0, 1.0);
}
`

/* ----- OPTIONS ----- */
/**
 * Maximum portal recursion depth
 */
let maxPortalRecursion = 3;
/**
 * How much to offset the near plane of the portal desintation camera behind the surface of a portal
 *
 * A higher offset value reduces z-fighting with objects close to the portal surface,
 * but means that objects directly behind portal need to be further away (since if they are within the offset distnace they could be rendered)
 */
let destinationNearPlaneOffset = 0.02;
/**
 * `destinationNearPlaneOffset` is scaled down dynamically when the main camera is very close to a portal. This variable defines a cutoff distance at which point the render will just revert to using the near plane that is directly aligned with the portal surface (i.e. an offset of 0) insead of the scaled down value
 */
let destinationObliqueCutoff = 0.009;
/**
 * Enables/disables portal rendering
 */
//let renderPortals = true;
/**
 * Draws camera helpers from destination perspective of each portal
 */
let drawPortalCameras = false;
/**
 * Draws portal collider wireframes
 */
let drawPortalColliders = false;
/**
 * When enabled, portals that aren't within the camera's frustum will not be rendered
 */
let frustumCullPortals = true;
/**
 * Whether or not the near plane of a portal's destination camera should be aligned with the portal surface. If this is disabled, objects behind the portal may be visible
 */
let portalObliqueViewFrustum = true;
/* ------------------- */

const _tempCamera = new THREE.PerspectiveCamera();
_tempCamera.matrixAutoUpdate = false;

const orthographicCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
// Quad rendered as scene background
const fullScreenQuadGeometry = new THREE.BufferGeometry();
const vertices = [-1, -1, 3, -1, -1, 3];
fullScreenQuadGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 2)
);
const fullScreenQuad = new THREE.Mesh(
    fullScreenQuadGeometry,
    new THREE.RawShaderMaterial({
        vertexShader: fullscreenQuadVert,
        fragmentShader: fullscreenQuadFrag,
    })
);
fullScreenQuad.frustumCulled = false;


export function sgn(x) {
    if (x > 0.0) return 1.0;
    if (x < 0.0) return -1.0;
    return 0.0;
}


/**
* Calculates and returns a projection matrix whose near plane is aligned with the portal's surface
* @param {THREE.Matrix4} cameraWorldMatrix
* @param {THREE.Matrix4} cameraWorldMatrixInverse
* @param {THREE.Matrix4} cameraProjectionMatrix
* @param {number} offsetAmount
* @param {number} cutoff
* @returns {THREE.Matrix4}
*/
function getAlignedProjectionMatrix(
    mesh,
    cameraWorldMatrix,
    cameraWorldMatrixInverse,
    cameraProjectionMatrix,
    offsetAmount = 0.05,
    cutoff = 0.008
) {
    // Align near plane of camera's projection matrix to portal frame
    // Souce: http://www.terathon.com/lengyel/Lengyel-Oblique.pdf
    const cameraPos = new THREE.Vector3();
    const portalPos = new THREE.Vector3();
    const rotation = new THREE.Quaternion();
    mesh.getWorldQuaternion(rotation);
    mesh.getWorldPosition(portalPos);
    // Get vector from portal to camera (used to calculate portal normal)
    cameraPos.setFromMatrixPosition(cameraWorldMatrix);
    const portalToCamera = cameraPos.clone().sub(portalPos);

    // Default normal of PlaneGeometry (aka portal) is (0, 0, 1)
    const norm = new THREE.Vector3(0, 0, 1).applyQuaternion(rotation);

    // Determine which side of portal camera is on. If a destination camera is in front of a portal, normal should be reversed
    let clipPlane = new THREE.Plane();

    // Offset position by a little bit so near plane is slightly in behind portal surface
    // Here's the tradeoff: Higher offset values means less artifacts (caused by Z-fighting), but means that objects directly behind portal need to be further away
    const dot = norm.dot(portalToCamera);
    const side = dot > 0 ? 1 : -1;
    norm.multiplyScalar(-1 * side);
    // Shrink offset so it remains just in front of camera (when camera is really close)
    // This allows us to squeeze a bit more distance out of the offset oblique proj matrix before just using the normal camera proj matrix
    const dist = Math.abs(dot);
    let adjustedOffset = Math.min(offsetAmount, dist * 0.5);
    if (
        mesh.parent.globalCollisionBox.containsPoint(cameraPos) &&
        adjustedOffset < cutoff
    ) {
        // If cam is in front of portal and offset gets below this value just use normal projection matrix since just using adjustedOffset still results in flickering
        return cameraProjectionMatrix;
    }
    portalPos.add(norm.clone().multiplyScalar(-adjustedOffset));

    clipPlane.setFromNormalAndCoplanarPoint(norm, portalPos);
    clipPlane.applyMatrix4(cameraWorldMatrixInverse);
    clipPlane = new THREE.Vector4(
        clipPlane.normal.x,
        clipPlane.normal.y,
        clipPlane.normal.z,
        clipPlane.constant
    );
    const newProjectionMatrix = cameraProjectionMatrix.clone();
    const q = new THREE.Vector4();
    q.x =
        (sgn(clipPlane.x) + newProjectionMatrix.elements[8]) /
        newProjectionMatrix.elements[0];
    q.y =
        (sgn(clipPlane.y) + newProjectionMatrix.elements[9]) /
        newProjectionMatrix.elements[5];
    q.z = -1.0;
    q.w =
        (1.0 + newProjectionMatrix.elements[10]) /
        newProjectionMatrix.elements[14];

    const m3 = clipPlane.multiplyScalar(2.0 / clipPlane.dot(q));
    newProjectionMatrix.elements[2] = m3.x;
    newProjectionMatrix.elements[6] = m3.y;
    newProjectionMatrix.elements[10] = m3.z + 1.0;
    newProjectionMatrix.elements[14] = m3.w;

    return newProjectionMatrix;
}


export function recursivePortalRender(
    renderer,
    camera,
    scene,
    portalMeshGroup,
    portals,
    cameraWorldMatrix,
    cameraWorldMatrixInverse,
    cameraProjectionMatrix,
    manualMaxPortalRecursion,
    recursionLevel, skipPortal = null) {

    //renderer.render(scene, camera)
    const gl = renderer.getContext();
    // Enable writing to depth/color buffers
    gl.colorMask(false, false, false, false);
    // Enable stencil
    gl.enable(gl.STENCIL_TEST);
    // Disable writing to stencil
    gl.stencilMask(0);
    // Only draw in areas where stencil value == recursionLevel
    gl.stencilFunc(gl.EQUAL, recursionLevel, 0xff);
    // Enable depth testing
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
    gl.depthMask(true);

    let hide = []
    portalMeshGroup.children.forEach(el => {

        let obj = scene.getObjectByName(el.userData.destinationName, true);
        if (!obj && el.userData.sceneName !== scene.name) //scene.name 
            hide.push(el)
    })

    // Render each portal to depth buffer
    draw(
        renderer,
        portalMeshGroup,
        cameraWorldMatrix,
        cameraProjectionMatrix,
        hide //portalMeshGroup
        //skipPortal ? [skipPortal.mesh] : undefined
    );

    gl.colorMask(true, true, true, true);

    // Render scene (minus portals)

    draw(
        renderer,
        scene,
        //scene,
        cameraWorldMatrix,
        cameraProjectionMatrix
        //portalMeshGroup.children
    );

    let mrl = manualMaxPortalRecursion ? manualMaxPortalRecursion : maxPortalRecursion
    // Base case - max recursion level reached
    if (recursionLevel === mrl) return;

    // Update frustum
    const projScreenMatrix = cameraWorldMatrixInverse
        .clone()
        .premultiply(cameraProjectionMatrix);
    const frustum = new THREE.Frustum();
    frustum.setFromProjectionMatrix(projScreenMatrix);

    ////

    for (let i = 0; i < portals.length; i++) {
        const portal = portals[i];

        if (portal === skipPortal) continue;

        // Check if portal is visible from camera. If not, skip it
        if (frustumCullPortals && !frustum.intersectsObject(portal.mesh)) {
            continue;
        }

        // Increment stencil buffer within visible portal frame
        gl.enable(gl.DEPTH_TEST);
        gl.colorMask(false, false, false, false);
        gl.stencilMask(0xff);
        gl.depthMask(false);
        gl.stencilFunc(gl.EQUAL, recursionLevel, 0xff);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.INCR);
        gl.depthFunc(gl.EQUAL);
        draw(renderer, portal.mesh, cameraWorldMatrix, cameraProjectionMatrix);

        // Clear depth buffer within portal frame (where stencil buffer was just incremented)
        gl.stencilMask(0);
        gl.stencilFunc(gl.EQUAL, recursionLevel + 1, 0xff);
        gl.depthMask(true);
        gl.depthFunc(gl.ALWAYS);


        draw(renderer,
            fullScreenQuad,
            orthographicCamera.matrixWorld,
            orthographicCamera.projectionMatrix
        );

        let portalScene = scene.parent.getObjectByName(portal.sceneName, true);
        let destination = scene.getObjectByName(portal.destinationName, true);
        let destScene = scene.parent.getObjectByName(portal.destinationScene, true);

        let destinationPortal = portals.filter(el => el.mesh.name == portal.destinationName)[0]

        // Now generate view matrix for portal destination
        if (portal.portal.destinationTransform) {

            const destWorldMatrix = portal.portal.destinationTransform
                .clone()
                .multiply(cameraWorldMatrix);
            const destWorldMatrixInverse = destWorldMatrix.clone().invert();


            // if(!destination){
            //   console.log("NULL: ",portalScene)
            // }

            // Render from destination view 
            if (destination && portalScene) {
                recursivePortalRender(
                    renderer, camera,
                    portalScene,
                    portalMeshGroup,
                    portals,
                    destWorldMatrix,
                    destWorldMatrixInverse,
                    portalObliqueViewFrustum
                        ? getAlignedProjectionMatrix(
                            destination,
                            destWorldMatrix,
                            destWorldMatrixInverse,
                            cameraProjectionMatrix,
                            destinationNearPlaneOffset,
                            destinationObliqueCutoff
                        )
                        : cameraProjectionMatrix,
                    manualMaxPortalRecursion,
                    recursionLevel + 1,
                    destination // We can skip rendering the portal destination when drawing from its perspective
                )
            } else {
                recursivePortalRender(
                    renderer, camera,
                    destScene,
                    portalMeshGroup,
                    portals,
                    destWorldMatrix,
                    destWorldMatrixInverse,
                    portalObliqueViewFrustum
                        ? getAlignedProjectionMatrix(
                            destinationPortal.mesh,
                            destWorldMatrix,
                            destWorldMatrixInverse,
                            cameraProjectionMatrix,
                            destinationNearPlaneOffset,
                            destinationObliqueCutoff
                        )
                        : cameraProjectionMatrix,
                    manualMaxPortalRecursion,
                    recursionLevel + 1,
                    portal.mesh // We can skip rendering the portal destination when drawing from its perspective
                )
            }

            // Now we decrement stencil buffer to cleanup the incremented values.
            // This is necessary so stencil values relative to this portal are reset for the next portal in the for-loop

            // Disable color writing
            gl.colorMask(false, false, false, false);
            gl.disable(gl.DEPTH_TEST);
            gl.depthMask(false);
            // // Enable stencil test/writing
            gl.enable(gl.STENCIL_TEST);
            // if(recursionLevel>0)
            gl.stencilMask(0xff);
            // // Fail when inside this portals frame
            gl.stencilFunc(gl.NOTEQUAL, recursionLevel + 1, 0xff);
            // // Decrement regardless of depth test
            gl.stencilOp(gl.DECR, gl.KEEP, gl.KEEP);

            draw(renderer, portal.mesh, cameraWorldMatrix, cameraProjectionMatrix);
        }

    }


    ///

    // Reset values
    gl.colorMask(true, true, true, true);
    gl.depthFunc(gl.LESS);
    gl.depthMask(true);
    gl.disable(gl.STENCIL_TEST);
    gl.enable(gl.DEPTH_TEST);
    gl.stencilMask(0);
}

function draw(_renderer, object, cameraWorldMatrix, cameraProjectionMatrix, hideObjects) {
    // NOTE: no need to manually update camera.matrixWorldInverse since the renderer will automatically do that
    _tempCamera.matrixWorld.copy(cameraWorldMatrix);

    _tempCamera.projectionMatrix = cameraProjectionMatrix;
    _tempCamera.projectionMatrixInverse
        .copy(cameraProjectionMatrix)
        .invert();

    // Set visible = false for objects in 'hideObjects'
    if (hideObjects !== undefined && hideObjects[0]) {
        for (let i = 0; i < hideObjects.length; i++) {
            //if (hideObjects[i].visible === true)

            if (hideObjects[i].type == 'Mesh') {
                hideObjects[i].material.visible = false
            }
            // Any objects already invisible will have visible = true when this function returns
            // console.warn(
            //   "Object in 'hideObjects' is already hidden and will unhidden by _draw call"
            // );
            hideObjects[i].visible = false;
        }
    }

    _renderer.render(object, _tempCamera);
    // Reset visible = true for objects in 'hideObjects'
    if (hideObjects !== undefined && hideObjects[0]) {
        for (let i = 0; i < hideObjects.length; i++) {
            if (hideObjects[i].type == 'Mesh') {
                hideObjects[i].material.visible = true
            }
            hideObjects[i].visible = true;
        }
    }
}
