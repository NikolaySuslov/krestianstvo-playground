/*
The MIT License (MIT)
Copyright (c) 2022 Nikolay Suslov and the Krestianstvo.org project contributors.
(https://github.com/NikolaySuslov/krestianstvo/blob/master/LICENSE.md)
*/

import { createEffect, createSignal, onMount, onCleanup, batch } from 'solid-js';
import { unwrap, produce } from "solid-js/store";
import { createLocalStore, genID, deleteNode } from 'krestianstvo'
import { createDraggable } from '@neodrag/solid'
import SeloPortal from "./Portal"
import AppCreator from "./AppCreator"
import Styles from '../Web/Styles'
import { createPointerListeners } from "@solid-primitives/pointer";

import Counter from "./Counter"
import PaintCanvas from "./PaintCanvasFull"
import Text from "./Text"
import ToolsUI from "./ToolsUI"
import Info from "./SeloInfo"
import Settings from "./Settings"
import ColorTool from "./ColorTool"
import Objects from "./ToolsUIObjects"
import CameraTool from "./CameraTool"
// import ConfTool from "./WebRTC/ConfTool"
import CodeMirror from "./CodeMirror"
import Markdown from "./Markdown"

import {
	createElementSize
} from '@solid-primitives/resize-observer'
import { Dynamic } from 'solid-js/web';

import { FiPlusCircle } from 'solid-icons/fi'
import { FiXCircle } from 'solid-icons/fi'
import { FiDivideCircle } from 'solid-icons/fi'

