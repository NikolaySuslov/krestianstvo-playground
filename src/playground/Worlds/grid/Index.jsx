
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
import AvatarSimple from "../../Objects/AvatarSimple"
import { v4 as uuidv4 } from 'uuid';

import Counter from '../../Objects/Counter'
import Styles from '../../Web/Styles'
import Multicamera from '../multicamera/Index'

// import configFile from './config.json?raw'

import worlds from "../../Web/Worlds"

function App(props) {


  const path = import.meta.url// + props.nodeID;

  const { buttonGreen, smallButton } = Styles

  const components = {
    Avatar: Avatar,
    Counter: Counter,
    demo1: App,
    multicamera: Multicamera,
    portal: SeloPortal
  }

  const [local, setLocal] = createLocalStore({
    data: {
      type: "App",
      nodeID: props.nodeID,
      properties: {
        ticking: false,
        initialized: false,
        grid: props.parameters ? props.parameters : 1
      },
      dynamic: [
      ],
      dynamicSelo: [
      ],
    }
  }, props)


  const initialize = () => {

  }

  const step = (tick) => {

  }

  props.selo.createAction(props.nodeID, "initialize", initialize)
  props.selo.createAction(props.nodeID, "step", step)


  onMount(() => {
    initializeOnMount(props)
  });

  onCleanup(() => {
  });

  function cellPortal(id) {

    return (
      <>
        <Show when={findDynamic(id) == null}>
          <div class="truncate flex">

            <button z-10 onClick={[handleClick, ["createNode", {
              type: "App", component: "portal",
              gridID: id
            }]]}
            style={{
              width: "50px",
              height: "50px"
            }}
            >+</button>
          </div>
        </Show>
        <For each={local.data.dynamic}>
          {(item) =>
            <Show when={item.gridID == id}>
              <div>
                {/* <button class={smallButton} onClick={[handleClick, ["deleteNode", item.nodeID]]}>X</button>
                <button class={smallButton} onClick={
                  [handleClick, ["createNode", { id: item.nodeID, component: item.component, worldsPath: item.worldsPath }]]}>clone</button> */}

                <Dynamic
                  component={components[item.component]}
                  nodeID={item.nodeID}
                  name={item.name}
                  dynamic={true}
                  parentID={props.nodeID}
                  selo={props.selo}
                  deep={props.deep}
                  gridID={parseInt(item.gridID)}
                  worlds={worlds}
                  fallbackWorld={props.worlds.emptyWorld}
                  resources={props.selo.resources}
                  info={false}
                />
              </div>
            </Show>
          }
        </For>
      </>
    )

  }


  function findDynamic(id) {
    return local.data.dynamic.filter(el => el.gridID == id)[0]
  }


  function handleClick(msg) {
    props.selo.sendExtMsg({ msg: msg[0], id: props.nodeID, params: [msg[1]] })
  }

  const [el, setEl] = createSignal(null);
  const [uiEl, setUiEl] = createSignal(null);

  return (
    <>
      <div class="bg-blend-color relative flex"
        style={{
          border: "0px dotted grey",
          width: "fit-content"
        }}>
        <div flex-col>
          <div flex>
            <Switch>
              <Match when={false}>
                <SeloInfo
                  {...props}
                />
              </Match>
            </Switch>
          </div>
          <div ref={setUiEl}></div>
        </div>

        <div class="relative" ref={setEl} style={{
          border: "0px solid grey",
        }}>

          <Show when={!props.noAvatar}>
            <DefaultAvatar
              {...props}
              scale={0.5}
              el={el}
              uiEl={uiEl}
              avatarComponent={AvatarSimple}
            />
          </Show>

          <Switch>
            <Match when={local.data.properties.grid == 1}>
              <div class="grid grid-cols-1">
                <div class="row-span-1 box">
                  {cellPortal("0")}
                </div>
              </div>
            </Match>
            <Match when={local.data.properties.grid == "2h"}>
              <div class="grid grid-cols-2">
                <div class="row-span-1 box">
                  {cellPortal("0")}
                </div>
                <div class="row-span-1 box">
                  {cellPortal("1")}
                </div>
              </div>
            </Match>
            <Match when={local.data.properties.grid == "2v"}>
              <div class="grid grid-rows-2 grid-cols-1">
                <div class="raw-span-1 box">{cellPortal("0")}</div>
                <div class="raw-span-1 box">{cellPortal("1")}</div>
              </div>
            </Match>
            <Match when={local.data.properties.grid == 4}>
              <div class="grid grid-rows-2 grid-cols-2">
                <div class="raw-span-1 box">{cellPortal("0")}</div>
                <div class="raw-span-1 box">{cellPortal("1")}</div>
                <div class="row-span-1 box"> {cellPortal("2")}</div>
                <div class="row-span-1 box"> {cellPortal("3")}</div>
              </div>
            </Match>
          </Switch>
        </div>
      </div>
    </>
  )
}

export default App;
