
/*
The MIT License (MIT)
Copyright (c) 2022 Nikolay Suslov and the Krestianstvo.org project contributors.
(https://github.com/NikolaySuslov/krestianstvo/blob/master/LICENSE.md)
*/

import { createSignal, onMount, onCleanup, Show, createEffect } from 'solid-js';
import { createLocalStore, createQRCode, createLinkForSelo, saveToFile, restoreFromFile, saveFull, restoreFull, replaceURLs } from 'krestianstvo'

import SeloPortal from "../../Objects/Portal"
import DefaultAvatar from "../../Objects/DefaultAvatar"
import Avatar from "../../Objects/Avatar"
import AvatarSimple from "../../Objects/AvatarSimple"
import { v4 as uuidv4 } from 'uuid';

// import configFile from './config.json?raw'

import DragContainer from '../../Objects/DragContainer'
import Counter from '../../Objects/Counter'
import worlds from "../../Web/Worlds"

import { RiDesignEditBoxLine } from 'solid-icons/ri'
import { BsInfoCircle } from 'solid-icons/bs'
import { BsDownload } from 'solid-icons/bs'
import { BsUpload } from 'solid-icons/bs'
import { BiRegularMenu } from 'solid-icons/bi'
import { IoSettingsOutline } from 'solid-icons/io'
// import { SiWebrtc } from 'solid-icons/si'

import { createFileUploader } from "@solid-primitives/upload"

