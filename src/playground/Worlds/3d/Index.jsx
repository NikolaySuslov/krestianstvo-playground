/*
The MIT License (MIT)
Copyright (c) 2022 Nikolay Suslov and the Krestianstvo.org project contributors.
(https://github.com/NikolaySuslov/krestianstvo/blob/master/LICENSE.md)
*/

import { createSignal, onMount, onCleanup, Show, lazy, createMemo, createEffect, createRoot } from 'solid-js';
import { produce, createStore } from "solid-js/store";
import { createLocalStore, Selo, createQRCode, createLinkForSelo, getRandomColor, genID } from 'krestianstvo'
import Avatar from "../../Objects/Avatar"

import DefaultAvatar from "../../Objects/DefaultAvatar"
import SeloInfo from "../../Objects/Info"

import { Canvas, useThree, useFrame } from "@krestianstvo/solid-three";

import { OrbitControls } from "../../Objects/Fiber/OrbitControls"

import { recursivePortalRender } from '../../Objects/3D/PortalGL';
import AvatarPointer3D from '../../Objects/3D//AvatarPointer3D';

import * as THREE from "three";

import { default as SceneA } from "./SceneA"
import { default as DiceWorld } from "./DiceWorld"

//import { OrbitControls } from "solid-drei";
// import { WebGLRenderer } from "three/src/renderers/WebGLRenderer";

import RapierWorld from "../../Objects/Rapier/RapierWorld"
import { loadRapierLib } from "../../Objects/Rapier/RapierLib"



