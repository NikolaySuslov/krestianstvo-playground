/*
The MIT License (MIT)
Copyright (c) 2022 Nikolay Suslov and the Krestianstvo.org project contributors.
(https://github.com/NikolaySuslov/krestianstvo/blob/master/LICENSE.md)
*/

import { createSignal, onMount, onCleanup, Show } from 'solid-js';
import { genID, createLocalStore, initializeOnMount, getWorldConfig, Selo } from 'krestianstvo'

import SeloPortal from "../../Objects/Portal"
import DefaultAvatar from "../../Objects/DefaultAvatar"
import SeloInfo from "../../Objects/Info"
import Avatar from "../../Objects/Avatar"

import worlds from "../../Web/Worlds"
import { v4 as uuidv4 } from 'uuid';

import Counter from '../../Objects/Counter'
import Demo1 from '../demo1/Index'
import Painter from '../painter/Index'
import Styles from '../../Web/Styles'

export default function Demo3(props) {

  const path = import.meta.url// + props.nodeID;

  const { buttonGreen, smallButton, buttonRed } = Styles

  const components = {
    Avatar: Avatar,
    Counter: Counter,
    Demo3: Demo3,
    demo1: Demo1,
    painter: Painter,
    portal: SeloPortal
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
        dc: props.parameters ? props.parameters : 7
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


  return (
    <>
      <div class="bg-blend-color absolute flex w-full text-center"
        style={{
          top: props.deep == 1 ? `${window.innerHeight / 2 - 300}px` : "0px",
          left: props.deep == 1 ? `${window.innerWidth / 2 - 500}px` : "0px",
          border: "2px dotted grey",
          width: "fit-content",
          margin: "auto"
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

        <div class="gap-2 absolute p3 m2 flex w-full text-center" ref={setEl} style={{
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
              <button class={buttonGreen()} onClick={[handleClick, ["createNode", {
                type: "App", component: "portal", deep: props.deep
              }]]}>New Portal</button>
              <button class={buttonGreen()} onClick={[handleClick, ["createNode", { component: "Counter" }]]}>New Counter</button>
              <button class={buttonGreen()} onClick={[handleClick, ["createNode", { type: "App", component: "painter", noAvatar: true }]]}>New App</button>
            </div>

            <For each={local.data.dynamic}>
              {(item) =>

                <div p1>
                  <button class={smallButton()} onClick={[handleClick, ["deleteNode", item.nodeID]]}>X</button>
                  <button class={smallButton()} onClick={
                    [handleClick, ["createNode", { id: item.nodeID, component: item.component }]]}>clone</button>

                  <Dynamic
                    component={components[item.component]}
                    //component={components[item.component]}
                    nodeID={item.nodeID}
                    //appComponent={item.component}
                    name={item.name}
                    dynamic={true}
                    parentID={props.nodeID}
                    selo={props.selo}
                    deep={props.deep}
                    worldsPath={item.worldsPath}
                    dc={local.data.properties.dc}
                    noAvatar={item.noAvatar}
                    worlds={worlds}
                    fallbackWorld={props.worlds.emptyWorld}
                    resources={props.selo.resources}
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
                  />
                </div>
              }
            </For>
          </div>


          {/* Recursive Selo */}
          <Show when={props.selo.storeVT.moniker_}>
            <Selo
              seloID={props.selo.id}
              nodeID={"demo3"}
              component={Demo3}
              info={true}
              scale={local.data.properties.scale}
              angle={local.data.properties.angle}
              deep={props.deep}
              deepCount={local.data.properties.dc}
              reflectorHost={props.selo.reflectorHost}
              parameters={local.data.properties.dc}
              resources={props.selo.resources}
            />
          </Show>
        </div>
      </div>
    </>
  )
}

