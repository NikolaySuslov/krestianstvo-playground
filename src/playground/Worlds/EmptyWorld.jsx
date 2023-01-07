
/*
The MIT License (MIT)
Copyright (c) 2022 Nikolay Suslov and the Krestianstvo.org project contributors.
(https://github.com/NikolaySuslov/krestianstvo/blob/master/LICENSE.md)
*/

import { createSignal, onMount, onCleanup } from 'solid-js';
import { createLocalStore, genID,  Selo } from 'krestianstvo'

import SeloPortal from "../Objects/Portal"
import AppCreator from "../Objects/AppCreator"
import DefaultAvatar from "../Objects/DefaultAvatar"
import SeloInfo from "../Objects/Info"


function App(props) {

  const path = import.meta.url// + props.nodeID;

  const components = {
    //Avatar: Avatar,
    app: App,
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


  const initialize = () => { }
  const step = (tick) => { }

  props.selo.createAction(props.nodeID, "initialize", initialize)
  props.selo.createAction(props.nodeID, "step", step)


  onMount(() => { });
  onCleanup(() => { });


  function handleClick(msg) {
    props.selo.sendExtMsg({ msg: msg[0], id: props.nodeID, params: [msg[1]] })
  }

  const [el, setEl] = createSignal(null);

  return (
    <>
      <div class="bg-blend-color relative flex"
        style={{
          border: "2px dotted grey",
          width: "fit-content"
        }}>
        <Switch>
          <Match when={props.info}>
            <SeloInfo
              {...props}
            />
          </Match>
        </Switch>

        <div class="relative p2 m2" ref={setEl} style={{
          border: "1px solid grey",

        }}>
          <Show when={!props.noAvatar}>
            <DefaultAvatar
              {...props}
              el={el}
            />
          </Show>

          <div class="p1">
          <div class="text-4 p3">
            World <strong>{props.nodeID}</strong> ...not found [404]
            </div>

            <div class="truncate flex">




              <button class="m1 bg-green-200 hover:bg-green-300 text-sm text-black font-mono font-light py-2 px-4 rounded border-2 border-green-200" onClick={[handleClick, ["createNode", {
                type: "App", component: "portal", deep: props.deep
              }]]}>New Portal</button>
              <button class="m1 bg-green-200 hover:bg-green-300 text-sm text-black font-mono font-light py-2 px-4 rounded border-2 border-green-200" onClick={[handleClick, ["createNode", {
                type: "App", component: "appCreator", deep: props.deep
              }]]}>New App</button>

            </div>

            <For each={local.data.dynamic}>
              {(item) =>

                <div p1>
                  <button class={"m1 bg-green-200 hover:bg-green-300 text-sm text-black font-mono font-light py-1 px-2 rounded border-2 border-green-200"} onClick={[handleClick, ["deleteNode", item.nodeID]]}>X</button>
                  <button class={"m1 bg-green-200 hover:bg-green-300 text-sm text-black font-mono font-light py-1 px-2 rounded border-2 border-green-200"} onClick={
                    [handleClick, ["createNode", { id: item.nodeID, component: item.component, noAvatar: item.noAvatar, cloneID: item.nodeID }]]}>clone</button>

                  <Dynamic
                    component={components[item.component]}
                    nodeID={item.nodeID}
                    name={item.name}
                    dynamic={true}
                    parentID={props.nodeID}
                    selo={props.selo}
                    deep={props.deep}
                    noAvatar={item.noAvatar}
                    worlds={props.worlds}
                    fallbackWorld={App}
                    resources={props.selo.resources}
                  />
                </div>
              }
            </For>
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
                    fallbackWorld={App}
                  // deepCount={4}
                  />
                </div>
              }
            </For>
          </div>

          {/* <div class="p1">
            <SeloPortal
              {...props}
              nodeID={genID("Portal" + props.nodeID, path)}
              worlds={props.worlds}
            />
          </div> */}

        </div>
      </div>
    </>
  )

}

export default App;
