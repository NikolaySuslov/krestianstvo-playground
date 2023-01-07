/*
The MIT License (MIT)
Copyright (c) 2022 Nikolay Suslov and the Krestianstvo.org project contributors.
(https://github.com/NikolaySuslov/krestianstvo/blob/master/LICENSE.md)
*/

import { onMount, splitProps } from 'solid-js';
import { createLocalStore, } from 'krestianstvo'

export default function AppCreator(props) {

	const [local, setLocal] = createLocalStore({
		data: {
			type: "App",
			component: "AppCreator",
			nodeID: props.nodeID,
			properties: props.properties ? props.properties : {
				name: props.name ? props.name : props.nodeID,
				ticking: false,
				initialized: false,
				url: props.url ? props.url : '',
				editURL: false,
				editMode: true,
				parentID: props.parentID ? props.parentID : null
			},
			dynamic: [
			],
			dynamicSelo: [
			]
		}
	}, props);

	const step = (tick) => { }
	const initialize = () => {
		console.log("initialize portal")
		// if (local.data.properties.url.length > 0)
		// 	createPortal()
	 }

	const doesNotUnderstand = (data) => {
		console.log("MY doesNotUnderstand action: ", data)
	}

	const textChanged = (data) => {
		setLocal("data", "properties", "url", data[0])
	}

	const createFromURL = (data) => {

		if (local.data.dynamic[0])
			props.selo.callAction(props.nodeID, "deleteNode", local.data.dynamic[0].nodeID)

		props.selo.callAction(props.nodeID, "createNode", [{
			type: "App",
			component: data,
			index: 0,
		}])

		setLocal("data", "properties", "editMode", true)
		console.log("Create portal: ", data)
	}

	const createPortal = (data) => {

		let regex = /[A-Z0-9]*/
		let app = local.data.properties.url
		if (regex.test(app) && app.length > 0) {
			(Object.keys(props.worlds).includes(app)) ?
				createFromURL(app) : createFromURL("empty")

		}
	}

	props.selo.createAction(props.nodeID, "doesNotUnderstand", doesNotUnderstand, true)
	props.selo.createAction(props.nodeID, "step", step)
	props.selo.createAction(props.nodeID, "initialize", initialize)
	props.selo.createAction(props.nodeID, "textChanged", textChanged)
	props.selo.createAction(props.nodeID, "createPortal", createPortal)

	onMount(() => { })

	function handleClick(msg) {
		props.selo.sendExtMsg({ msg: msg[0], id: props.nodeID, params: [msg[1]] })
	}

	function handleEditMode(value) {
		props.selo.sendExtMsg({ msg: "setProperty", id: props.nodeID, params: ["editMode", value] })
	}

	function handleEditURL(value) {
		props.selo.sendExtMsg({ msg: "setProperty", id: props.nodeID, params: ["editURL", value] })
	}

	function handleTextInput(msg) {
		props.selo.sendExtMsg({ msg: "textChanged", id: props.nodeID, params: [msg] })
	}

	const [seloData, params] = splitProps(
		props,
		["selo", "nodeID", "properties"] //"seloID", "deep", "deepCount", "worldsPath"
	);

	return (
		<>
			<div
				style={{
					border: "0.5px solid grey",
				}}>
				<Show when={local.data.properties.editMode == true}>
					<Switch>
						<Match when={!local.data.properties.editURL}>
							<Show when={local.data.dynamic[0]}>
								<div class="gap-1 pt1 relative z-10">
									<button onClick={[handleEditURL, true]}>e</button>
									<button onClick={[handleEditMode, false]}>hide</button>
								</div>
							</Show>

						</Match>
						<Match when={local.data.properties.editURL}>
							<div class="gap-1 pt1 relative z-10">
								<Show when={local.data.dynamic[0]}>
									<button onClick={[handleEditURL, false]}>x</button>
								</Show>
							</div>
						</Match>
					</Switch>
				</Show>

				<Switch>
					<Match when={(!local.data.properties.editURL && local.data.dynamic.length == 0)
						|| local.data.properties.editURL}>
						<div>
							<div class="text-3xl fw400">App</div>
							<input
								size={60}
								placeholder="enter world name like: k, painter, demo1, rapier, grid, fiber, simple"
								value={local.data.properties.url}
								onInput={(e) => handleTextInput(e.currentTarget.value)}
							/>
							<div class="flex gap-1 pt1">
								<Switch>
									<Match when={local.data.properties.url.length > 0 && !local.data.dynamic[0]}>
										<button onClick={[handleClick, ["createPortal"]]}>Create app</button>
									</Match>
									<Match when={local.data.properties.url.length > 0 && local.data.dynamic[0]}>
										<button onClick={[handleClick, ["createPortal"]]}>Update app</button>
									</Match>
								</Switch>

								<Show when={local.data.dynamic[0]}>
									<button onClick={[handleClick, ["deleteNode", local.data.dynamic[0].nodeID]]}>Delete app</button>
								</Show>
							</div>
						</div>
					</Match>
					<Match when={local.data.properties.editMode == false}>
						<div class="flex gap-1 absolute z-11">
							<button onClick={[handleEditMode, true]}>show</button>
						</div>
					</Match>
				</Switch>
				{/* class="-mt-6" */}
				<div>
					<For each={local.data.dynamic}>
						{(item) =>
							<Dynamic
								{...params}
								component={props.worlds[item.component] ? props.worlds[item.component] : props.fallbackWorld}
								nodeID={item.nodeID}
								appName={item.component}
								name={item.name}
								dynamic={true}
								parentID={props.nodeID}
								selo={props.selo}
								deep={props.deep}
								noAvatar={true}
								properties={props.appProperties}
							/>
						}
					</For>
				</div>
			</div>
		</>
	)
}
