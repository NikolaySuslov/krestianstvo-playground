/*
The MIT License (MIT)
Copyright (c) 2022 Nikolay Suslov and the Krestianstvo.org project contributors.
(https://github.com/NikolaySuslov/krestianstvo/blob/master/LICENSE.md)
*/

import { produce } from 'solid-js/store';
import { createSignal, onMount, onCleanup, Show, lazy, mergeProps, createEffect, untrack, createResource, createRoot, Suspense } from 'solid-js';
import { createLocalStore, Selo, getRandomColor, genID, createQRCode, createLinkForSelo } from 'krestianstvo'

import DefaultAvatar from "../../Objects/DefaultAvatar"
import SeloInfo from "../../Objects/Info"

import { v4 as uuidv4 } from 'uuid';

import { Canvas, useThree, useFrame } from "@krestianstvo/solid-three";
import { OrbitControls } from "solid-drei";
//import { Vector3 } from "three"
//import { WebGLRenderer } from "three/src/renderers/WebGLRenderer";

//import Space from "./IndexRapier"
import Space from "./Space"
import RapierWorld from "../../Objects/Rapier/RapierWorld"
import { loadRapierLib } from "../../Objects/Rapier/RapierLib"


function App(props) {

  const rapierLoad = createRoot(() => { return loadRapierLib() })
  const path = import.meta.url// + props.nodeID;

  const [local, setLocal] = createLocalStore({
    data: {
      type: "App",
      nodeID: props.nodeID,
      properties: {
        initialized: false,
        ticking: false,
        paused: true
      },
      dynamic: [
      ],
      dynamicSelo: [

      ]
    }


  }, props)


  onCleanup(() => {
  });

  // createEffect(()=>{
  //   loadRapierLib()
  // })



  function handleClick(msg) {
    props.selo.sendExtMsg({ msg: msg, id: props.nodeID })
  }

  const [el, setEl] = createSignal(null);
  const [uiEl, setUiEl] = createSignal(null);


  let thisDiv;

	let link = createLinkForSelo(props.selo, { p: props.parameters, d: props.deepCount })

	onMount(() => {
    if(!props.inPortal)
		  createQRCode(thisDiv, link)
	})

  return (
    <>
      <div class={props.inPortal ? "bg-blend-color relative flex h-full p1 m2" : "relative flex"}
        style={{
          border: props.inPortal ? "2px dotted grey" : "",
          width: "fit-content",
          overflow: "hidden"
        }}>

    <Show when={!props.inPortal}>
      <div p2  style={{
        position: 'absolute',
        "z-index": 100,
        background:"rgba(255, 255, 255, 0.7)"

      }}>
				<div pb1 ref={thisDiv} />
				<a href={link} text-center fw300 target="_blank">Link</a>
			</div>
      </Show>

        <Show when={props.inPortal}>
          <div flex-col>
            <div flex>
              <Show when={props.info}>
                <SeloInfo
                  {...props}
                />
              </Show>
            </div>
            <div ref={setUiEl}></div>
          </div>
        </Show>

        <div class={props.inPortal ? "relative p3 m2" : "relative"} ref={setEl} style={{
          border: props.inPortal ? "1px solid grey" : "",
          width: "fit-content"
        }}>

          <Show when={!props.noAvatar}>
            <DefaultAvatar
              {...props}
              el={el}
              uiEl={uiEl}
            // avatarComponent={Avatar}
            />
          </Show>

          <div style={{
            position: "relative"
          }}>
            <span>{rapierLoad.loading && "Loading Rapier Engine..."}</span>
            <div style={{ width: props.inPortal ? "400px" : "100vw", height: props.inPortal ? "400px" : "100vh" }}>
              <Canvas
                camera={{ position: [2, 2, 6] }}
                height={"100%"}
                width={"100%"}
                shadows>
                <RapierWorld
                  selo={props.selo}
                  nodeID={genID("Index" + props.nodeID, path) + "_rapier_"}
                  scene={Space}
                  x={-2}
                />
                {/* <Space selo={props.selo} nodeID={genID("Index" + props.nodeID, path)} /> */}
              </Canvas>
            </div>
          </div>
        </div>
      </div>


    </>
  )

}

export default App;
