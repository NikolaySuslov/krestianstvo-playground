/*
The MIT License (MIT)
Copyright (c) 2022 Nikolay Suslov and the Krestianstvo.org project contributors.
(https://github.com/NikolaySuslov/krestianstvo/blob/master/LICENSE.md)
*/

import { onMount } from 'solid-js';
import { createLocalStore } from 'krestianstvo'

import { IoColorPaletteOutline } from 'solid-icons/io'
import { BsCameraVideo } from 'solid-icons/bs'
import { FiCode } from 'solid-icons/fi'

export default function App(props) {

	const [local, setLocal] = createLocalStore({
		data: {
			type: "Node",
			nodeID: props.nodeID,
			properties: props.properties ? props.properties : {
				name: props.name ? props.name : props.nodeID,
				text: props.text ? props.text : "",
				ticking: false,
				initialized: false,
				dynamic: props.dynamic ? props.dynamic : false,
				parentID: props.parentID ? props.parentID : null,
				containerID: props.containerID ? props.containerID : null,
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

	props.selo.createAction(props.nodeID, "doesNotUnderstand", doesNotUnderstand, true)
	props.selo.createAction(props.nodeID, "step", step)
	props.selo.createAction(props.nodeID, "initialize", initialize)


	onMount(() => { })

	function handleClick(msg) {
		let container = props.selo.getNodeByID(props.containerID);
		let position = container ? { x: container.data.properties.position.x + 20, y: container.data.properties.position.y + 100 } : { x: 0, y: 0 }
		let newMsg = Object.assign({}, msg[1])
		newMsg.position = position
		props.selo.sendExtMsg({ msg: msg[0], id: props.worldID, params: [newMsg] })
	}


	return (
		<>
			<div>
				<div class="truncate flex">

					<button onClick={[handleClick, ["createNode", { component: "CodeTool" }]]} m1 bg-transparent hover:bg-gray-100 text-sm text-black font-mono font-light py-2 px-4 rounded b-1 border-gray><FiCode size={"2em"} /></button>

					<button onClick={[handleClick, ["createNode", { component: "ColorTool" }]]} m1 bg-transparent hover:bg-gray-100 text-sm text-black font-mono font-light py-2 px-4 rounded b-1 border-gray><IoColorPaletteOutline size={"2em"} /></button>

					<button m1 bg-gray-100 hover:bg-gray-200 text-sm text-black font-mono font-light py-2 px-4 rounded b-1 border-gray onClick={[handleClick, ["createNode", { component: "Counter" }]]}>App <br /> Counter</button>

					<button onClick={[handleClick, ["createNode", { component: "CameraTool" }]]} m1 bg-transparent hover:bg-gray-100 text-sm text-black font-mono font-light py-2 px-4 rounded b-1 border-gray><BsCameraVideo size={"2em"} /></button>

				</div>
			</div>

		</>
	)
}
