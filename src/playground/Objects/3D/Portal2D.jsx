/*
The MIT License (MIT)
Copyright (c) 2022 Nikolay Suslov and the Krestianstvo.org project contributors.
(https://github.com/NikolaySuslov/krestianstvo/blob/master/LICENSE.md)
*/

import { createSignal, onMount, onCleanup, Show, lazy, createMemo, createEffect } from 'solid-js';
import { produce, createStore } from "solid-js/store";
import { createLocalStore, Selo, createQRCode, getRandomColor } from 'krestianstvo'

import { useThree, useFrame } from "@krestianstvo/solid-three";
import * as THREE from "three";

export default function Portal2D(props) {

  const path = import.meta.url// + props.nodeID;

  const [local, setLocal] = createLocalStore({
    data: {
      type: "Node",
      nodeID: props.nodeID,
      properties: {
        initialized: false,
        ticking: false,
        // destination: props.destination,
        doubleSided: props.doubleSided,
        position: props.position ? props.position : [0, 0, 0]
      },
      dynamic: [
      ],
      dynamicSelo: [
      ]
    }
  }, props)


  onCleanup(() => {
  });

  const initialize = () => {
  }


  props.selo.createAction(props.nodeID, "initialize", initialize)



  function PortalComp(props) {

    let plane;
    let border;

    let portal;
    // let box;
    let boxProperties = {}

    // let cv = box.__r3f.root.getState().gl.domElement;

    /**
   * Applies any necessary updates to this portal. This function should be called every frame.
   */

    function update(scene) {
      let box = portal.userData.mesh;
      if (box.localCollisionBox) {
        updateGlobalBoundingBoxes()
      }

      if (box)
        updateDestinationTransform(scene)
    }

    function updateGlobalBoundingBoxes() {
      let box = portal.userData.mesh;
      portal.globalCollisionBox = box.localCollisionBox
        .clone()
        .applyMatrix4(box.matrixWorld);
      box.globalBoundingBox = box.geometry.boundingBox
        .clone()
        .applyMatrix4(box.matrixWorld);
    }

    // TODO: Figure out why this ends up with wrong matrix when called only at initial scene setup (when destination is first set)
    function updateDestinationTransform(scene) {

      let box = portal.userData.mesh;
      let destination = scene.getObjectByName(props.destination, true);

      if (destination == undefined) {
        portal.destinationTransform = null;
        return;
      }

      portal.destinationTransform = new THREE.Matrix4().makeRotationY(Math.PI);
      portal.destinationTransform.premultiply(destination.matrixWorld);
      portal.destinationTransform.multiply(box.matrixWorld.clone().invert());
    }


    useThree((state) => {

      // console.log("State: ", portal)
      if (state && portal) {

        portal.userData.mesh = plane;
        let box = portal.userData.mesh;

        box.name = local.data.nodeID;
        //box.destination = destination
        props.setPortal(
          produce((s) => {

            if (s.filter(el => el.mesh.name == box.name) == 0)
              s.push({
                mesh: box,
                destinationName: props.destination,
                sceneName: portal.parent.name,//props.sceneName,
                portal: portal,
                destinationScene: props.destinationScene
              })
          }))

       // console.log("Dest: ", props.destination)
        box.geometry.computeBoundingBox();
        const size = new THREE.Vector3();
        box.geometry.boundingBox.getSize(size);
        boxProperties.size = new THREE.Vector2(size.x, size.y);

        box.localCollisionBox = new THREE.Box3(
          box.geometry.boundingBox.min,
          box.geometry.boundingBox.max
        );

        box.localCollisionBox.expandByPoint(new THREE.Vector3(0, 0, -2));
        box.localCollisionBox.expandByPoint(new THREE.Vector3(0, 0, 2));


      }

    })

    useFrame((state, delta) => {

      if (state && portal) {
        update(state.scene)
        if (portal.parent.name !== props.currentSceneOnView()?.name) {
          plane.material.visible = true
        } else
          if (portal.parent.name == props.currentSceneOnView()?.name && props.destinationScene !== portal.parent.name) {//portal.parent.name !== props.sceneName || //props.currentSceneOnView()
            plane.material.visible = false
          }
      }

    })

    function handlePointerEnter(e) {
      // console.log("Enter: ", e)
      border.material.opacity = 0.9

      // props.selo.sendExtMsg({ msg: "avatarEnter", id: "B", params: [props.selo.storeVT.moniker_] })
      // props.selo.sendExtMsg({ msg: "avatarLeave", id: "A", params: [props.selo.storeVT.moniker_] })

    }

    function handlePointerLeave(e) {
      border.material.opacity = 0.5
      // console.log("Leave: ", e)

      // props.selo.sendExtMsg({ msg: "avatarEnter", id: "A", params: [props.selo.storeVT.moniker_] })
      // props.selo.sendExtMsg({ msg: "avatarLeave", id: "B", params: [props.selo.storeVT.moniker_] })

    }
    let b1;
    function handlePortalClick(e) {
      b1.material.color.set("red")
    }

    //onClick={handlePortalClick}
    return (
      <group ref={portal} position={props.position} rotation={props.rotation}>

        <mesh ref={plane} frustumCulled={false} position={[0, 0, 0.11]}>
          <planeGeometry attach="geometry" args={[3.6, 3.6]} />
          <meshBasicMaterial attach="material" color={0xffff00} side={props.doubleSided ? THREE.DoubleSide : THREE.FrontSide} />
        </mesh>

      </group>
    )
  }

  return (
    <PortalComp position={local.data.properties.position} doubleSided={local.data.properties.doubleSided} destination={props.destination} setPortal={props.setPortal} rotation={props.rotation} destinationScene={props.destinationScene} currentSceneOnView={props.currentSceneOnView} selo={props.selo} />
  )
}
