/*
The MIT License (MIT)
Copyright (c) 2022 Nikolay Suslov and the Krestianstvo.org project contributors.
(https://github.com/NikolaySuslov/krestianstvo/blob/master/LICENSE.md)
*/


import { createSignal, onMount, onCleanup, Show, lazy, mergeProps, createEffect, untrack, createResource, createRoot } from 'solid-js';
import { createLocalStore, Selo, createQRCode, getRandomColor, genID } from 'krestianstvo'

import DefaultAvatar from "../../Objects/DefaultAvatar"
import SeloInfo from "../../Objects/Info"

import { v4 as uuidv4 } from 'uuid';

import { Canvas, useThree, useFrame } from "@krestianstvo/solid-three";
import { OrbitControls } from "solid-drei";
//import { Vector3 } from "three"
//import { WebGLRenderer } from "three/src/renderers/WebGLRenderer";

import Space from "./Index3D"
import RAPIER from '@dimforge/rapier3d-compat';
import { CoefficientCombineRule, ColliderDesc, RigidBody, RigidBodyDesc, World, EventQueue, Vector3 } from '@dimforge/rapier3d-compat';

// const phys = {
// }

const [rap, srap] = createSignal(null)

const rapier = async () => {
  await RAPIER.init().then(() => {
    console.log("Init RAPIER: ", RAPIER);

    srap(true)

  })
}

rapier()

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

      ],
      rapierWorldState: []
    }


  }, props)


  onCleanup(() => {
  });



  //const [phys] = createResource(rapier);

  const postInitialize = () => {
    initRapier()
  }

  const initialize = () => {

    //conosle.log(Initialize)

  }


  const rotate = () => {
    setLocal("data", "properties", "angle", (a) => { return [a[0], a[1] + 0.1, a[2]] })
  }

  const step = (tick) => {

    if (!local.data.properties.paused) {
      //rotate()
    }
  }

  const setRandomColor = () => {

    let newColor = getRandomColor(props.selo)
    setLocal("data", "properties", "color", newColor);

  }

  props.selo.createAction(props.nodeID, "postInitialize", postInitialize)
  props.selo.createAction(props.nodeID, "initialize", initialize)
  props.selo.createAction(props.nodeID, "step", step)
  props.selo.createAction(props.nodeID, "setRandomColor", setRandomColor)



  onMount(() => {

    console.log("RAPIER: ", RAPIER)

  })

  function Box(props) {
    let box;

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
    //return (<perspectiveCamera position = {[2, 2, 2]} rotation={[-45, 0, 0]} />)
  }


  const [resume, setResume] = createSignal(false);
  const [rapierData, setRapierData] = createSignal({});

  const initRapier = () => {
    //    const rap = phys()

    console.log("Init Rapier world!")
    const events = new EventQueue(true)

    const obj = {}
    const gravity = new Vector3(0.0, -9.81, 0.0);

    if (local.data.rapierWorldState.length == 0) {
      const world = new World(gravity)
      Object.assign(obj, {
        rapier: RAPIER,
        world: world,
        events: events,
        restored: false
        //physicsWorld: physicsWorld
      })
      console.log("First Init physics: ", obj.world)

      setResume(true)
      setRapierData(obj)
    } else {



      const world = World.restoreSnapshot(local.data.rapierWorldState)
      Object.assign(obj, {
        rapier: RAPIER,
        world: world,
        events: events,
        restored: true
        //physicsWorld: physicsWorld
      })



      console.log("World state:", local.data.rapierWorldState)
      console.log("RESTORE from snapshot physics: ", obj.world)

      setResume(true)
      setRapierData(obj)
    }


    // setResume(true)
    // setRapierData(obj)

    props.selo.setStoreVT("rapierWorld", obj.world)//rapierData().world)

  }


  function Physics(props) {

    return (<>
      {/* <Show when={props.selo.storeVT.stateSynced == true && resume() == true && rapierData().rapier}>  */}
      <Space {...props} rapier={rapierData()} />
      {/* </Show>  */}
    </>)

  }

  function MyCameraReactsToStateChanges(props) {
    let pos = props.pos
    useFrame(state => {
      //console.log("State: ", state, 'pos: ', pos)
      // state.camera.lerp({ x, y, z }, 0.1)
      // state.camera.lookAt(0, 0, 0)
    })
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

          {/* <Show when={!props.noAvatar}>
          <DefaultAvatar
            {...props}
            el={el}
            uiEl={uiEl}
           // avatarComponent={Avatar}
          />
          </Show> */}

          <div style={{
            position: "relative"
          }}>
            <Physics selo={props.selo} nodeID={genID("Rapier" + props.nodeID, path)} 
            parameters={props.parameters}
             />
          </div>
        </div>
      </div>
    </>
  )
}
export default App;
