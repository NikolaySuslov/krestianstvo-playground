/*
The MIT License (MIT)
Copyright (c) 2022 Nikolay Suslov and the Krestianstvo.org project contributors.
(https://github.com/NikolaySuslov/krestianstvo/blob/master/LICENSE.md)
*/


import { createEffect, onMount, children, onCleanup, createSignal } from 'solid-js';
import { createLocalStore } from 'krestianstvo'

import { BoxBufferGeometry } from "three/src/geometries/BoxGeometry";
import { DirectionalLight } from "three/src/lights/DirectionalLight";
import { Mesh } from "three/src/objects/Mesh";
import { MeshNormalMaterial } from "three/src/materials/MeshNormalMaterial";
import { PerspectiveCamera } from "three/src/cameras/PerspectiveCamera";
import { Scene } from "three/src/scenes/Scene";
import { WebGLRenderer } from "three/src/renderers/WebGLRenderer";

import createRAF from "@solid-primitives/raf";

const THREE = {
	DirectionalLight,
	BoxBufferGeometry,
	Mesh,
	MeshNormalMaterial,
	PerspectiveCamera,
	Scene,
	WebGLRenderer
};

const KScene = (props) => {

	const scene = new THREE.Scene();
	const renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.shadowMap.enabled = true;
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setClearColor(0xffffff); //0xffffff //0x000000

	const [local, setLocal] = createLocalStore({
		data: {
			type: "THREENode",
			nodeID: props.nodeID,
			properties: {
				name: props.name ? props.name : props.nodeID,
				ticking: false,
				initialized: false,
				parentID: props.parentID ? props.parentID : null
			}
		}
	}, props);

	const [defaultCamera, setDefaultCamera] = createSignal(null)

	const c = children(() => props.children);
	createEffect(() => {

		if (Array.isArray(c())) {
			c().forEach(item => {

				if (item.type == "PerspectiveCamera") {
					if (item && !scene.getObjectByName(item.name)) {
						scene.add(item)
						item.sceneID = props.nodeID

						if (item.name == 'Camera_' + props.selo.storeVT.moniker_) {
							setDefaultCamera(item)
							//onWindowResize(item);
						}
					}
				}

				if ((item.isMesh || item.isLight) && !scene.getObjectByName(item.name)) {
					scene.add(item)
					console.log("Add: ", item)
				}
			})
		} else {
			console.log("Child: ", c())
		}
	})


	const addMesh = (mesh) => {

		if (mesh.isMesh && !scene.getObjectByName(mesh.name)) {
			scene.add(mesh)
		}

	}

	const switchDefaultCamera = (data) => {
		let camera = scene.getObjectByName(data[0].camera);
		if (camera && data[0].onlyMe == props.selo.storeVT.moniker_)
			setDefaultCamera(camera)

	}


	function updateViewOffset(obj) {

		if (defaultCamera()) {
			let camera = props.selo.getNodeByID(defaultCamera().name)

			let width = camera.data.properties.width;
			let height = camera.data.properties.height;

			let fullWidth = width * camera.data.properties.xRatioFullDisplay;
			let fullHeight = height * camera.data.properties.yRatioFullDisplay;

			defaultCamera().aspect = fullWidth / fullHeight
			defaultCamera().updateProjectionMatrix();
			renderer.setSize(width, height)

		}
	}



	function onWindowResize(camera) {

		camera.aspect = props.width / props.height //props.el().clientWidth / props.el().clientHeight //window.innerWidth 
		camera.updateProjectionMatrix();
		renderer.setSize(props.width, props.height) //(props.el().clientWidth, props.el().clientHeight);
	}

	const step = (tick) => {
		// step on tick
	}


	const initialize = () => {

		props.selo.callAction(props.nodeID, "updateViewOffset", {})

	}

	props.selo.createAction(props.nodeID, "initialize", initialize)
	props.selo.createAction(props.nodeID, "step", step)
	props.selo.createAction(props.nodeID, "updateViewOffset", updateViewOffset)
	props.selo.createAction(props.nodeID, "addMesh", addMesh)
	props.selo.createAction(props.nodeID, "switchCamera", switchDefaultCamera)

	const [, start, stop] = createRAF(() => {

		if (defaultCamera())
			renderer.render(scene, defaultCamera());

	});

	onMount(() => {

		start();

		//onWindowResize();
		//window.addEventListener("resize", updateViewOffset, false);
	})

	onCleanup(() => {
		stop()
		//window.removeEventListener("resize", updateViewOffset);
	});

	return (
		<>{renderer.domElement}</>
	)

}

export { KScene }

