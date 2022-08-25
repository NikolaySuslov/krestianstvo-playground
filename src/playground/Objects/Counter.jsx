/*
The MIT License (MIT)
Copyright (c) 2022 Nikolay Suslov and the Krestianstvo.org project contributors.
(https://github.com/NikolaySuslov/krestianstvo/blob/master/LICENSE.md)
*/

import { onMount } from 'solid-js';
import { createLocalStore } from 'krestianstvo'

import Styles from '../Web/Styles'

export default function Counter(props) {

	const { buttonGreen, buttonRed, buttonGrey } = Styles

	const [local, setLocal] = createLocalStore({
		data: {
			type: "Counter",
			nodeID: props.nodeID,
			properties: {
				name: props.name ? props.name : props.nodeID,
				count: 0,
				textInput: "",
				ticking: false,
				initialized: false,
				dynamic: props.dynamic ? props.dynamic : false,
				parentID: props.parentID ? props.parentID : null
			},
			dynamic: [
			]
		}
	}, props);


	const add = () => {
		setLocal("data", "properties", "count", (a) => a + 1)
	}

	const sub = () => {
		setLocal("data", "properties", "count", (a) => a - 1);
	}

	const step = (tick) => {
		// step on tick
		//Call action by: 
		//local.setActions["add"]([]) or 
		//add() or
		//props.selo.callAction(props.nodeID, "add", []) or

		props.selo.future(props.nodeID, "add", 0, [])

	}


	const initialize = () => {}

	const doesNotUnderstand = (data) => {
		console.log("MY doesNotUnderstand action: ", data)
	}

	const textChanged = (data) => {
		setLocal("data", "properties", "name", data[0])
	}

	props.selo.createAction(props.nodeID, "doesNotUnderstand", doesNotUnderstand, true)
	props.selo.createAction(props.nodeID, "add", add)
	props.selo.createAction(props.nodeID, "sub", sub)
	props.selo.createAction(props.nodeID, "step", step)
	props.selo.createAction(props.nodeID, "initialize", initialize)
	props.selo.createAction(props.nodeID, "textChanged", textChanged)


	onMount(() => {})

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
				<div class="text-3xl fw400">{local.data.properties.name}</div>
				<input
					placeholder="enter text"
					value={local.data.properties.name}
					onInput={(e) => handleTextInput(e.currentTarget.value)}
				/>
				<div class="flex gap-2">
					<div class="p-2"><button class={buttonGrey()} onClick={[handleClick, "sub"]}>-</button></div>
					<div class="p-4 text-3xl fw200 flex"
						style={{
							width: "30px"
						}}> {local.data.properties.count}</div>
					<div class="p-2"><button class={buttonGrey()} onClick={[handleClick, "add"]}>+</button></div>
				</div>
				<Switch fallback={<div>Not Found</div>}>
					<Match when={!local.data.properties.ticking}>
						<button class={buttonGreen()} onClick={[handleTicking, true]}>Start</button>
					</Match>
					<Match when={local.data.properties.ticking}>
						<button class={buttonRed()} onClick={[handleTicking, false]}>Stop</button>
					</Match>
				</Switch>
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
