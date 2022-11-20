/*
The MIT License (MIT)
Copyright (c) 2022 Nikolay Suslov and the Krestianstvo.org project contributors.
(https://github.com/NikolaySuslov/krestianstvo/blob/master/LICENSE.md)
*/

import { onMount, splitProps } from 'solid-js';
import { createLocalStore, collectParentSelos, createLinkForSelo, getSeloByID, Selo } from 'krestianstvo'


export default function SeloPortal(props) {

	const [local, setLocal] = createLocalStore({
		data: {
			type: "App",
			nodeID: props.nodeID,
			properties: {
				name: props.name ? props.name : props.nodeID,
				ticking: false,
				initialized: false,
				url: props.url ? props.url : '',
				editURL: false,
				editMode: true
			},
			dynamic: [
			],
			dynamicSelo: [
			]
		}
	}, props);


	const step = (tick) => {
		// step on tick
	}

	const initialize = () => {

		if (local.data.properties.url.length > 0)
			createPortal()
	}

	const doesNotUnderstand = (data) => {
		console.log("MY doesNotUnderstand action: ", data)

	}

	const textChanged = (data) => {
		setLocal("data", "properties", "url", data[0])
	}


	const checkURL = (source) => {
		try { return Boolean(new URL(source)) }
		catch (e) {
			return false
		}
	}

	const createFromURL = (data) => {

		let url = new URL(data)
		let k = new URLSearchParams(url.search).get("k");
		let r = new URLSearchParams(url.search).get("r");
		let d = new URLSearchParams(url.search).get("d");
		let p = new URLSearchParams(url.search).get("p");
		let e = new URLSearchParams(url.search).get("e");
		let i = new URLSearchParams(url.search).get("i");


		props.selo.callAction(props.nodeID, "createSelo", [{
			id: k ? k : null,
			reflectorHost: r ? r : "",
			app: url.pathname.slice(1),
			info: i && i == 0 ? false : i && i == 1 ? true : (props.info == false) ? props.info : true,
			deepCount: d ? d : props.dc ? props.dc : 2,
			index: 0,
			parameters: p ? p : undefined
		}])

		setLocal("data", "properties", "editMode", e ? e : true)
		console.log("Create portal: ", url)

	}

	const createPortal = (data) => {

		if (checkURL(local.data.properties.url)) {
			createFromURL(local.data.properties.url)
		} else {
			console.log("Not valid URL!")
			let regex = /[A-Z0-9]*/
			let app = local.data.properties.url
			if (regex.test(app) && app.length > 0) {
				let newURL = window.location.origin + '/' + app

				if (checkURL(newURL)) {
					setLocal("data", "properties", "url", newURL)
					createFromURL(newURL)
				} else {
					console.log("Not valid app name!")
				}
			}
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

		let el = local.data.dynamicSelo[0]
		if (el) {
			let selo = getSeloByID(el.seloID)
			if (selo) {
				let url = createLinkForSelo(selo)
				setLocal("data", "properties", "url", url)
			}

		}
		props.selo.sendExtMsg({ msg: "setProperty", id: props.nodeID, params: ["editURL", value] })
	}

	function handleTextInput(msg) {
		props.selo.sendExtMsg({ msg: "textChanged", id: props.nodeID, params: [msg] })
	}


	const [seloData, params] = splitProps(
		props,
		["selo", "seloID", "nodeID", "url"] //"seloID", "deep", "deepCount", "worldsPath"
	);

	return (
		<>
			<div class="bg-blend-color relative"
				style={{
					border: "0.5px solid grey",
				}}>
				<Show when={local.data.properties.editMode == true}>
					<Switch>
						<Match when={!local.data.properties.editURL}>
							<Show when={local.data.dynamicSelo[0]}>
								<div class="gap-1 pt1 relative z-10">
									<button onClick={[handleEditURL, true]}>e</button>
									<button onClick={[handleEditMode, false]}>hide</button>
								</div>
							</Show>

						</Match>
						<Match when={local.data.properties.editURL}>
							<div class="gap-1 pt1 relative z-10">
								<Show when={local.data.dynamicSelo[0]}>
									<button onClick={[handleEditURL, false]}>x</button>
								</Show>
							</div>
						</Match>
					</Switch>
				</Show>

				<Switch>
					<Match when={(!local.data.properties.editURL && local.data.dynamicSelo.length == 0)
						|| local.data.properties.editURL}>
						<div>
							<div class="text-3xl fw400">Portal</div>
							<input
								size={60}
								placeholder="enter url or world name like: painter, demo1, rapier, grid, fiber"
								value={local.data.properties.url}
								onInput={(e) => handleTextInput(e.currentTarget.value)}
							/>
							<div class="flex gap-1 pt1">
								<Switch>
									<Match when={local.data.properties.url.length > 0 && !local.data.dynamicSelo[0]}>
										<button onClick={[handleClick, ["createPortal"]]}>Create portal</button>
									</Match>
									<Match when={local.data.properties.url.length > 0 && local.data.dynamicSelo[0]}>
										<button onClick={[handleClick, ["createPortal"]]}>Update portal</button>
									</Match>
								</Switch>
								<Show when={local.data.dynamicSelo[0]}>
									<button onClick={[handleClick, ["deleteSelo", local.data.dynamicSelo[0]]]}>Delete portal</button>
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

				<div>
					<For each={local.data.dynamicSelo}>
						{(item) =>
							<div>
								 <Show when={props.selo.storeVT.stateSynced}>
								<Selo
									{...params}
									nodeID={item.app}
									//app={item.app}
									seloID={item.seloID}
									info={item.info}
									reflectorHost={item.reflectorHost}
									deep={collectParentSelos(props.selo.id).includes(item.seloID) ? props.deep : collectParentSelos(item.seloID).includes(props.selo.id) ? props.deep - 1 : 0}
									deepCount={item.deepCount}
									parentSeloID={props.selo.id}
									parameters={item.parameters}
									component={props.worlds ? props.worlds[item.app] : props.fallbackWorld}
								/>
								</Show>
							</div>
						}
					</For>
				</div>
			</div>
		</>
	)
}
