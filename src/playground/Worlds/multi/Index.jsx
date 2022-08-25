
/*
The MIT License (MIT)
Copyright (c) 2022 Nikolay Suslov and the Krestianstvo.org project contributors.
(https://github.com/NikolaySuslov/krestianstvo/blob/master/LICENSE.md)
*/

import { createEffect, createSignal } from 'solid-js';
import { genID, createLocalStore, Selo } from 'krestianstvo'

import Multicamera from '../multicamera/Index'


function App(props) {

  const path = import.meta.url// + props.nodeID;

  const [local, setLocal] = createLocalStore({
    data: {
      type: "App",
      nodeID: props.nodeID,
      properties: {
        ticking: true,
        initialized: false,
        cameraCount: 4,
        grid: false
      },
      dynamic: [],
      dynamicSelo: [
      ]
    }
  }, props)

  const step = (tick) => {
    // step on tick
  }


  const initialize = () => {

      //checkForCamera()

      // let seloCamera = getSeloByID("3d" + props.selo.id)
      // let appThree = seloCamera.getNodeByID('three')
      // setLocal("data", "properties", "cameraWidth", appThree.data.properties.cameraWidth)
      // setLocal("data", "properties", "cameraHeight", appThree.data.properties.cameraHeight)


  }

  props.selo.createAction(props.nodeID, "initialize", initialize)
  props.selo.createAction(props.nodeID, "step", step)


  const [el, setEl] = createSignal(null);

  createEffect(() => {

    props.selo.callAction(props.nodeID, "createSelo", [{
      app: "multicamera",
      id: "multi" + props.selo.id,
      cameraCount: local.data.properties.cameraCount,
      grid: local.data.properties.grid,
      index: 0
    }])
  })


  function handleCheckBox(value) {

    props.selo.sendExtMsg({ msg: "setProperty", id: props.nodeID, params: ["grid", value.target.checked] })

  }

  function handleSlider(value) {

    props.selo.sendExtMsg({ msg: "setProperty", id: props.nodeID, params: ["cameraCount", parseInt(value.target.value)] })

  }

  const [elM, setElM] = createSignal(null);

  return (
    <>
      <div ref={setEl}>

        <div class="p4 top-20" absolute z-10>
          <input type="range" min="1" max="16" value={local.data.properties.cameraCount.toString()} step="1" onInput={handleSlider} />
          Count: {local.data.properties.cameraCount}
          <div pt1>
            <input ref={setElM} type="checkbox" name="grid"
              onchange={handleCheckBox} checked={local.data.properties.grid} />
            <label for={elM()}>Grid</label>
          </div>
        </div>

        {/* <DefaultAvatar
          {...props}
          el={el}
          scale={0.7}
          avatarComponent={AvatarSimple}
        /> */}

        <div class="p1">
          <For each={local.data.dynamicSelo}>
            {(item) =>
              <Selo
                nodeID={"multicamera"}
                component={Multicamera}
                seloID={item.seloID}
                info={false}
                parentSeloID={props.selo.id}
                cameraCount={item.cameraCount}
                grid={item.grid}
              />
            }
          </For>
        </div>
      </div>
    </>
  )

}

export default App;
