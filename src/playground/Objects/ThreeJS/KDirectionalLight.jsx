/*
The MIT License (MIT)
Copyright (c) 2022 Nikolay Suslov and the Krestianstvo.org project contributors.
(https://github.com/NikolaySuslov/krestianstvo/blob/master/LICENSE.md)
*/

import { batch, createEffect, onMount, onCleanup } from 'solid-js';
import { createLocalStore } from 'krestianstvo'
import { DirectionalLight } from "three/src/lights/DirectionalLight";

const THREE = {
	DirectionalLight
};

const KDirectionalLight = (props) => {


	const [local, setLocal] = createLocalStore({
		data: {
			type: "THREENode",
			nodeID: props.nodeID,
			properties: {
				name: props.name ? props.name : props.nodeID,
				ticking: false,
				initialized: false,
				parentID: props.parentID ? props.parentID : null,
				rotation: props.rotation ? props.rotation : [0, 0, 0],
				position: props.direction ? props.direction : [0, 0, 0],
				animationRate: props.animationRate ? props.animationRate : 0.01
			}
		}
	}, props);


	const node = new THREE.DirectionalLight(0xffffff, 1);
	node.castShadow = true;
	node.name = props.nodeID


	const step = (tick) => {
	}

	const rotate = () => {
		setLocal("data", "properties", "rotation", (a) => [a[0] + 0.01, a[1] + 0.01, a[2] + 0.01])
	}

	createEffect(() => {
		node.rotation.fromArray(local.data.properties.rotation)
	})

	createEffect(() => {
		node.position.fromArray(local.data.properties.position)
	})

	const changeColor = (color) => {}


	const animate = () => {

		setLocal("data", "properties", "rotation", (a) =>
			[a[0] + local.data.properties.animationRate,
			a[1] + local.data.properties.animationRate,
			a[2] + local.data.properties.animationRate])
		props.selo.future(props.nodeID, "animate", 0.05)

	}

	const initialize = () => {

		batch(() => {
			setLocal("data", "properties", "ticking", true);
			animate()
		})

	}

	props.selo.createAction(props.nodeID, "initialize", initialize)
	props.selo.createAction(props.nodeID, "changeColor", changeColor)
	props.selo.createAction(props.nodeID, "step", step)
	props.selo.createAction(props.nodeID, "animate", animate)


	onMount(() => {})

	onCleanup(() => {
		console.log("Remove: ", node.name)
		node.removeFromParent()
	})

	node.rotation.fromArray(local.data.properties.rotation)
	node.position.fromArray(local.data.properties.position)

	return node;

}

export { KDirectionalLight }

