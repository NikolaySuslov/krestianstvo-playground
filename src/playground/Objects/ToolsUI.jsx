/*
The MIT License (MIT)
Copyright (c) 2022 Nikolay Suslov and the Krestianstvo.org project contributors.
(https://github.com/NikolaySuslov/krestianstvo/blob/master/LICENSE.md)
*/

import { onMount } from 'solid-js';
import { createLocalStore } from 'krestianstvo'

import Styles from '../Web/Styles'

import { FaSolidPaintbrush } from 'solid-icons/fa'
import { BsTextareaT } from 'solid-icons/bs'
import { TbAppWindow } from 'solid-icons/tb'
import { BsApp } from 'solid-icons/bs'
import { IoAppsSharp } from 'solid-icons/io'
import { BsBodyText } from 'solid-icons/bs'


export default function App(props) {

	const { buttonGreen, buttonRed, buttonGrey } = Styles

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

	const textChanged = (data) => {
		setLocal("data", "properties", "text", data[0])
	}

	props.selo.createAction(props.nodeID, "doesNotUnderstand", doesNotUnderstand, true)
	props.selo.createAction(props.nodeID, "step", step)
	props.selo.createAction(props.nodeID, "initialize", initialize)
	props.selo.createAction(props.nodeID, "textChanged", textChanged)


	onMount(() => { })

	function handleClick(msg) {
		let container = props.selo.getNodeByID(props.containerID);
		let position = msg[2] ? { x: container.data.properties.position.x + 110, y: container.data.properties.position.y + 80 } : container ? { x: container.data.properties.position.x + 20, y: container.data.properties.position.y + 100 } : { x: 0, y: 0 }
		let newMsg = Object.assign({}, msg[1])
		newMsg.position = position
		props.selo.sendExtMsg({ msg: msg[0], id: props.worldID, params: [newMsg] })
	}
	return (
		<>
			<div>
				<div class="truncate flex">
					<button m1 bg-transparent hover:bg-gray-100 text-sm text-black font-mono font-light py-2 px-4 rounded b-1 border-gray onClick={[handleClick, ["createNode", { component: "SeloPortal" }]]}><TbAppWindow size={"2em"} /></button>

					<button m1 bg-transparent hover:bg-gray-100 text-sm text-black font-mono font-light py-2 px-4 rounded b-1 border-gray onClick={[handleClick, ["createNode", { component: "AppCreator" }]]}><BsApp size={"2em"} /></button>

					<button m1 bg-transparent hover:bg-gray-100 text-sm text-black font-mono font-light py-2 px-4 rounded b-1 border-gray onClick={[handleClick, ["createNode", { component: "Text" }]]}><BsTextareaT size={"2em"} /></button>

					<button m1 bg-transparent hover:bg-gray-100 text-sm text-black font-mono font-light py-2 px-4 rounded b-1 border-gray onClick={[handleClick, ["createNode", { component: "PaintCanvas" }]]}><FaSolidPaintbrush size={"2em"} /></button>

					<button onClick={[handleClick, ["createNode", { component: "Markdown" }]]} m1 bg-transparent hover:bg-gray-100 text-sm text-black font-mono font-light py-2 px-4 rounded b-1 border-gray><BsBodyText size={"2em"} /></button>


					<button m1 bg-transparent hover:bg-gray-100 text-sm text-black font-mono font-light py-2 px-4 rounded b-1 border-gray onClick={[handleClick, ["createNode", { component: "Objects" }, true]]}> <IoAppsSharp size={"2em"} /></button>
				</div>
			</div>
			<For each={local.data.dynamic}>
				{(item) =>
					<Dynamic component={components[item.component]}
						nodeID={item.nodeID}
						dynamic={true}
						parentID={props.nodeID}
					/>
				}
			</For>
		</>
	)
}
