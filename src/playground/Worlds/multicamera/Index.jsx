
/*
The MIT License (MIT)
Copyright (c) 2022 Nikolay Suslov and the Krestianstvo.org project contributors.
(https://github.com/NikolaySuslov/krestianstvo/blob/master/LICENSE.md)
*/


import { createSignal } from 'solid-js';
import { genID, createLocalStore, Selo, getSeloByID } from 'krestianstvo'

import Pixel from '../pixel/Index'


function App(props) {

  const path = import.meta.url// + props.nodeID;

  const [local, setLocal] = createLocalStore({
    data: {
      type: "App",
      nodeID: props.nodeID,
      properties: {
        ticking: true,
        initialized: false,
        cameraWidth: props.cameraWidth ? props.cameraWidth : 480,
        cameraHeight: props.cameraHeight ? props.cameraHeight : 360,
        cameraCount: props.cameraCount ? props.cameraCount : 4,
        grid: props.grid ? props.grid : false
      },
      dynamic: [],
      dynamicSelo: []
    }
  }, props)

  const step = (tick) => {
    // step on tick
  }

  const checkForCamera = () => {

    let seloCamera = getSeloByID("3d" + props.selo.id)
    // let appThree = seloCamera.getNodeByID('pixel')
    if (seloCamera) {
      let client = seloCamera.storeNode.clients[0]
      let cam = seloCamera.getNodeByID('Camera_' + client)
      console.log('CAMERA: ', cam)
      if (cam) {
        if (local.data.properties.cameraWidth !== cam.data.properties.width)
          setLocal("data", "properties", "cameraWidth", cam.data.properties.width);

        if (local.data.properties.cameraHeight !== cam.data.properties.height)
          setLocal("data", "properties", "cameraHeight", cam.data.properties.height);
      }
    }

    props.selo.future(props.nodeID, "checkForCamera", 1)
  }

  const initialize = () => {

    checkForCamera()

  }

  props.selo.createAction(props.nodeID, "checkForCamera", checkForCamera)
  props.selo.createAction(props.nodeID, "initialize", initialize)
  props.selo.createAction(props.nodeID, "step", step)


  const [el, setEl] = createSignal(null);

  let leftP = [2, 4, 5, 6, 8, 10, 12, 13, 14, 16]
  let leftN = [3, 7, 11, 15]
  let topP = [3, 7, 9, 11, 15]
  let topN = [5, 13]


  let c = props.cameraCount ? props.cameraCount : local.data.properties.cameraCount

  return (props.deep > c) ? null : (
    <>
      <div class="absolute" ref={setEl} style={{
        border: "0px solid grey",
        left: leftP.includes(props.deep) ? `${local.data.properties.cameraWidth}px` : leftN.includes(props.deep) ? `${-local.data.properties.cameraWidth}px` : (props.deep == 9) ? `${-3 * local.data.properties.cameraWidth}px` : "0px",

        top: topP.includes(props.deep) ? `${local.data.properties.cameraHeight}px` : topN.includes(props.deep) ? `${-local.data.properties.cameraHeight}px` : "0px"
      }}>

        {/* <DefaultAvatar
          {...props}
          el={el}
          scale={0.5}
          avatarComponent={AvatarSimple}
        /> */}

        <Selo
          nodeID={"pixel"}
          component={Pixel}
          seloID={"3d" + props.selo.id}
          info={false}
          reflectorHost={props.selo.reflectorHost}
          editMode={false}
          gridIndex={local.data.properties.grid ? (props.deep - 1) : null}
        />

        {/* Recursive World */}
        <Show when={props.selo.storeVT.moniker_}>
          <App
            nodeID={props.nodeID}
            deep={props.deep + 1}
            selo={props.selo}
            cameraCount={props.cameraCount}
          />
        </Show>

      </div>
    </>
  )

}

export default App;
