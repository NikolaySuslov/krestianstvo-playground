
/*
The MIT License (MIT)
Copyright (c) 2022 Nikolay Suslov and the Krestianstvo.org project contributors.
(https://github.com/NikolaySuslov/krestianstvo/blob/master/LICENSE.md)
*/

import { createSignal, onMount, onCleanup, Show } from 'solid-js';
import { genID, createLocalStore, initializeOnMount, getWorldConfig, Selo, } from 'krestianstvo'

import PaintCanvas from '../../Objects/PaintCanvas'

import DefaultAvatar from "../../Objects/DefaultAvatar"
import SeloInfo from "../../Objects/Info"

import { v4 as uuidv4 } from 'uuid';

import Avatar from "../../Objects/Avatar"

import Styles from '../../Web/Styles'

//import configFile from './config.json?raw'

function App(props) {

  const path = import.meta.url// + props.nodeID;

  const { buttonGreen, smallButton, buttonRed } = Styles

  const components = {
    Avatar: Avatar,
    App: App,
    painter: App
  }

  const [local, setLocal] = createLocalStore({
    data: {
      type: "App",
      nodeID: props.nodeID,
      properties: {
        ticking: false,
        initialized: false
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
  }

  const initialize = () => {

  }

  props.selo.createAction(props.nodeID, "initialize", initialize)
  props.selo.createAction(props.nodeID, "step", step)


  function handleClick(msg) {
    props.selo.sendExtMsg({ msg: msg[0], id: props.nodeID, params: [msg[1]] })
  }

  const [el, setEl] = createSignal(null);
  const [uiEl, setUiEl] = createSignal(null);

  return (
    <>
      <div class="bg-blend-color relative flex"
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


        <div class="relative p2 m2" ref={setEl} style={{
          border: "1px solid grey",

        }}>
          <Show when={!props.noAvatar}>
            <DefaultAvatar
              {...props}
              el={el}
              uiEl={uiEl}
              avatarComponent={Avatar}
            />
          </Show>

          <div class="p1">
            <div class="truncate flex">
              <button class={buttonGreen()} onClick={[handleClick, ["createSelo", { app: "painter", info: true, deep: props.deep }]]}>New Selo</button>
              <button class={buttonGreen()} onClick={[handleClick, ["createNode", { type: "App", component: "painter", noAvatar: true }]]}>New App</button>
            </div>

            <For each={local.data.dynamic}>
              {(item) =>

                <div p1>
                  <button class={smallButton()} onClick={[handleClick, ["deleteNode", item.nodeID]]}>X</button>
                  <button class={smallButton()} onClick={
                    [handleClick, ["createNode", { id: item.nodeID, component: item.component, noAvatar: item.noAvatar }]]}>clone</button>

                  <Dynamic component={components[item.component]}
                    nodeID={item.nodeID}
                    name={item.name}
                    dynamic={true}
                    parentID={props.nodeID}
                    selo={props.selo}
                    deep={props.deep}
                    noAvatar={item.noAvatar}
                  />
                </div>
              }
            </For>
          </div>

          <div class="p1 flex">
            <PaintCanvas
              nodeID={genID("PaintCanvas" + props.nodeID, path)}
              selo={props.selo}
              color={"white"}
              size={2}
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
                    info={item.info}
                    reflectorHost={item.reflectorHost}
                    parentSeloID={props.selo.id}
                    deep={props.deep - 1}
                    deepCount={4}
                  />
                </div>
              }
            </For>
          </div>
        </div>
      </div>
    </>
  )

}

export default App;