function App(props) {

  const rapierLoad = createRoot(() => { return loadRapierLib() })

  const path = import.meta.url// + props.nodeID;
  const aID = genID("A" + props.nodeID, path);
  const diceWorldID = genID("DiceWorld" + props.nodeID, path);

  const [local, setLocal] = createLocalStore({
    data: {
      type: "App",
      nodeID: props.nodeID,
      properties: {
        initialized: false,
        ticking: false,
        paused: true,
        defaultScene: props.defaultScene ? props.defaultScene : aID,
        start: props.parameters?.includes("mirror") ? props.parameters : "direct",
        mrl: props.parameters?.includes("mirror") ? 3 : 1
      },
      dynamic: [

        {
          component: "RenderScene",
          nodeID: aID,
          portalSceneName: diceWorldID
        },
        {
          component: "DiceWorld",
          nodeID: diceWorldID,
          portalSceneName: aID
        }
        // {
        //   component: "RenderScene3",
        //   nodeID: "C"
        // }

      ],
      dynamicSelo: [
      ]
    }
  }, props)

  const [currentScene, setCurrentScene] = createSignal(null)
  const [current, setCurrent] = createSignal(local.data.properties.defaultScene)
  const [portals, setPortal] = createStore([]);



  const portalMeshGroup = new THREE.Group();
  portalMeshGroup.matrixAutoUpdate = false;

  createEffect(() => {
    let portalMeshes = [];

    portals.forEach(el => {
      el.mesh.userData.sceneName = el.sceneName
      el.mesh.userData.destinationName = el.destinationName
      el.mesh.userData.destinationScene = el.destinationScene
      portalMeshes.push(el.mesh)

    })

    portalMeshGroup.children = portalMeshes

  })

  let renderPortals = true;

  onCleanup(() => {
  });

  const initialize = () => {
  }


  const postInitialize = () => {
    changeScene(aID)
  }


  const step = (tick) => {

    if (!local.data.properties.paused) {
      //rotate()
    }
  }


  const changeScene = (data) => {
    let sceneName = data[0]
    console.log("Change to: ", sceneName);

    setCurrent(sceneName);

    // props.selo.sendExtMsg({ msg: "avatarEnter", id: sceneName, params: [props.selo.storeVT.moniker_] })
    // local.data.dynamic.forEach(el=>{
    //   if(el.nodeID !== sceneName)
    //     props.selo.sendExtMsg({ msg: "avatarLeave", id: el.nodeID, params: [props.selo.storeVT.moniker_] })
    // })


    // setLocal(
    //   produce((s) => {
    //     s.data.dynamic.forEach(el=>{
    //       el.sceneName == sceneName ?
    //         el.current = true : el.current = false
    //     })

    //   }))

  }

  props.selo.createAction(props.nodeID, "initialize", initialize)
  props.selo.createAction(props.nodeID, "step", step)
  props.selo.createAction(props.nodeID, "postInitialize", postInitialize)
  //props.selo.createAction(props.nodeID, "changeScene", changeScene)


  onMount(() => {
  })


  function MyCameraReactsToStateChanges(props) {
    // useFrame(state => {
    // })

    return (
      <perspectiveCamera
        {...props}
        nearDistance={0.005}
        position={props.position}></perspectiveCamera>
    )
  }


  function handlePause(value) {
    props.selo.sendExtMsg({ msg: "setProperty", id: props.nodeID, params: ["paused", value] })
  }

  function handleClick(msg) {
    props.selo.sendExtMsg({ msg: msg[0], id: props.nodeID, params: [msg[1]] })
  }



  function RenderMain(props) {


    useThree((state) => {
      //console.log("State: ", state)

      if (state) {
        let renderer = state.gl
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.autoClear = false;
        renderer.info.autoReset = false;
      }
    })

    useFrame((state) => {

      const { gl, scene, camera, mouse } = state
      gl.clear()

      if (renderPortals && currentScene()) {
        recursivePortalRender(
          gl,
          camera,
          currentScene(),
          portalMeshGroup,
          portals,
          camera.matrixWorld,
          camera.matrixWorldInverse,
          camera.projectionMatrix,
          local.data.properties.mrl,
          0,
          null
        )
      }

      // gl.render(scene, camera)
    }, props.priority ? props.priority : 1)

  }

  const [el, setEl] = createSignal(null);
  const [uiEl, setUiEl] = createSignal(null);

  function handlePortalClick(e) {
    console.log(e)
  }

  const diceWorldComponent = (props) => {
    return <RapierWorld
      {...props}
      selo={props.selo}
      nodeID={props.nodeID + "_rapier_"}
      scene={DiceWorld}
    />
  }

  const scenes = {
    RenderScene: SceneA,
    DiceWorld: diceWorldComponent
  }

  //[handleClick, ["changeScene", "C"]]

  let thisDiv;

  let link = createLinkForSelo(props.selo, { p: props.parameters, d: props.deepCount })

  onMount(() => {
    if (!props.inPortal)
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
          <div p2 style={{
            position: 'absolute',
            top: "30px",
            "z-index": 100,
            background: "rgba(255, 255, 255, 0.7)"

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
          <div p1 absolute z-100>
            <button onClick={[changeScene, [aID]]}>Enter A World</button>
            <button onClick={[changeScene, [diceWorldID]]}>Enter Dice World</button>
          </div>
          {/* <Show when={!props.noAvatar}>
            <DefaultAvatar
              {...props}
              el={el}
              avatarComponent={Avatar}
            />
          </Show> */}

          <div style={{
            position: "relative"
          }}>
            <span>{rapierLoad.loading && "Loading Rapier Engine..."}</span>
            <div style={{ width: props.inPortal ? "640px" : "100vw", height: props.inPortal ? "480px" : "100vh" }}>
              <Canvas
                camera={{ position: [-5, 4.5, 7] }}
                height={"100%"}
                width={"100%"}
                shadows
              >
                {/* <MyCameraReactsToStateChanges position={[0, 4, 8]}> */}
                {/* <perspectiveCamera position={[0, 3, 4]}></perspectiveCamera> */}

                <For each={local.data.dynamic}>
                  {(item) =>
                    <Dynamic
                      component={scenes[item.component]}
                      nodeID={item.nodeID}
                      sceneName={item.nodeID}
                      current={current() == item.nodeID}
                      set={setCurrentScene}
                      currentSceneOnView={currentScene}
                      selo={props.selo}
                      portals={portals}
                      setPortal={setPortal}
                      rapier={props.rapier}
                      start={local.data.properties.start}
                      portalSceneName={item.portalSceneName}
                    />
                  }
                </For>

                <RenderMain {...props}></RenderMain>

                <OrbitControls ref={orbitRef} minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} enableZoom={false} makeDefault={true} />

              </Canvas>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default App;