export default function DragContainer(props) {
	const path = import.meta.url// + props.nodeID;

	const components = {
		SeloPortal: SeloPortal,
		AppCreator: AppCreator,
		Counter: Counter,
		PaintCanvas: PaintCanvas,
		Text: Text,
		ToolsUI: ToolsUI,
		Info: Info,
		ColorTool: ColorTool,
		Objects: Objects,
		CameraTool: CameraTool,
		// WebRTC: ConfTool,
		Settings: Settings,
		CodeTool: CodeMirror,
		Markdown: Markdown
	}

	const { draggable } = createDraggable();

	const [local, setLocal] = createLocalStore({
		data: {
			type: "Node",
			nodeID: props.nodeID,
			properties: {
				name: props.name ? props.name : props.nodeID,
				ticking: false,
				initialized: false,
				grid: props.grid ? props.grid : null,
				position: props.position ? props.position : { x: 0, y: 0 },
				parentID: props.parentID ? props.parentID : null
			},
			dynamic: [
			]
		}
	}, props);


	const step = (tick) => {}

	let me;
	let meView;

	const [width, setWidth] = createSignal(0)
	const esMe = createElementSize(() => me)

	createEffect(() => {
		console.log(esMe.width);
		setWidth(esMe.width)
	})

	const initialize = () => { }

	const doesNotUnderstand = (data) => {
		console.log("MY doesNotUnderstand action: ", data)
	}

	const onDrag = (data) => {
		if (data) {
			let position = { x: data[0].offsetX, y: data[0].offsetY }
			setLocal("data", "properties", "position", position)
		}

	}

	function onDelete(data) {
		props.selo.callAction(props.parentID, "deleteNode", [props.nodeID + '_contents'])
		props.selo.callAction(props.parentID, "deleteNode", [props.nodeID])
	}

	props.selo.createAction(props.nodeID, "doesNotUnderstand", doesNotUnderstand, true)
	props.selo.createAction(props.nodeID, "step", step)
	props.selo.createAction(props.nodeID, "initialize", initialize)
	props.selo.createAction(props.nodeID, "onDrag", onDrag)
	props.selo.createAction(props.nodeID, "deleteMe", onDelete)

	onMount(() => {})


	function handleDelete(data) {
		props.selo.sendExtMsg({ msg: "deleteMe", id: props.nodeID, params: [] })
	}

	function handleClickParent(msg) {
		props.selo.sendExtMsg({ msg: msg[0], id: props.parentID, params: [msg[1]] })
	}

	function handleCopyNode(data) {

		let msg = Object.assign({}, data)
		let cloneID = msg[1].cloneID
		let newMsg = Object.assign({}, msg[1])
		let node = props.selo.getNodeByID(cloneID)

		let nodeContents = node.data.component == "AppCreator" ? node.data.dynamic[0] : null
		let contents = nodeContents ? props.selo.getNodeByID(nodeContents.nodeID) : null
		console.log("app has contents: ", contents)
		if (contents) {
			let appProperties = Object.assign({}, unwrap(contents.data.properties));
			appProperties.initialized = false;
			newMsg.appProperties = appProperties
		}

		let properties = Object.assign({}, unwrap(node.data.properties));
		properties.initialized = false;
		newMsg.cloneID = null
		newMsg.properties = properties
		//Object.assign(newMsg, properties)
		newMsg.position = { x: local.data.properties.position.x + 20, y: local.data.properties.position.y + 20 }
		props.selo.sendExtMsg({ msg: msg[0], id: props.parentID, params: [newMsg] })

	}

	function handleCloneNode(data) {

		let msg = Object.assign({}, data)

		let cloneID = msg[1].cloneID
		let node = props.selo.getNodeByID(cloneID)
		let newCloneID = node ? cloneID : props.nodeID + "_contents"
		msg[1].cloneID = newCloneID
		msg[1].position = { x: local.data.properties.position.x + 20, y: local.data.properties.position.y + 20 }
		props.selo.sendExtMsg({ msg: msg[0], id: props.parentID, params: [msg[1]] })
	}


	function handleClick(msg) {
		props.selo.sendExtMsg({ msg: msg, id: props.nodeID })
	}

	function handleTicking(value) {
		props.selo.sendExtMsg({ msg: "setProperty", id: props.nodeID, params: ["ticking", value] })
	}

	function handleOnDrag(data) {
		let msg = Object.assign({}, data)
		props.selo.sendExtMsg({ msg: "onDrag", id: props.nodeID, params: [msg] })
	}

	let dragComp
	const [menuVis, setMenuVis] = createSignal(0)

	createPointerListeners({
		target: () => dragComp,
		pointerTypes: ["mouse", "touch"],
		onEnter: e => {
			setMenuVis(1)
		},
		onLeave: e => {
			setMenuVis(0)
		}
	});

	return (
		<>
			<div ref={dragComp}>
				<div
					ref={me}
					use:draggable={{
						//onDrag: (data) => handleOnDrag(data),
						handle: '.handle',
						grid: local.data.properties.grid,
						position: local.data.properties.position,
						disabled: true
					}}
					style={{
						border: "0px dotted grey",
						width: "fit-content",
						position: "absolute",
					}}
				>
					<div style={{
						opacity: menuVis()
					}}>
						<div class="grid" style={{
							"grid-template-columns": "min-content min-content min-content 1fr",
							"grid-template-rows": "0.1fr",
							gap: "0px 6px",
							"grid-template-areas": ". ."
						}}>

							<div class="row-span-1 box">
								<FiXCircle size={"1.3em"} />
							</div>
							<div class="row-span-1 box">
								<FiPlusCircle size={"1.3em"} />
							</div>
							<div class="row-span-1 box">
								<FiDivideCircle size={"1.3em"} />
							</div>
							<div class="row-span-1 box">
								<div class="bg-blend-color handle"
									style={{
										border: "1px dotted grey",
										height: "20px",
										"background-color": "grey",
										opacity: 0.2,
										"min-width": "100px"
									}}></div>
							</div>
						</div>
					</div>

					<Show when={props.contents}>
						<Dynamic
							component={components[props.contents]}
							{...props}
							nodeID={props.cloneID ? props.cloneID : props.nodeID + "_contents"}
							dynamic={true}
							containerID={props.nodeID}
							parentID={props.nodeID}
							worldID={props.parentID}
							properties={props.properties}
							appProperties={props.appProperties}

						/>
					</Show>
				</div>

				<div ref={meView}
					use:draggable={{
						handle: '.handle',
						onDrag: (data) => handleOnDrag(data),
						grid: local.data.properties.grid,
						position: local.data.properties.position
						//bounds: 'parent'
					}}
					style={{
						width: `${width()}px`,
						border: "1px dotted grey",
						opacity: 0,
						position: "absolute"
					}}
				>
					<div>
						<div class="grid" style={{
							"grid-template-columns": "min-content min-content min-content 1fr",
							"grid-template-rows": "0.1fr",
							gap: "0px 6px",
							"grid-template-areas": ". ."
						}}>

							<div class="row-span-1 box">
								<div onClick={handleDelete}> <FiXCircle size={"1.3em"} />
								</div>
							</div>
							<div class="row-span-1 box">
								<div onClick={
									[handleCloneNode, ["createNode", { component: props.contents, cloneID: props.cloneID ? props.cloneID : props.nodeID + "_contents", noAvatar: props.noAvatar }]]}><FiPlusCircle size={"1.3em"} /></div>

							</div>
							<div class="row-span-1 box">
								<div onClick={
									[handleCopyNode, ["createNode", { component: props.contents, noAvatar: props.noAvatar, cloneID: props.cloneID ? props.cloneID : props.nodeID + "_contents" }]]}><FiDivideCircle size={"1.3em"} /></div>
							</div>
							<div class="row-span-1 box">
								<div class="bg-blend-color handle"
									style={{
										border: "1px dotted grey",
										height: "20px",
										"background-color": "red",
										opacity: 0.5,
										"min-width": "100px"
									}}></div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}
