import { createSignal, onCleanup, createMemo, createEffect } from 'solid-js';
import { Mesh, Shape, ExtrudeGeometry,  MeshBasicMaterial, MeshPhysicalMaterial } from 'three'


const eps = 0.00001

function createShape(width, height, radius0) {
    const shape = new Shape()
    const radius = radius0 - eps
    shape.absarc(eps, eps, eps, -Math.PI / 2, -Math.PI, true)
    shape.absarc(eps, height - radius * 2, eps, Math.PI, Math.PI / 2, true)
    shape.absarc(width - radius * 2, height - radius * 2, eps, Math.PI / 2, 0, true)
    shape.absarc(width - radius * 2, eps, eps, 0, -Math.PI / 2, true)
    return shape
  }

    //<RoundedBox width = {1} height = {1} depth = {1} radius = {0.05} steps = {1} smoothness = {4} color={0x00ff00}/>

  export default function RoundedBox(props) {

    let ref;
    const extrudeSettings = {
        depth: props.depth - props.radius * 2,
        bevelEnabled: true,
        bevelSegments: props.smoothness * 2,
        steps: props.steps,
        bevelSize: props.radius - eps,
        bevelThickness: props.radius,
        curveSegments: props.smoothness,
      }
    const shape = createShape(props.width, props.height, props.radius)
    const geometry = new ExtrudeGeometry( shape, extrudeSettings );
    const material = new MeshPhysicalMaterial( { color: props.color, opacity: props.opacity, transparent: true } );
    geometry.center()
//castShadow
    return (
        <mesh {...props} ref={ref} geometry={geometry} material={material}  >
        </mesh>
      )

  }

