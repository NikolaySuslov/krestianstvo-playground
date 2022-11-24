/*
The MIT License (MIT)
Copyright (c) 2022 Nikolay Suslov and the Krestianstvo.org project contributors.
(https://github.com/NikolaySuslov/krestianstvo/blob/master/LICENSE.md)
*/

import { produce } from 'solid-js/store';
import { createSignal, onCleanup } from 'solid-js';
import { createLocalStore, Selo, createQRCode, getRandomColor, genID } from 'krestianstvo'

import { v4 as uuidv4 } from 'uuid';
import { Vector3 } from '@dimforge/rapier3d-compat'

import { initRapier } from "../../Objects/Rapier/RapierLib"

function App(props) {

  const path = import.meta.url// + props.nodeID;

  const [local, setLocal] = createLocalStore({
    data: {
      type: "App",
      nodeID: props.nodeID,
      properties: {
        initialized: false,
        ticking: false,
        paused: false
      },
      dynamic: [
      ],
      dynamicSelo: [

      ],
      rapierWorldState: [],
      rapierWorld: {}
    }


  }, props)


  const [rapierData] = initRapier(props, local,
    { gravity: new Vector3(0.0, -9.81, 0.0) })


  onCleanup(() => {
  });

  const initialize = () => {
  }


  function handleClick(msg) {
    props.selo.sendExtMsg({ msg: msg, id: props.nodeID })
  }

  props.selo.createAction(props.nodeID, "initialize", initialize)

{/* <span>{rapierLoad.loading && "Loading..."}</span> */}
  return (
    <>
      {/* <Show when={rapierLoad.state=="ready"}> */}
      <Dynamic 
          {...props}
          selo={props.selo}
          nodeID={props.nodeID.replace("_rapier_","")}
          component={props.scene}
          rapier={rapierData()} 
							/>
      {/* <Space selo={props.selo} nodeID={genID("Rapier" + props.nodeID, path)} rapier={rapierData()} /> */}
      {/* </Show> */}

    </>
  )

}

export default App;
