/*
The MIT License (MIT)
Copyright (c) 2022 Nikolay Suslov and the Krestianstvo.org project contributors.
(https://github.com/NikolaySuslov/krestianstvo/blob/master/LICENSE.md)
*/

import { createSignal, onMount, Show, onCleanup, createEffect } from 'solid-js';
import { createStore, unwrap, produce } from "solid-js/store";
import { genID, createLocalStore, Selo, createQRCode, createLinkForSelo, getRandomColor } from "krestianstvo"

import DefaultAvatar from "../../Objects/DefaultAvatar"

import { v4 as uuidv4 } from 'uuid';

import Styles from '../../Web/Styles'

import { KDirectionalLight } from "../../Objects/ThreeJS/KDirectionalLight";
import { KMesh } from "../../Objects/ThreeJS/KMesh"
import { KPerspectiveCamera } from "../../Objects/ThreeJS/KPerspectiveCamera"
import { KScene } from "../../Objects/ThreeJS/KScene"


function Controls(props) {


  const camera = props.selo.getNodeByID(props.nodeID)

  const handleXDeltaOffset = (value) => {
    props.selo.sendExtMsg({ msg: "setProperty", id: props.nodeID, params: ["xDeltaOffset", parseInt(value.target.value)] })

  }

  const handleYDeltaOffset = (value) => {
    props.selo.sendExtMsg({ msg: "setProperty", id: props.nodeID, params: ["yDeltaOffset", parseInt(value.target.value)] })
  }

  function handleClick(msg) {
    props.selo.sendExtMsg({ msg: msg[0], id: props.nodeID, params: msg[1] })
  }

  const [elCam, setElCam] = createSignal(null);
  const [elGrid, setElGrid] = createSignal(null);

  onMount(() => {
  })

  const changeDisplayGrid = () => {
    let display = props.selo.storeNode.clients.length == 1 ? "default" : elCam().options[elCam().selectedIndex].value
    if (display == "default") {
      elCam().value = display
    }
    handleClick(["setDisplay", display])
  }

  return (
    <>

      <select ref={setElGrid} onchange={
        [handleClick, ["setGrid", [elGrid().options[elGrid().selectedIndex].value,
        props.selo.storeNode.clients.indexOf(props.selo.storeVT.moniker_)]]]}>
        <For each={camera.data.cameraMaps}
        >
          {(item) =>
            <Switch>
              <Match when={item == camera.data.properties.displayGrid}>
                <option selected="selected" value={item}>{item}</option>
              </Match>
              <Match when={item !== camera.data.properties.displayGrid}>
                <option value={item}>{item}</option>
              </Match>
            </Switch>

          }
        </For>
      </select>

      <select ref={setElCam} onchange={
        [handleClick, ["setDisplay", elCam().options[elCam().selectedIndex].value]]}>
        <option value="default">default</option>
        <For each={props.selo.storeNode.clients}
        >
          {(item) =>
            <Switch>
              <Match when={item == props.selo.storeVT.moniker_}>
                <option selected="selected" value={props.selo.storeNode.clients.indexOf(item)}>{props.selo.storeNode.clients.indexOf(item)}</option>
              </Match>
              <Match when={item !== props.selo.storeVT.moniker_}>
                <option value={props.selo.storeNode.clients.indexOf(item)}>{props.selo.storeNode.clients.indexOf(item)}</option>
              </Match>
            </Switch>

          }
        </For>
      </select>

      <br />
      <span>xDeltaOffset: {camera.data.properties.xDeltaOffset}</span>
      <input type="range" min="-200" max="200" value={camera.data.properties.xDeltaOffset?.toString()} step="1" onInput={handleXDeltaOffset} />
      <br />
      <span>yDeltaOffset: {camera.data.properties.yDeltaOffset}</span>
      <input type="range" min="-200" max="200" value={camera.data.properties.yDeltaOffset?.toString()} step="1" onInput={handleYDeltaOffset} />

    </>)
}

