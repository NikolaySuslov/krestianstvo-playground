/*
The MIT License (MIT)
Copyright (c) 2022 Nikolay Suslov and the Krestianstvo.org project contributors.
(https://github.com/NikolaySuslov/krestianstvo/blob/master/LICENSE.md)
*/

import { createSignal, onMount, onCleanup, Show, lazy, createMemo, createEffect, For } from 'solid-js';
import { produce, createStore } from "solid-js/store";
import { createLocalStore, Selo, createQRCode, getRandomColor } from 'krestianstvo'
import Avatar from "../../Objects/Avatar"
import { v4 as uuidv4 } from 'uuid';

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


function App(props) {

  const path = import.meta.url// + props.nodeID;

  const [local, setLocal] = createLocalStore({
    data: {
      type: "App",
      nodeID: props.nodeID,
      properties: {
        initialized: false,
        ticking: false,
        paused: true,
        defaultScene: props.defaultScene ? props.defaultScene : "A"
      },
      dynamic: [

        {
          component: "RenderScene",
          nodeID: "A"
        },
        {
          component: "DiceWorld",
          nodeID: "DiceWorld"
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
    changeScene(["A"])
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

    let mrl = props.start.includes("mirror") ? 5 : 3

    useThree((state) => {
      console.log("State: ", state)

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
          mrl,
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

  const scenes = {
    RenderScene: SceneA,
    DiceWorld: DiceWorld
    // RenderScene3: RenderScene3
  }

  //[handleClick, ["changeScene", "C"]]

  return (
    <>
      <div class="bg-blend-color relative flex h-full p1 m2"
        style={{
          border: "2px dotted grey",
          width: "fit-content"
        }}>
        {/* <div flex-col>
          <div flex>
            <Show when={props.info}>
              <SeloInfo
                {...props}
              />
            </Show>
          </div>
          <div ref={setUiEl}></div>
        </div> */}

        <div class="relative p3 m2" ref={setEl} style={{
          border: "1px solid grey",
          width: "fit-content"
        }}>
          <div p1>
            <button onClick={[changeScene, ["A"]]}>Enter A World</button>
            <button onClick={[changeScene, ["DiceWorld"]]}>Enter Dice World</button>
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
            <Suspense>
              <Canvas
                camera={{ position: [-5, 4.5, 7] }}
                height={"480px"}
                width={"640px"}
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
                      start={props.start}
                    />
                  }
                </For>

                <RenderMain {...props}></RenderMain>

                <OrbitControls ref={orbitRef} minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} enableZoom={false} makeDefault={true} />

              </Canvas>
            </Suspense>
          </div>
        </div>
      </div>
    </>
  )
}

export default App;
