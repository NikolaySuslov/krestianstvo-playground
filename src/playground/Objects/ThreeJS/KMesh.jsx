/*
The MIT License (MIT)
Copyright (c) 2022 Nikolay Suslov and the Krestianstvo.org project contributors.
(https://github.com/NikolaySuslov/krestianstvo/blob/master/LICENSE.md)
*/

import { batch, createEffect, onMount, onCleanup } from 'solid-js';
import { createLocalStore } from 'krestianstvo'

import { Mesh } from "three/src/objects/Mesh";
import { MeshPhongMaterial } from "three/src/materials/MeshPhongMaterial";
import { MeshNormalMaterial } from "three/src/materials/MeshNormalMaterial";
import { BoxBufferGeometry } from "three/src/geometries/BoxGeometry";

const THREE = {
	Mesh,
	MeshNormalMaterial,
	BoxBufferGeometry,
	MeshPhongMaterial
};

const KMesh = (props) => {

	const [local, setLocal] = createLocalStore({
		data: {
			type: "THREENode",
			nodeID: props.nodeID,
			properties: {
				name: props.name ? props.name : props.nodeID,
				ticking: false,
				initialized: false,
				color: props.color ? props.color : '#8AC',
				parentID: props.parentID ? props.parentID : null,
				rotation: props.rotation ? props.rotation : [0, 0, 0],
				position: props.position ? props.position : [0, 0, 0],
				animationRate: props.animationRate ? props.animationRate : 0.01

			}
		}
	}, props);


	let geometry = props.geometry ? new THREE.BoxBufferGeometry(props.geometry[0], props.geometry[1], props.geometry[2]) :
		new THREE.BoxBufferGeometry(2, 2, 2);


	const material = new THREE.MeshPhongMaterial({ color: local.data.properties.color });
	const mesh = new THREE.Mesh(geometry, material);
	mesh.castShadow = true
	mesh.receiveShadow = true;
	mesh.name = props.nodeID




	const step = (tick) => {
		// step on tick
		//rotate()
	}

	const rotate = () => {
		setLocal("data", "properties", "rotation", (a) => [a[0] + 0.01, a[1] + 0.01, a[2] + 0.01])
	}

	createEffect(() => {
		mesh.rotation.fromArray(local.data.properties.rotation)
	})

	const changeColor = (color) => {
		//setLocal("data", "properties", "color", color[0])
	}


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
		console.log("Remove: ", mesh.name)
		mesh.removeFromParent()
	})

	mesh.rotation.fromArray(local.data.properties.rotation)
	mesh.position.fromArray(local.data.properties.position)

	return mesh;

}

export { KMesh }

