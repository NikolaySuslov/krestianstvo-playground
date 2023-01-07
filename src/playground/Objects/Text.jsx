/*
The MIT License (MIT)
Copyright (c) 2022 Nikolay Suslov and the Krestianstvo.org project contributors.
(https://github.com/NikolaySuslov/krestianstvo/blob/master/LICENSE.md)
*/

import { onMount } from 'solid-js';
import { createLocalStore } from 'krestianstvo'

import Styles from '../Web/Styles'

export default function App(props) {

	const { buttonGreen, buttonRed, buttonGrey } = Styles

	const [local, setLocal] = createLocalStore({
		data: {
			type: "Node",
			nodeID: props.nodeID,
			properties: props.properties ? props.properties :{
				name: props.name ? props.name : props.nodeID,
				text: props.text ? props.text: "",
				ticking: false,
				initialized: false,
				dynamic: props.dynamic ? props.dynamic : false,
				parentID: props.parentID ? props.parentID : null
			},
			dynamic: [
			]
		}
	}, props);


	const step = (tick) => {
		// step on tick
		//Call action by: 
		//local.setActions["add"]([]) or 
		//add() or
		//props.selo.callAction(props.nodeID, "add", []) or
	}


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
		props.selo.sendExtMsg({ msg: msg, id: props.nodeID })
	}

	function handleTicking(value) {
		props.selo.sendExtMsg({ msg: "setProperty", id: props.nodeID, params: ["ticking", value] })
	}

	function handleTextInput(msg) {
		props.selo.sendExtMsg({ msg: "textChanged", id: props.nodeID, params: [msg] })
	}

	return (
		<>
			<div class="p4">
				<div class="text-3xl fw400">
				<input text-3xl fw400 style={{
						border: "none",
						"background-color": "transparent",
						//resize: "none",
						outline: "none"
				}}
					placeholder="enter text"
					value={local.data.properties.text}
					onInput={(e) => handleTextInput(e.currentTarget.value)}
				/>
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