function App(props) {

  const path = import.meta.url// + props.nodeID;

  const { buttonGreen, smallButton, buttonRed } = Styles

  const uiComponents = {
    controls: Controls
  }

  const [local, setLocal] = createLocalStore({
    data: {
      type: "App",
      nodeID: props.nodeID,
      properties: {
        ticking: false,
        initialized: false,
        cameraWidth: 480,//720,
        cameraHeight: 360, //480,
        editMode: props.editMode ? props.editMode : false,
        gridIndex: props.gridIndex ? props.gridIndex : null
      },
      dynamic: [
      ],
      dynamicSelo: [

      ],
      meshes: [
        // {
        //   nodeID: genID("Box1" + props.nodeID, path),
        //   rotation: [45, 0, 0],
        //   position: [-2, 0.5, 0]
        // }
      ]
    }
  }, props)

  const [controlsUI, setControlsUI] = createStore({
    controls: []
  })

  let qrDiv;

  let link = createLinkForSelo(props.selo)

  onMount(() => {
    if (local.data.properties.editMode)
      createQRCode(qrDiv, link)
  });

  onCleanup(() => {
  });


  const step = (tick) => {
    // step on tick
  }

  const initialize = () => {

  }


  createEffect(() => {
    setControlsUI(produce((s) => {
      s.controls = []
      props.selo.storeNode.clients.forEach(el => {
        s.controls.push({ id: "Camera_" + el, component: "controls" })
      })
    }))
  })

  const createControls = (id) => {
    console.log("Init controls for Camera ", id)

    if (controlsUI.controls.filter(el => el.id == id).length == 0)
      setControlsUI("controls", n =>
        [{ id: id, component: "controls" }, ...n])

  }

  createEffect(() => {

    let sceneID = genID("Scene" + props.nodeID, path)

    local.data.meshes.forEach(mesh => {
      props.selo.callAction(sceneID, "addMesh", mesh)
    })

  })

  const createMeshes = (value) => {
    let c = value[0]
    const prev = unwrap(local.data.meshes).length || 0;

    setLocal(produce((s) => {

      if (prev < c) {
        s.data.meshes.push(
          ...Array(c - prev)
            .fill()
            .map(() => {
              return {
                nodeID: props.selo.randomID(),
                rotation: [props.selo.randomInt(0, 360), props.selo.randomInt(0, 360), props.selo.randomInt(0, 360)],
                position: [props.selo.randomInt(-10, 10), props.selo.randomInt(-10, 10), props.selo.randomInt(-4, -30)],
                scale: [1, 1, 1],
                animationRate: props.selo.randomInt(1, 3) / 200,
                geometry: [props.selo.random() * 10, props.selo.randomInt(1, 3), props.selo.randomInt(1, 5)],
                color: getRandomColor(props.selo)

              }
            })
        )
      } else {
        s.data.meshes.length = c
      }
    }))
  }

  props.selo.createAction(props.nodeID, "initialize", initialize)
  props.selo.createAction(props.nodeID, "step", step)
  props.selo.createAction(props.nodeID, "createControls", createControls)
  props.selo.createAction(props.nodeID, "createMeshes", createMeshes)


  function handleClick(msg) {
    props.selo.sendExtMsg({ msg: msg[0], id: props.nodeID, params: [msg[1]] })
  }

  function handleClickWithID(msg) {
    msg[1][1].onlyMe = props.selo.storeVT.moniker_
    props.selo.sendExtMsg({ msg: msg[0], id: msg[1][0], params: msg[1][1] })
  }

  function handleSlider(value) {
    props.selo.sendExtMsg({ msg: "createMeshes", id: props.nodeID, params: parseInt(value.target.value) })

  }

  const [el, setEl] = createSignal(null);

  function handleEditMode(value) {
    props.selo.sendExtMsg({ msg: "setProperty", id: props.nodeID, params: ["editMode", value] })
  }


  const [elCam, setElCam] = createSignal(null);

  return (

    <>
      <div class="relative" ref={setEl} style={{
        // width: "480px",
        // height: "360px",

        border: "0.5px solid grey",
        width: "fit-content"
      }}>


        <Show when={!props.noAvatar}>
          <DefaultAvatar
            {...props}
            el={el}
            scale={0.3}
          //uiEl={uiEl}
          />
        </Show>

        <div absolute top-5>
          <div>
            <div ref={qrDiv} />
            <a href={link} text-center fw300 target="_blank">Link</a>
            <br />
            <Switch>
              <Match when={!local.data.properties.editMode}>
                <button onClick={[handleEditMode, true]}>e</button>
              </Match>
              <Match when={local.data.properties.editMode}>
                <button onClick={[handleEditMode, false]}>e</button>
              </Match>
            </Switch>
          </div>

          <Show when={local.data.properties.editMode}>

            {/* <button class={smallButton()} onClick={
          [handleClickWithID, ["switchCamera", [ genID("Scene" + props.nodeID, path), {camera: "defaultCamera" }]]]}>Switch camera</button> */}

            <select ref={setElCam} onchange={
              [handleClickWithID, ["switchCamera", [genID("Scene" + props.nodeID, path), { camera: elCam().options[elCam().selectedIndex].value }]]]}>
              <option value="defaultCamera"></option>
              <option value="defaultCamera">Default Camera</option>
              <For each={props.selo.storeNode.clients}
                fallback={<div>Loading...</div>}>
                {(item) =>
                  <option value={"Camera_" + item}>{"Camera_" + item}</option>
                }
              </For>
            </select>

            <For each={controlsUI.controls}>
              {(item) =>
                <div p1>
                  <Switch>
                    <Match when={item.id.includes(props.selo.storeVT.moniker_)}>
                      <Dynamic component={uiComponents[item.component]}
                        nodeID={item.id}
                        selo={props.selo}
                      />
                    </Match>
                  </Switch>
                </div>
              }
            </For>
            {/* <Show when={local.data.properties.editMode}> */}
            <div class="p4">
              <input type="range" min="0" max="50" value={unwrap(local.data.meshes.length).toString()} step="1" onInput={handleSlider} />
              Meshes: {unwrap(local.data.meshes.length)}
            </div>
          </Show>
        </div>
        <div>

          <KScene el={el} selo={props.selo} nodeID={genID("Scene" + props.nodeID, path)}
            appID={props.nodeID}>
            {/* <KPerspectiveCamera location={[0, 1, 5]} el={el} nodeID={"defaultCamera"} selo={props.selo} />  */}
            <For each={props.selo.storeNode.clients}
              fallback={<div>Loading...</div>}>
              {(item) =>
                <Dynamic
                  component={KPerspectiveCamera} //{components["Avatar"]}
                  nodeID={"Camera_" + item}
                  el={el}
                  selo={props.selo}
                  moniker_={props.selo.storeVT.moniker_}
                  location={[0, 1, 5]}
                  rotation={[0, 0, 0]}
                  appID={props.nodeID}
                  multicam={true}
                  displayGrid={"2x2"}
                  width={local.data.properties.cameraWidth}
                  height={local.data.properties.cameraHeight}
                  gridID={props.gridID}
                  gridIndex={props.gridIndex}
                />
              }
            </For>

            <KDirectionalLight direction={[0, 5, 10]} selo={props.selo} nodeID={genID("Light1" + props.nodeID, path)} />

            <KMesh color={"red"} geometry={[2, 2, 2]} rotation={[45, 0, 0]} position={[-2, 0.5, 0]} selo={props.selo} nodeID={genID("Box1" + props.nodeID, path)} />
            <KMesh color={"blue"} geometry={[2, 2, 2]} rotation={[0, 45, 0]} position={[2, 0.5, 0]} selo={props.selo} nodeID={genID("Box2" + props.nodeID, path)} />
            <KMesh color={"green"} geometry={[2, 2, 2]} rotation={[0, 0, 45]} position={[0, 2, 1]} selo={props.selo} nodeID={genID("Box3" + props.nodeID, path)} />



            <For each={local.data.meshes}>
              {(item) =>
                <Dynamic
                  component={KMesh} //{components["Avatar"]}
                  nodeID={item.nodeID}
                  selo={props.selo}
                  color={item.color}
                  geometry={item.geometry}
                  rotation={item.rotation}
                  position={item.position}
                  scale={item.scale}
                  animationRate={item.animationRate}
                />
              }
            </For>
          </KScene>


        </div>
      </div>
    </>
  )
}

export default App;
