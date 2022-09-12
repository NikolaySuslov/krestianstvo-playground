
/*
The MIT License (MIT)
Copyright (c) 2022 Nikolay Suslov and the Krestianstvo.org project contributors.
(https://github.com/NikolaySuslov/krestianstvo/blob/master/LICENSE.md)
*/

import { createSignal, onMount, onCleanup, Show, lazy, createMemo, createEffect } from 'solid-js';
import { createLocalStore, Selo, createQRCode, getRandomColor } from 'krestianstvo'
import Avatar from "../../Objects/Avatar"
import { v4 as uuidv4 } from 'uuid';

import DefaultAvatar from "../../Objects/DefaultAvatar"
import SeloInfo from "../../Objects/Info"

import { Canvas, useThree, useFrame } from "@krestianstvo/solid-three";

import { OrbitControls } from "../../Objects/Fiber/OrbitControls"

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
        color: 'green',
        ticking: true,
        paused: false,
        angle: [0, 0, 0]
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

  const rotate = () => {
    setLocal("data", "properties", "angle", (a) => { return [a[0], a[1] + 0.1, a[2]] })
  }

  const step = (tick) => {

    if (!local.data.properties.paused) {
      rotate()
    }
  }

  const setRandomColor = () => {

    let newColor = getRandomColor(props.selo)
    setLocal("data", "properties", "color", newColor);

  }

  props.selo.createAction(props.nodeID, "initialize", initialize)
  props.selo.createAction(props.nodeID, "step", step)
  props.selo.createAction(props.nodeID, "setRandomColor", setRandomColor)



  onMount(() => {
  })


  function Box(props) {
    let box;

    // let cv = box.__r3f.root.getState().gl.domElement;

    // useThree((state)=>{
    //   console.log("State: ",box)
    //  })

    // useFrame(()=>{
    // })

    const handleBoxClick = () => {
      props.selo.sendExtMsg({ msg: "setRandomColor", id: props.nodeID, params: [] })
    }

    return (
      <mesh position={[-1, 0.5, 0]} ref={box} castShadow onClick={handleBoxClick}>
        <boxBufferGeometry />
        <meshStandardMaterial color={props.color} />
      </mesh>
    )
  }

  function MyCameraReactsToStateChanges(props) {
    // useFrame(state => {
    // })
  }


  function handlePause(value) {
    props.selo.sendExtMsg({ msg: "setProperty", id: props.nodeID, params: ["paused", value] })
  }

  function handleClick(msg) {
    props.selo.sendExtMsg({ msg: msg, id: props.nodeID })
  }

  const [el, setEl] = createSignal(null);
  const [uiEl, setUiEl] = createSignal(null);

  return (
    <>
      <div class="bg-blend-color relative flex h-full p1 m2"
        style={{
          border: "2px dotted grey",
          width: "fit-content"
        }}>
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

        <div class="relative p3 m2" ref={setEl} style={{
          border: "1px solid grey",
          width: "fit-content"
        }}>

          <Show when={!props.noAvatar}>
            <DefaultAvatar
              {...props}
              el={el}
            //avatarComponent={Avatar}
            />
          </Show>

          <div style={{
            position: "relative"
          }}>
            <Suspense>
              <Canvas
                camera={{ position: [2, 2, 2] }}
                height={"300px"}
                width={"300px"}
                shadows
              >
                <color attach="backgroundColor" r={1} g={0} b={0} />
                <MyCameraReactsToStateChanges pos={[0, 0, 0]} />
                <group>
                  <Box {...props} color={local.data.properties.color} />
                  <mesh position={[0.5, 0.5, 0]} rotation={local.data.properties.angle} castShadow
                    onClick={() => { handlePause(!local.data.properties.paused) }}
                  >
                    <boxBufferGeometry />
                    <meshStandardMaterial color={"red"} />
                  </mesh>
                </group>
                <ambientLight />
                <mesh
                  receiveShadow
                  position={[0, 0, 0]}
                  scale={[100, 100, 1]}
                  rotation={[-Math.PI / 2, 0, 0]}
                >
                  <planeGeometry />
                  <meshStandardMaterial color={"white"} />
                </mesh>
                <spotLight castShadow position={[-5, 5, 5]} intensity={1} />

                <OrbitControls makeDefault={true}/>

              </Canvas>
            </Suspense>
          </div>
        </div>
      </div>
    </>
  )
}

export default App;
