/*
The MIT License (MIT)
Copyright (c) 2022 Nikolay Suslov and the Krestianstvo.org project contributors.
(https://github.com/NikolaySuslov/krestianstvo/blob/master/LICENSE.md)
*/

import { createSignal, onMount, onCleanup, Show, lazy, createMemo, createEffect } from 'solid-js';
import { produce, createStore } from "solid-js/store";
import { createLocalStore, Selo, createQRCode, getRandomColor } from 'krestianstvo'

import RoundedBox from '../Fiber/RoundedBox'
import Button3D from '../Fiber/Button3D'


import { useThree, useFrame } from "@krestianstvo/solid-three";
import * as THREE from "three";

export default function Window3D(props) {

  const path = import.meta.url// + props.nodeID;

  const [local, setLocal] = createLocalStore({
    data: {
      type: "Node",
      nodeID: props.nodeID,
      properties: {
        initialized: false,
        ticking: false,
        position: props.position ? props.position : [0, 0, 0],
        rotation: props.rotation ? props.rotation : [0, 0, 0],
        scale: props.scale ? props.scale : [1, 1, 1]
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

  let window
  let contents
  let border


  useThree((state) => {

    if (state && window && border) {
      window.name = local.data.nodeID
      // border.visible = false
    }
  })

  useFrame((state, delta) => {

    if (state && window && props.portal) {
      let portalObj = state.scene.getObjectByName(props.portal, true);
      portalObj?.position.copy(window.position);
      portalObj?.quaternion.copy(window.quaternion);
    }

    if (state && window && props.portalWindow) {

      let portalWindow = state.scene.getObjectByName(props.portalWindow, true);
      if (portalWindow) {
        window.position.copy(portalWindow.position);
        window.quaternion.copy(portalWindow.quaternion);
      }
    }
  })


  function handlePointerEnter(e) {
   // console.log("Enter: ", e)
    border.material.opacity = 0.9
  }

  function handlePointerLeave(e) {
   // console.log("Leave: ", e)
    border.material.opacity = 0.5
  }

  let b1
  function handlePortalClick(e) {
    b1.material.color.set("red")
  }

  //onClick={handlePortalClick}

  return (
    <group ref={window} position={local.data.properties.position} rotation={local.data.properties.rotation}
      scale={local.data.properties.scale}>

      <group>
        {/* <Button3D ref={b1} width={0.2} height={0.2} color={"green"} opacity={0.8} position={[-1.6, 2.3, 0]} onClick={handlePortalClick} />
        <Button3D width={0.4} height={0.2} color={"#4447ad"} opacity={0.8} position={[1.6, 2.3, 0]} /> */}
        {/* <Button3D width={0.1} height={0.2} color={"#d9e62e"} opacity={0.6} position={[0, 2.4, 0]} /> */}
      </group>

      <RoundedBox ref={border} width={4} height={4} depth={0.2} radius={0.1} steps={1} smoothness={5} color={"#0a6aad"} opacity={0.5} onPointerEnter={handlePointerEnter} onPointerLeave={handlePointerLeave} position={[0, 0, -0.11]} />
      {props.children}
      {/* <Dynamic ref={contents} component={props.contents ? props.contents : Button3D} {...props} />  */}

    </group>
  )
}
