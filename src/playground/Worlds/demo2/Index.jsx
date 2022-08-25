/*
The MIT License (MIT)
Copyright (c) 2022 Nikolay Suslov and the Krestianstvo.org project contributors.
(https://github.com/NikolaySuslov/krestianstvo/blob/master/LICENSE.md)
*/

import { createSignal, onMount, onCleanup, Show} from 'solid-js';
import { genID, createLocalStore, Selo } from 'krestianstvo'
import Avatar from "../../Objects/Avatar"
import { v4 as uuidv4 } from 'uuid';

import DefaultAvatar from "../../Objects/DefaultAvatar"
import SeloInfo from "../../Objects/Info"

import Counter from '../../Objects/Counter'
import Demo1 from '../demo1/Index'
import Painter from '../painter/Index'
import Styles from '../../Web/Styles'


function App(props) {

  const path = import.meta.url// + props.nodeID;

  const { buttonGreen, smallButton, buttonRed } = Styles

  const components = {
    Counter: Counter,
    app: App,
    demo1: Demo1,
    painter: Painter
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
        deepCount: 1
      },
      dynamic: [
      ],
      dynamicSelo: [
      ]
    }
  }, props)


  onMount(() => {
  });

  onCleanup(() => {
  });


  const step = (tick) => {
    // step on tick
    changeAngle()
  }

  const initialize = () => {

  }


  const changeAngle = () => {
    setLocal("data", "properties", "angle", (a) => a + 0.05)

  }

  props.selo.createAction(props.nodeID, "initialize", initialize)
  props.selo.createAction(props.nodeID, "changeAngle", changeAngle)
  props.selo.createAction(props.nodeID, "step", step)


  function handleClick(msg) {
    props.selo.sendExtMsg({ msg: msg[0], id: props.nodeID, params: [msg[1]] })
  }

  function handleTicking(value) {
    props.selo.sendExtMsg({ msg: "setProperty", id: props.nodeID, params: ["ticking", value] })
  }


  const [el, setEl] = createSignal(null);
  const [uiEl, setUiEl] = createSignal(null);

  return (props.deep > 5) ? null : (
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


        <div class="bg-blend-color relative h-full p1 m2"
          ref={setEl} style={{
            border: "1px solid grey",
            transform: `scale(${local.data.properties.scale}) rotate(${local.data.properties.angle}deg)`,
            width: "fit-content"
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
              <button class={buttonGreen()} onClick={[handleClick, ["createSelo", { app: "painter" }]]}>New Selo</button>
              <button class={buttonGreen()} onClick={[handleClick, ["createNode", { component: "Counter" }]]}>New Counter</button>
              <button class={buttonGreen()} onClick={[handleClick, ["createNode", { type: "App", component: "demo1" }]]}>New App</button>
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
                    dynamic={true}
                    parentID={props.nodeID}
                    selo={props.selo}
                  />
                </div>
              }
            </For>
          </div>

          <div class="p1">
            <Counter name="Counter"
              nodeID="counter"
              selo={props.selo}
              parentID={props.nodeID}
            />
          </div>

          <div class="p1">
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
                    info={true}
                  />
                </div>
              }
            </For>
          </div>


          {/* Recursive World */}
          <App
            nodeID={props.nodeID}
            info={false}
            scale={local.data.properties.scale}
            angle={local.data.properties.angle}
            deep={props.deep + 1}
            selo={props.selo}
            noAvatar={true}
          />

        </div>
      </div>
    </>
  )
}

export default App;
