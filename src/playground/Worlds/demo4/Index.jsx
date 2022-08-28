/*
The MIT License (MIT)
Copyright (c) 2022 Nikolay Suslov and the Krestianstvo.org project contributors.
(https://github.com/NikolaySuslov/krestianstvo/blob/master/LICENSE.md)
*/

import { createSignal, onMount, onCleanup, Show } from 'solid-js';
import { genID, createLocalStore, initializeOnMount, getWorldConfig, Selo, addLocalSelo, shortRandomIDInView } from 'krestianstvo'
import Avatar from "../../Objects/Avatar"
import { v4 as uuidv4 } from 'uuid';

import DefaultAvatar from "../../Objects/DefaultAvatar"
import SeloInfo from "../../Objects/Info"

import Counter from './Counter'
import Demo1 from '../demo1/Index'
import Styles from '../../Web/Styles'

function App(props) {

  const path = import.meta.url// + props.nodeID;

  const { buttonGreen, smallButton, buttonRed } = Styles

  const components = {
    Avatar: Avatar,
    Counter: Counter,
    app: App,
    demo1: Demo1
  }

  const [local, setLocal] = createLocalStore({
    data: {
      type: "App",
      nodeID: props.nodeID,
      properties: {
        ticking: false,
        initialized: false,
        scale: props.scale ? props.scale : 1,
        angle: props.angle ? props.angle : 0,
        dc: props.parameters ? props.parameters : 5
      },
      dynamic: [
      ],
      dynamicSelo: [

      ]
    }
  }, props)


  onMount(() => {
    initializeOnMount(props)
  });

  onCleanup(() => {
  });


  const step = (tick) => {
    // step on tick
    changeAngle([])
  }

  const initialize = () => {

  }


  const changeAngle = (val) => {

    setLocal("data", "properties", "angle", c => c + (val[0] ? val[0] : 0.1))

  }

  const changeAngleWithSlider = (val) => {

    setLocal("data", "properties", "angle", (props.angle ? props.angle : 0) + (val[0] ? val[0] : 0.1))

  }

  props.selo.createAction(props.nodeID, "initialize", initialize)
  props.selo.createAction(props.nodeID, "changeAngle", changeAngle)
  props.selo.createAction(props.nodeID, "changeAngleWithSlider", changeAngleWithSlider)
  props.selo.createAction(props.nodeID, "step", step)


  function handleClick(msg) {
    props.selo.sendExtMsg({ msg: msg[0], id: props.nodeID, params: [msg[1]] })
  }

  function handleTicking(value) {
    props.selo.sendExtMsg({ msg: "setProperty", id: props.nodeID, params: ["ticking", value] })
  }

  function handleSlider(value) {
    props.selo.sendExtMsg({ msg: "changeAngleWithSlider", id: props.nodeID, params: [parseFloat(value.target.value), props.selo.id] })

  }

  function handleCreateCounter(value) {
    let id = shortRandomIDInView()
    props.selo.sendExtMsg({ msg: "createNode", id: props.nodeID, params: { id: id, name: id, component: "Counter" } })
  }

  let rootSelo = props.rootSelo ? props.rootSelo : props.selo;
  let newLocalSelo = addLocalSelo(rootSelo, genID(props.nodeID + props.deep, path))

  const [el, setEl] = createSignal(null);
  const [uiEl, setUiEl] = createSignal(null);


  return (props.deep > local.data.properties.dc) ? null : (

    <>

      <div class="bg-blend-color relative flex p1 m2"
        style={{
          border: "2px dotted grey",
          width: "fit-content",
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
          <div class="p4">
            <input type="range" min="1.0" max="20.0" value={local.data.properties.angle?.toString()} step="0.1" onInput={handleSlider} />
            Angle: {local.data.properties.angle?.toPrecision(3)}
          </div>
        </div>

        <div class="bg-blend-color relative p1 m2" ref={setEl} style={{
          border: "1px solid grey",
          width: "fit-content",
          transform: `scale(${local.data.properties.scale}) rotate(${local.data.properties.angle}deg)`
        }}>

          <Show
            when={local.data.properties.ticking}
            fallback={<button class={buttonGreen()} onClick={[handleTicking, true]}>Start</button>}>
            <button class={buttonRed()} onClick={[handleTicking, false]}>Stop</button>
          </Show>

          <Show when={!props.noAvatar}>
            <DefaultAvatar
              {...props}
              el={el}
              uiEl={uiEl}
              avatarComponent={Avatar}
            />
          </Show>

          <div class="p4">
            <div class="truncate flex">
              <button class={buttonGreen()} onClick={[handleClick, ["createSelo", { app: "demo1", info: true, reflectorHost: props.rootSelo ? props.rootSelo.reflectorHost : props.selo.reflectorHost, deep: props.deep, id: uuidv4() }]]}>New Selo</button>
              <button class={buttonGreen()} onClick={handleCreateCounter}>New Counter</button>
              <button class={buttonGreen()} onClick={[handleClick, ["createNode", { type: "App", component: "demo1", id: uuidv4(), noAvatar: true }]]}>New App</button>
            </div>

            <For each={local.data.dynamic}>
              {(item) =>

                <div p1>
                  <button class={smallButton()} onClick={[handleClick, ["deleteNode", item.nodeID]]}>X</button>
                  <button class={smallButton()} onClick={
                    [handleClick, ["createNode", { id: item.nodeID, component: item.component }]]}>clone</button>

                  <Dynamic component={components[item.component]}
                    nodeID={item.nodeID}
                    name={item.name}
                    noAvatar={item.noAvatar}
                    dynamic={true}
                    parentID={props.nodeID}
                    selo={props.selo}
                    deep={props.deep}
                    worlds={props.worlds}
                    fallbackWorld={props.worlds.emptyWorld}
                    resources={props.selo.resources}
                    dc={local.data.properties.dc}
                    angle={local.data.properties.angle}
                    scale={local.data.properties.scale}
                  />
                </div>
              }
            </For>
          </div>

          <div class="p4">
            <Counter name="Counter"
              nodeID="counter"
              selo={props.selo}
              parentID={props.nodeID}
              angle={local.data.properties.angle}
              scale={local.data.properties.scale}
            />
          </div>

          <div class="p4">
            <For each={local.data.dynamicSelo}>
              {(item) =>
                <div p-1>
                  <div>
                    <button class={smallButton()} onClick={[handleClick, ["deleteSelo", item.seloID]]}>X</button>
                  </div>
                  <Selo
                    nodeID={item.app}
                    component={components[item.app]}
                    seloID={item.seloID}
                    info={item.info}
                    reflectorHost={item.reflectorHost}
                    parentSeloID={props.selo.id}
                    dc={local.data.properties.dc}
                    worlds={props.worlds}
                    fallbackWorld={props.worlds.emptyWorld}
                  />
                </div>
              }
            </For>
          </div>


          {/* Recursive World */}
          <App
            nodeID={props.nodeID}
            scale={local.data.properties.scale - 0.01}
            angle={local.data.properties.angle + 0.5}
            deep={props.deep + 1}
            selo={newLocalSelo}
            rootSelo={props.rootSelo ? props.rootSelo : props.selo}
            noAvatar={true}
            worlds={props.worlds}
            fallbackWorld={props.worlds.emptyWorld}
            parameters={props.parameters}
          />

        </div>
      </div>
    </>
  )

}

export default App;
