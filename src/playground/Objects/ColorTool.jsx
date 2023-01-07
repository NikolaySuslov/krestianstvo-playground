/*
The MIT License (MIT)
Copyright (c) 2022 Nikolay Suslov and the Krestianstvo.org project contributors.
(https://github.com/NikolaySuslov/krestianstvo/blob/master/LICENSE.md)
*/

import { onMount, createSignal, createEffect } from 'solid-js';
import { createLocalStore } from 'krestianstvo'

import { HexColorPicker } from "solid-colorful"

export default function App(props) {

	const [local, setLocal] = createLocalStore({
		data: {
			type: "Node",
			nodeID: props.nodeID,
			properties: props.properties ? props.properties : {
				name: props.name ? props.name : props.nodeID,
				color: props.color ? props.color : "#eee",
				targetID: props.targetID ? props.targetID : null,
				ticking: false,
				initialized: false,
				dynamic: props.dynamic ? props.dynamic : false,
				parentID: props.parentID ? props.parentID : null
			},
			dynamic: [
			]
		}
	}, props);


	const step = (tick) => { }


	const initialize = () => { }

	const doesNotUnderstand = (data) => {
		console.log("MY doesNotUnderstand action: ", data)
	}

	const changeColor = (data) => {
		setLocal("data", "properties", "color", data[0])
		let avatar = props.selo.getNodeByID(data[1])
		if (avatar) {
			props.selo.callAction(data[1], "setProperty", ["color", data[0]])
		}

	}

	props.selo.createAction(props.nodeID, "doesNotUnderstand", doesNotUnderstand, true)
	props.selo.createAction(props.nodeID, "step", step)
	props.selo.createAction(props.nodeID, "initialize", initialize)
	props.selo.createAction(props.nodeID, "changeColor", changeColor)


	function handleClick(msg) {
		props.selo.sendExtMsg({ msg: msg, id: props.nodeID })
	}


	function handleColorInput(value) {
		console.log(value)
		props.selo.sendExtMsg({ msg: "changeColor", id: props.nodeID, params: [value, props.selo.storeVT.moniker_] })
		//props.selo.sendExtMsg({ msg: "setProperty", id: props.nodeID, params: ["color", value] })
	}

	return (
		<>
			<HexColorPicker color={local.data.properties.color} onChange={handleColorInput} />
		</>
	)
}