function App(props) {

  const path = import.meta.url// + props.nodeID;

  const [local, setLocal] = createLocalStore({
    data: {
      type: "App",
      nodeID: props.nodeID,
      properties: {
        ticking: false,
        initialized: false,
        restored: false,
        seloSource: null,
        urlSource: props.urlSource ? props.urlSource : null
      },
      dynamic: [
      ],
      dynamicSelo: [
      ],
    }
  }, props)


  const initialize = () => {
    if (props.urlSource) {
      console.log("LOAD from URL source", props.urlSource)
      handleLoadFromURL(props.urlSource)
    }
  }

  onMount(() => { })
  const postInitialize = () => { }
  const step = (tick) => { }

  const restore = (data) => {
    restoreFull(data[0], props.selo.id, data[1])
  }

  const doesNotUnderstand = (data) => {
    console.log("MY doesNotUnderstand action: ", data)
  }

  props.selo.createAction(props.nodeID, "initialize", initialize)
  props.selo.createAction(props.nodeID, "step", step)
  props.selo.createAction(props.nodeID, "postInitialize", postInitialize)
  props.selo.createAction(props.nodeID, "restore", restore)
  props.selo.createAction(props.nodeID, "doesNotUnderstand", doesNotUnderstand)

  let thisDiv;

  let link = createLinkForSelo(props.selo, { p: props.parameters, d: props.deepCount, u: props.urlSource })

  onMount(() => {
    createQRCode(thisDiv, link)
  })

  onCleanup(() => { })

  let filelink
  const [fileData, setFile] = createSignal(null);
  const { files, selectFiles } = createFileUploader()

  function handleSave(e) {
    saveFull(props.selo.id, setFile)
  }

  function loadData(text) {
    let state = replaceURLs(JSON.parse(text))
    //props.selo.setLocal("data", "seloSource", JSON.stringify(state));

    let k = uuidv4();

    props.selo.setStoreVT("seloSource", state);
    props.selo.sendExtMsg({ msg: "createNode", id: props.nodeID, params: [{ component: "SeloPortal", url: "k?k=" + k, restored: true, position: { x: 100, y: 0 } }] })

  }

  function handleLoadFromURL(url) {

    fetch(url)
      .then((response) => response.text())
      .then((text) => {
        loadData(text)
      });
  }

  function handleLoad(e) {

    selectFiles(([{ source, name, size, file }]) => {
      console.log({ source, name, size, file });
      file.text().then(text => {
        loadData(text)
      })
    })

  }


  createEffect(() => {
    console.log("File is ready to save: ", fileData())
    if (fileData() !== null) {
      const fileBlob = new Blob([JSON.stringify(fileData(), null, 2)], { type: 'application/json' });
      filelink.href = URL.createObjectURL(fileBlob);
      filelink.download = local.data.nodeID + "_save_" + Date.now().toString() + ".json";
      filelink.click();
      URL.revokeObjectURL(filelink.href);
      setFile(null)
    }
  })

  function handleClick(msg) {
    props.selo.sendExtMsg({ msg: msg[0], id: props.nodeID, params: [msg[1]] })
  }

  const [menuVis, setMenuVis] = createSignal("none");

  function handleToggleMenu(value) {
    value ? setMenuVis("block") : setMenuVis("none")
  }

  const [el, setEl] = createSignal(null);
  const [uiEl, setUiEl] = createSignal(null);

  return (
    <>
      <div class="bg-blend-color relative flex"
        style={{
          width: "fit-content"
        }}>

        <div class="relative" ref={setEl} style={{
          border: "0px solid grey",
          // width: "fit-content" //400px
        }}>

          <Show when={!props.noAvatar}>
            <DefaultAvatar
              {...props}
              scale={0.7}
              el={el}
              uiEl={uiEl}
              avatarComponent={AvatarSimple}
            />
          </Show>
          <div class="pt-4 pl-4">
            <div class="grid grid-rows-1 grid-cols-2">
              <div class="col-span-1 box">
                <Switch>
                  <Match when={menuVis() == "none"}>
                    <button onClick={[handleToggleMenu, true]} bg-white hover:bg-gray-100 text-sm text-black font-mono font-light py-2 px-4 rounded b-0 ><BiRegularMenu size={"2em"} /></button>
                  </Match>
                  <Match when={menuVis() == "block"}>
                    <button onClick={[handleToggleMenu, false]} bg-white hover:bg-gray-100 text-sm text-black font-mono font-light py-2 px-4 rounded b-0 ><BiRegularMenu size={"2em"} /></button>
                  </Match>
                </Switch>
              </div>
              <div class="col-span-1 box">
                <a href={link} text-center fw300 target="_blank">Link</a>
                <div pt-1 text-center ref={thisDiv} />
              </div>

            </div>
          </div>

          <div class="p4" style={{
            display: menuVis(),
            position: "absolute"
          }}>

            <div class="grid grid-rows-2 grid-cols-1">
              <div class="raw-span-1 box"><button m1 bg-green-200 hover:bg-green-300 text-sm text-black font-mono font-light py-2 px-4 rounded border-1 border-gray-600 onClick={[handleClick, ["createNode", { component: "ToolsUI", position: { x: 100, y: 0 } }]]}><RiDesignEditBoxLine size={"2em"} /></button>
              </div>
              <div class="raw-span-1 box"><button m1 bg-gray-100 hover:bg-gray-200 text-sm text-black font-mono font-light py-2 px-4 rounded b-1 border-gray onClick={[handleLoad, []]}>< BsDownload size={"2em"} /></button></div>
              <div class="raw-span-1 box"><button m1 bg-gray-100 hover:bg-gray-200 text-sm text-black font-mono font-light py-2 px-4 rounded b-1 border-gray onClick={[handleSave, []]}>< BsUpload size={"2em"} /></button><a ref={filelink}></a></div>

              {/* <div class="raw-span-1 box">
                <button m1 bg-gray-100 hover:bg-gray-200 text-sm text-black font-mono font-light py-2 px-4 rounded b-1 border-gray onClick={[handleClick, ["createNode", { component: "WebRTC", position: { x: 100, y: 100 } }]]}><  SiWebrtc size={"2em"} /></button></div> */}


              <div class="raw-span-1 box">
                <button m1 bg-gray-100 hover:bg-gray-200 text-sm text-black font-mono font-light py-2 px-4 rounded b-1 border-gray onClick={[handleClick, ["createNode", { component: "Settings", position: { x: 100, y: 100 } }]]}><  IoSettingsOutline size={"2em"} /></button></div>

              <div class="raw-span-1 box">
                <button m1 bg-gray-100 hover:bg-gray-200 text-sm text-black font-mono font-light py-2 px-4 rounded b-1 border-gray onClick={[handleClick, ["createNode", { component: "Info", position: { x: 100, y: 100 } }]]}><  BsInfoCircle size={"2em"} /></button></div>
            </div>
          </div>
          <For each={local.data.dynamic}>
            {(item) =>
              <Dynamic
                component={DragContainer}
                contents={item.component}
                //{components[item.component]}
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
                cloneID={item.cloneID}
                properties={item.properties}
                appProperties={item.appProperties}
                position={item.position}
                source={item.source}
                url={item.url}
                restored={item.restored}
              />
            }
          </For>

        </div>
      </div>
    </>
  )
}

export default App;
