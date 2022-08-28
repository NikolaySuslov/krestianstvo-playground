/*
The MIT License (MIT)
Copyright (c) 2022 Nikolay Suslov and the Krestianstvo.org project contributors.
(https://github.com/NikolaySuslov/krestianstvo/blob/master/LICENSE.md)
*/

import { createSignal, onMount, onCleanup, Show } from 'solid-js';
// import DefaultAvatar from "../../../core/objects/DefaultAvatar"
import Avatar from "../../Objects/Avatar"
import AvatarSimple from "../../Objects/Avatar"

import { genID, createLocalStore, Selo } from 'krestianstvo'

import { v4 as uuidv4 } from 'uuid';

import SeloPortal from "../../Objects/Portal"
import AppCreator from "../../Objects/AppCreator"
import DefaultAvatar from "../../Objects/DefaultAvatar"
import SeloInfo from "../../Objects/Info"

import Counter from '../../Objects/Counter'
import Styles from '../../Web/Styles'

export default function Demo1(props) {

  const path = import.meta.url// + props.nodeID;

  const { buttonGreen, smallButton } = Styles

  const components = {
    Avatar: Avatar,
    Counter: Counter,
    demo1: Demo1,
    portal: SeloPortal,
    appCreator: AppCreator
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
      ],
    }
  }, props)


  const initialize = () => {
    //do initialization here
  }

  const step = (tick) => {
    //do step gere
  }

  props.selo.createAction(props.nodeID, "initialize", initialize)
  props.selo.createAction(props.nodeID, "step", step)


  onMount(() => { });

  onCleanup(() => { });


  function handleClick(msg) {
    props.selo.sendExtMsg({ msg: msg[0], id: props.nodeID, params: [msg[1]] })
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
              <button class={buttonGreen()} onClick={[handleClick, ["createSelo", { app: "demo1", info: true, reflectorHost: props.selo.reflectorHost, deep: props.deep }]]}>New Selo</button>
              <button class={buttonGreen()} onClick={[handleClick, ["createNode", { component: "Counter" }]]}>New Counter</button>
              <button class={buttonGreen()} onClick={[handleClick, ["createNode", { type: "App", component: "demo1", deep: props.deep, noAvatar: true }]]}>New App</button>
              <button class={buttonGreen()} onClick={[handleClick, ["createNode", {
                type: "App", component: "portal", deep: props.deep
              }]]}>New Portal</button>
              <button class={buttonGreen()} onClick={[handleClick, ["createNode", {
                type: "App", component: "appCreator", deep: props.deep
              }]]}>New App Portal</button>
            </div>

            <div class="p1 flex">
              <Counter name="Counter"
                nodeID={genID("Counter" + props.nodeID, path)}
                selo={props.selo}
                parentID={props.nodeID}
              />
            </div>


            <For each={local.data.dynamic}>
              {(item) =>

                <div p1>
                  <button class={smallButton()} onClick={[handleClick, ["deleteNode", item.nodeID]]}>X</button>
                  <button class={smallButton()} onClick={
                    [handleClick, ["createNode", { id: item.nodeID, component: item.component, worldsPath: item.worldsPath, noAvatar: item.noAvatar }]]}>clone</button>

                  <Dynamic
                    component={components[item.component]}
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
                    dc={props.dc}
                  />
                </div>
              }
            </For>
          </div>

          <div class="p1">
            <SeloPortal
              {...props}
              nodeID={genID("Portal" + props.nodeID, path)}
              //deep={props.deep}
              //url={"pixel?k=1"}
              //param={(props.param ? props.param : 0) + 1}
            />
          </div>

          <div class="p1">
            <AppCreator
              {...props}
              info={false}
              noAvatar={true}
              nodeID={genID("AppCreator" + props.nodeID, path)}
              //deep={props.deep}
              //url={"pixel"}
              //param={(props.param ? props.param : 0) + 1}
            />
          </div>


          <div class="p1">
            <For each={local.data.dynamicSelo}>
              {(item) =>
                <div p-1>
                  <div>
                    <button class={smallButton} onClick={[handleClick, ["deleteSelo", item.seloID]]}>X</button>
                  </div>
                  <Selo
                    nodeID={item.app}
                    component={components[item.app]}
                    seloID={item.seloID}
                    info={item.info}
                    reflectorHost={item.reflectorHost}
                    parentSeloID={props.selo.id}
                    deep={props.deep - 1}
                    dc={props.parameters ? props.parameters: 4}
                    worlds={props.worlds}
                    fallbackWorld={props.worlds.emptyWorld}
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
