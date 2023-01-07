/*
The MIT License (MIT)
Copyright (c) 2022 Nikolay Suslov and the Krestianstvo.org project contributors.
(https://github.com/NikolaySuslov/krestianstvo/blob/master/LICENSE.md)
*/

import { onMount } from 'solid-js';
import { createLocalStore, showState, createQRCode, createLinkForSelo } from 'krestianstvo'

import Styles from '../Web/Styles'

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



	function handleClick(msg) {
		props.selo.sendExtMsg({ msg: msg, id: props.nodeID })
	}

	function handleTicking(value) {
		props.selo.sendExtMsg({ msg: "setProperty", id: props.nodeID, params: ["ticking", value] })
	}

	function handleTextInput(msg) {
		props.selo.sendExtMsg({ msg: "textChanged", id: props.nodeID, params: [msg] })
	}

	let thisDiv;

	let link = createLinkForSelo(props.selo, { p: props.parameters, d: props.deepCount, u: props.urlSource })

	onMount(() => {
		createQRCode(thisDiv, link)
	})

	return (
		<>

			<div p-1>
				<a href={link} text-center fw300 target="_blank">Link</a>
				<div text-center ref={thisDiv} />

			</div>


			<div class="p2 truncate">
				<pre>
					<strong>Selo</strong>
					<br />World: {props.selo.app}
					<br />ID: {props.selo.id}
					<br />Reflector: {props.selo.reflectorHost}
				</pre>
				<pre>Virtual Time: <strong>{props.selo.storeNode.tick?.toPrecision(4)} </strong></pre>
				<pre>Clients: </pre>
				<For each={props.selo.storeNode.clients} fallback={<div>Loading...</div>}>
					{(item) =>
						<Switch>
							<Match when={item === props.selo.storeVT.moniker_}>
								<strong><div>Me: {item} </div></strong>
							</Match>
							<Match when={item !== props.selo.storeVT.moniker_}>
								<div>{item}</div>
							</Match>
						</Switch>
					}
				</For>

				{/* <div>
                    <pre>
                        <strong>Debug</strong>
                        <br />
                        Deep: {props.deep} </pre>
                    <button onClick={[showState, props.selo.owner]}>Show state</button>
                </div> */}
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
