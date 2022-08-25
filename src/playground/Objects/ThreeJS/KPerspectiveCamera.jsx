/*
The MIT License (MIT)
Copyright (c) 2022 Nikolay Suslov and the Krestianstvo.org project contributors.
(https://github.com/NikolaySuslov/krestianstvo/blob/master/LICENSE.md)
*/

import { onMount, createEffect, onCleanup, batch } from 'solid-js';
import { produce } from "solid-js/store";
import { createLocalStore } from 'krestianstvo'

import { PerspectiveCamera } from "three/src/cameras/PerspectiveCamera";

const THREE = {
	PerspectiveCamera,
};

const KPerspectiveCamera = (props) => {

	const [local, setLocal] = createLocalStore({
		data: {
			type: "THREENode",
			nodeID: props.nodeID,
			properties: {
				name: props.name ? props.name : props.nodeID,
				ticking: false,
				initialized: false,
				parentID: props.parentID ? props.parentID : null,
				aspect: 1,
				location: props.location ? props.location : [0, 0, 0],
				rotation: props.rotation ? props.rotation : [0, 0, 0],
				xRatioFullDisplay: 1,
				yRatioFullDisplay: 1,
				xRatioOffset: props.xRatioOffset ? props.xRatioOffset : 0,
				yRatioOffset: props.yRatioOffset ? props.yRatioOffset : 0,
				xDeltaOffset: 0,
				yDeltaOffset: 0,
				width: props.width ? props.width : 720,
				height: props.height ? props.height : 480,
				multicam: props.multicam ? props.multicam : false,
				displayGrid: props.displayGrid ? props.displayGrid : "1x1",
				display: props.display ? props.display : 0,
				gridID: props.gridID ? props.gridID : 0,
			},
			cameraMaps: ["1x1", "2x2", "3x2", "4x4"]
		}
	}, props);


	const cameraMaps = {
		"1x1": {
			xRatioFullDisplay: 1,
			yRatioFullDisplay: 1,
			grid: [
				[0, 0]
			]
		},
		"2x2": {
			xRatioFullDisplay: 2,
			yRatioFullDisplay: 2,
			grid: [
				[0, 0],
				[1, 0],

				[0, 1],
				[1, 1]
			]
		},
		"3x2": {
			xRatioFullDisplay: 3,
			yRatioFullDisplay: 2,
			grid: [
				[0, 0],
				[1, 0],
				[2, 0],

				[0, 1],
				[1, 1],
				[2, 1]
			]
		},
		"4x4": {
			xRatioFullDisplay: 4,
			yRatioFullDisplay: 4,
			grid: [
				[0, 0],
				[1, 0],
				[0, 1],
				[1, 1],

				[2, 0],
				[3, 0],
				[2, 1],
				[3, 1],

				[0, 2],
				[1, 2],
				[0, 3],
				[1, 3],

				[2, 2],
				[3, 2],
				[2, 3],
				[3, 3]

			]
		}
	}

	const aspect = local.data.properties.width * local.data.properties.xRatioFullDisplay / local.data.properties.height * local.data.properties.yRatioFullDisplay;
	const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);


	createEffect(() => {

		let width = local.data.properties.width;
		let height = local.data.properties.height;

		let fullWidth = width * local.data.properties.xRatioFullDisplay;
		let fullHeight = height * local.data.properties.yRatioFullDisplay;
		let xoffset = (width * local.data.properties.xRatioOffset) + local.data.properties.xDeltaOffset;
		let yoffset = (height * local.data.properties.yRatioOffset) + local.data.properties.yDeltaOffset;

		camera.setViewOffset(
			fullWidth,
			fullHeight,
			xoffset,
			yoffset,
			width,
			height);

		if (camera.sceneID)
			props.selo.callAction(camera.sceneID, "updateViewOffset", {})

	})

	const step = (tick) => {
		// step on tick
	}

	const initialize = () => { 
		//initialize
	}

	const setGrid = (data) => {

		let cm = data[0]
		let display = data[1]

		setLocal("data", "properties", "displayGrid", cm)
		props.selo.future(props.nodeID, "setDisplay", 0, display);

	}


	const changeAspect = (data) => {

		console.log("Change aspect: ", data)
		batch(() => {
			setLocal("data", "properties", "width", data[0])
			setLocal("data", "properties", "height", data[1])
		})

	}

	const setDisplay = (data) => {

		let cm = data[0] == "default" ? cameraMaps["1x1"] : cameraMaps[local.data.properties.displayGrid]
		let index = data[0] == "default" ? 0 : data[0]

		if (cm?.grid[index]) {
			batch(() => {
				setLocal("data", "properties", "xRatioOffset", cm.grid[index][0])
				setLocal("data", "properties", "yRatioOffset", cm.grid[index][1])

				setLocal("data", "properties", "xRatioFullDisplay", cm.xRatioFullDisplay)
				setLocal("data", "properties", "yRatioFullDisplay", cm.yRatioFullDisplay)
			})
		}
	}

	props.selo.createAction(props.nodeID, "initialize", initialize)
	props.selo.createAction(props.nodeID, "step", step)
	props.selo.createAction(props.nodeID, "setDisplay", setDisplay)
	props.selo.createAction(props.nodeID, "setGrid", setGrid)
	props.selo.createAction(props.nodeID, "changeAspect", changeAspect)


	onMount(() => {
	})

	onCleanup(() => {
		console.log("Remove: ", camera.name)
		camera.removeFromParent()

		props.selo.setStoreNode(
			produce((s) => {
				s.storesRefs[props.nodeID] = undefined
				s.localStores[props.nodeID] = undefined
			})
		);

	})

	createEffect(() => {
		camera.position.set(...local.data.properties.location);
	})

	createEffect(() => {
		camera.rotation.set(...local.data.properties.rotation);
	})


	createEffect(() => {
		let allClients = props.selo.storeNode.clients.length

		let display = {
			grid: "1x1"
		}

		if (allClients <= 1) {
			display.grid = "1x1"
			changeAspect([640, 480])

		}

		if (allClients >= 2 && allClients <= 5) {
			display.grid = "2x2"
			changeAspect([480, 360])
		}

		if (allClients >= 6 && allClients <= 17) {
			display.grid = "4x4"
			changeAspect([200, 200])

		}

		if (allClients > 24) {
			changeAspect([100, 100])
		}


		props.gridIndex ? props.selo.callAction(props.nodeID, "setGrid",
			[display.grid, props.gridIndex]) :
			props.selo.callAction(props.nodeID, "setGrid", [display.grid,
			props.selo.storeNode.clients.indexOf(props.selo.storeVT.moniker_)
			])

	})

	camera.name = props.nodeID
	return camera;

}

export { KPerspectiveCamera }

