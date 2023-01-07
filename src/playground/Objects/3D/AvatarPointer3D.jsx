/*
The MIT License (MIT)
Copyright (c) 2022 Nikolay Suslov and the Krestianstvo.org project contributors.
(https://github.com/NikolaySuslov/krestianstvo/blob/master/LICENSE.md)
*/

import { createEffect, createSignal, onCleanup, batch, untrack } from 'solid-js';
import * as THREE from "three";
import { sgn } from './PortalGL';
import { createLocalStore, getRandomColor, deleteNode } from 'krestianstvo'
import { useThree, useFrame } from "@krestianstvo/solid-three";

export default function AvatarPointer3D(props) {

	const path = import.meta.url// + props.nodeID

	const [local, setLocal] = createLocalStore({
		data: {
			type: "Avatar",
			nodeID: props.nodeID,
			properties: {
				ticking: true,
				paused: false,
				angle: 0,
				size: props.size ? props.size : 0.3,
				opacity: props.opacity ? props.opacity : 0.7,
				theta: 0,
				initialized: false,
				color: props.color ? props.color : 'hotpink',
				scale: props.scale ? props.scale : [1, 1, 1],
				position: props.position ? props.position : [0, 0, 0],
				rotation: props.rotation ? props.rotation : [0, 0, 0],
				costumeGeometry: props.costumeGeometry ? props.costumeGeometry : "SphereGeometry"
			},
			currentWorld: null,
			dynamic: [
			]
		}
	}, props)

	let ref
	let cur
	const _portalData = new Map();

	const _vector1 = new THREE.Vector3();
	const _vector2 = new THREE.Vector3();
	const _vector3 = new THREE.Vector3();

	const _vector4 = new THREE.Vector3();

	//view signal
	const _posVector = new THREE.Vector3();
	const [pos, setPos] = createSignal(null);
	const _oldPosVector = new THREE.Vector3();

	const initialize = () => {

		//setLocal("data", "properties", "initialized", true);

		setRandomColor()
		randomCostume()

	}

	const setRandomColor = () => {

		let newColor = getRandomColor(props.selo)
		setLocal("data", "properties", "color", newColor);

	}

	const randomCostume = () => {
		const geometries = ["DodecahedronGeometry", "IcosahedronGeometry", "OctahedronGeometry", "TetrahedronGeometry", "SphereGeometry", "BoxGeometry"];

		const random = Math.floor(props.selo.random() * geometries.length);
		console.log(random, geometries[random]);
		setLocal("data", "properties", "costumeGeometry", geometries[random])// geometries[random]);

	}

	const step = (tick) => {

		if (!local.data.properties.paused) {

			if (props.nodeID.includes(props.moniker_)) {

				let v = untrack(() => pos())
				if (v && !_oldPosVector.equals(v)) {
					//console.log("Avatar ", props.moniker_, ': ', v);
					props.selo.sendExtMsg({ msg: "changePosition", id: props.nodeID, params: ["position", props.nodeID, v.x, v.y, v.z] })

					_oldPosVector.copy(v)
				}

			}

		}
	}

	const changePosition = (msg) => {
		//console.log("Avatar ", props.moniker_, ': ', data);
		let data = msg //[0]
		setLocal("data", "properties", "position", [data[2], data[3], data[4]])
	}

	const setCurrentWorld = (data) => {

		console.log("World:", data)

		//leave current world
		props.selo.future(data[0], "deleteAvatar", 0, local.data.nodeID)

		//set new current world
		setLocal("data", "currentWorld", data[0])

	}

	props.selo.createAction(props.nodeID, "initialize", initialize)
	props.selo.createAction(props.nodeID, "step", step)
	props.selo.createAction(props.nodeID, "changePosition", changePosition)
	props.selo.createAction(props.nodeID, "setRandomColor", setRandomColor)
	props.selo.createAction(props.nodeID, "randomCostume", randomCostume)
	props.selo.createAction(props.nodeID, "setCurrentWorld", setCurrentWorld)

	function update(state) {

		ref.getWorldPosition(_vector1);
		const cameraWorldPos = _vector1;
		for (let i = 0; i < props.portals.length; i++) {
			const portal = props.portals[i];

			if (portal.mesh.parent.globalCollisionBox) {

				if (!_portalData.has(portal.mesh.id)) {
					_portalData.set(portal.mesh.id, {
						previousDot: null,
						previousInRange: false,
					});
				}
				portal.mesh.getWorldPosition(_vector2);
				_vector2.subVectors(cameraWorldPos, _vector2);
				const portalToCamera = _vector2;
				portal.mesh.getWorldDirection(_vector3);
				const portalWorldDir = _vector3;

				const data = _portalData.get(portal.mesh.id);
				const previousDot = data.previousDot;
				const dot = portalToCamera.dot(portalWorldDir);
				const previousDotSign = sgn(previousDot);
				const dotSign = sgn(dot);

				portalWorldDir.multiplyScalar(dot);

				// Check if camera is colliding with portal's collision bbox (which extends in front and behind the portal surface)
				// NOTE: an object going really fast could be a problem here
				const inRange = portal.mesh.parent.globalCollisionBox.containsPoint(cameraWorldPos);

				let portalScene = state.scene.getObjectByName(portal.destinationScene, true); 

				if (portalScene) {


					let destination = portalScene.getObjectByName(portal.destinationName, true);

					//let destinationScene = state.scene.getObjectByName(destination.userData.destinationScene, true)
					// Make sure we are either currently in front/behind portal, or that we were last frame (don't want to teleport if we are off to the side)
					if (
						//previousDot !== null && //TODO 
						//dotSign !== previousDotSign &&
						(props.scene !== portal.sceneName || portal.destinationScene == portal.sceneName) &&
						destination &&
						(portal.mesh.doubleSided || dotSign < 0)
						&& (inRange) //|| data.previousInRange
					) {
						// Valid teleport!
						//console.log("TELEPORT! to: ", destination)

						state.scene.children.forEach(ch => {
							if (ch.isScene) {
								let all = ch.getObjectByName(props.nodeID, true);
								if (all) {
									if (props.currentSceneOnView().name !== all.parent.name || props.currentSceneOnView().name == portal.sceneName) {
										all.visible = true
									} else {
										all.visible = false
									}
								}
							}
						})

						if (
							portal.destinationScene == portal.sceneName ||
							portal.destinationScene == props.currentSceneOnView().name

						) {

							data.previousDot = null;
							data.previousInRange = false;

							const dest = destination;
							const destData = _portalData.get(dest.id);
							// If dot is zero, don't multiply by -1
							if (destData) {
								destData.previousDot = dotSign === 0.0 ? dot : -1 * dot;
								destData.previousInRange = inRange;

								// Teleport camera
								const newWorldMatrix = portal.portal.destinationTransform
									.clone()
									.multiply(ref.matrixWorld);
								// Ensure camera values are up to date

								let translation = new THREE.Vector3(),
									rotation = new THREE.Quaternion(),
									scale = new THREE.Vector3();
								newWorldMatrix.decompose(translation, rotation, scale);

								// newWorldMatrix.decompose(
								// 	ref.position,
								// 	ref.quaternion,
								// 	ref.scale
								// );
								ref.position.set(translation.x, translation.y, translation.z);
								ref.scale.set(scale.x, scale.y, scale.z);

								ref.updateMatrix();
								ref.updateWorldMatrix(true);

								ref.getWorldPosition(cameraWorldPos);
								//ref.teleport = true

								for (let j = 0; j < props.portals.length; j++) {
									if (j === i) continue;
									let p = _portalData.get(props.portals[j].mesh.id)
									if (p)
										p.previousDot = null;
								}

							}

						}
					} else {
						// Invalid, but update data
						_portalData.get(portal.mesh.id).previousDot = dot;
						data.previousInRange = inRange;
					}
				}

			}
		}
	}

	// useThree((state) => {
	// 	if (state && ref) { }
	// })


	useFrame((state) => {

		if (ref && ref.name == "") {
			ref.name = local.data.nodeID
		}

		if (props.nodeID.includes(props.moniker_)) {
			state.raycaster.ray.at(5, _posVector);
			setPos(_posVector)
		}

		update(state)
	})


	onCleanup(() => {
		console.log("delete avatar");
		//deleteNode([props.nodeID], setLocal, props.selo)
	});


	function Box(props) {
		let box;

		// let cv = box.__r3f.root.getState().gl.domElement;

		// useThree((state)=>{
		//   console.log("State: ",box)
		//  })

		// useFrame(()=>{
		// })

		const handleBoxClick = () => {
			props.selo.sendExtMsg({ msg: "setRandomColor", id: props.nodeID, params: [] })
		}

		return (
			<mesh position={props.position} ref={box}  >
				<boxBufferGeometry args={[0.4, 0.4, 0.4]} />
				<meshPhysicalMaterial color={props.color} />
			</mesh>
		)
	}

	const costumes = {
		"Box": Box
	}

	const RandomMesh = (props) => {
		return (
			<mesh castShadow>
				<Switch>
					<Match when={props.costumeGeometry == "SphereGeometry" || !props.costumeGeometry}>
						<sphereGeometry args={[props.size, 16, 16]} />
					</Match>
					<Match when={props.costumeGeometry == "BoxGeometry"}>
						<boxGeometry />
					</Match>
					<Match when={props.costumeGeometry == "DodecahedronGeometry"}>
						<dodecahedronGeometry args={[props.size, 0]} />
					</Match>
					<Match when={props.costumeGeometry == "IcosahedronGeometry"}>
						<icosahedronGeometry args={[props.size, 0]} />
					</Match>
					<Match when={props.costumeGeometry == "OctahedronGeometry"}>
						<octahedronGeometry args={[props.size, 0]} />
					</Match>
					<Match when={props.costumeGeometry == "TetrahedronGeometry"}>
						<tetrahedronGeometry args={[props.size, 0]} />
					</Match>
				</Switch>

				<meshPhysicalMaterial color={props.color} transparent={true} opacity={props.opacity} />
			</mesh>
		)
	}

	return (
		<group ref={ref} position={local.data.properties.position} scale={local.data.properties.scale}>
			<Show when={!props.dynamicCostume}>
				<RandomMesh costumeGeometry={local.data.properties.costumeGeometry} color={local.data.properties.color} transparent={true} opacity={local.data.properties.opacity} ></RandomMesh>
			</Show>
			<Show when={props.dynamicCostume}>
				<RandomMesh costumeGeometry={props.dynamicCostume} color={local.data.properties.color} transparent={true} opacity={local.data.properties.opacity} ></RandomMesh>
			</Show>
			<Show when={props.costume}>
				<Dynamic component={props.costume} selo={props.selo} color={local.data.properties.color} />
			</Show>

		</group>
		// </Show>
	)


}

