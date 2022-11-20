/*
The MIT License (MIT)
Copyright (c) 2022 Nikolay Suslov and the Krestianstvo.org project contributors.
(https://github.com/NikolaySuslov/krestianstvo/blob/master/LICENSE.md)
*/

import { produce } from "solid-js/store";
import * as THREE from "three";
import { createLocalStore, getRandomColor } from 'krestianstvo'
import { useThree, useFrame } from "@krestianstvo/solid-three";
import AvatarPointer3D from '../../Objects/3D/AvatarPointer3D';
import Window3D from "../../Objects/3D/Window3D"
import Portal2D from "../../Objects/3D/Portal2D"
import AvatarReplica from "../../Objects/3D/AvatarReplica";
import { useGLTF } from "solid-drei";
import { batch, createEffect, onMount, Switch } from "solid-js";

export default function Scene(props) {

	const path = import.meta.url// + props.nodeID

	const [local, setLocal] = createLocalStore({
		data: {
			type: "Scene",
			nodeID: props.nodeID,
			properties: {
				paused: true,
				initialized: false,
				ticking: true,
				paused: false,
				angle: [0, 0, 0],
				color: 'green',
				costumeGeometry: props.costumeGeometry ? props.costumeGeometry : "SphereGeometry"
				//start: props.start ? props.start : "direct"
			},
			avatars: [],
			dynamic: [
			]
		}
	}, props)

	let refScene;

	function Box(props) {
		let box;

		// let cv = box.__r3f.root.getState().gl.domElement;

		useThree((state) => {
			//console.log("State: ", box)
			if (state && box) {
				box.name = "BOX"

			}

		})

		// useFrame(()=>{
		// })

		const handleBoxClick = () => {
			props.selo.sendExtMsg({ msg: "setRandomColor", id: props.nodeID, params: [] })
		}

		return (
			<mesh position={props.position} ref={box} castShadow onClick={handleBoxClick}>
				<boxBufferGeometry />
				<meshPhysicalMaterial color={props.color} />
			</mesh>
		)
	}


	const initialize = () => {
		randomCostume()
	}


	const rotate = () => {
		setLocal("data", "properties", "angle", (a) => { return [a[0], a[1] + 0.1, a[2]] })
	}

	const setRandomColor = () => {

		let newColor = getRandomColor(props.selo)
		setLocal("data", "properties", "color", newColor);

	}


	const step = (tick) => {

		if (!local.data.properties.paused) {
			rotate()
		}
	}

	const randomCostume = () => {
		const geometries = ["DodecahedronGeometry", "IcosahedronGeometry", "OctahedronGeometry", "TetrahedronGeometry", "SphereGeometry", "BoxGeometry"];

		const random = Math.floor(props.selo.random() * geometries.length);
		console.log(random, geometries[random]);
		setLocal("data", "properties", "costumeGeometry", geometries[random])// geometries[random]);

	}

	props.selo.createAction(props.nodeID, "initialize", initialize)
	props.selo.createAction(props.nodeID, "step", step)
	props.selo.createAction(props.nodeID, "setRandomColor", setRandomColor)
	props.selo.createAction(props.nodeID, "randomCostume", randomCostume)

	// props.selo.createAction(props.nodeID, "avatarEnter", avatarEnter)
	// props.selo.createAction(props.nodeID, "avatarLeave", avatarLeave)


	function handlePause(value) {
		props.selo.sendExtMsg({ msg: "setProperty", id: props.nodeID, params: ["paused", value] })
	}

	function handleClick(msg) {
		props.selo.sendExtMsg({ msg: msg[0], id: props.nodeID, params: [msg[1]] })
	}


	useThree((state) => {
		//console.log("State: ", state)

		if (state && refScene) {
			refScene.name = props.sceneName
			if (props.current) {
				props.set(refScene)
			}
		}
	})

	// Takes over the render-loop, the user has the responsibility to render
	useFrame((state) => {
		const { gl, camera, mouse } = state
		gl.clear();
		//state.gl.setClearColor("red")
	}, props.priority ? props.priority : 1)


	function AvatarCosutme(props) {
		let costume;
		const [model] = useGLTF('/lowpoly/avatar.gltf')

		useFrame((state) => {
			if (state & model) {
				console.log(model)
			}
		})

		return (
			<Show when={model()}>
				<mesh position={props.position}
					scale={[0.3, 0.3, 0.3]}
					ref={costume} castShadow
					geometry={model().nodes.Cylinder_Skin_0.geometry}
				//material={model().materials.Skin} 
				>
					<meshPhysicalMaterial color={"grey"} />
				</mesh>
			</Show>
		)

		//   <mesh position={props.position} ref={box} castShadow onClick={handleBoxClick}>
		//   <boxBufferGeometry />
		//   <meshStandardMaterial color={props.color} />
		// </mesh>
	}
	
	createEffect(()=>{
		console.log("MIR: ", props.start);
		setTimeout(()=>{
				props.selo.callAction("wa1", "setProperty", ["rotation", props.start.includes("mirror") ? [0, 0, isNaN(parseFloat(props.start.slice(6))) ? 0.2 : props.start.slice(6)] : [0, 0, 0]])
				props.selo.callAction("wa1", "setProperty", ["position", props.start.includes("mirror") ? [-2.5, 2, -1.5] : [-2.5, 2, 2.05]])
		},0)
	})

	return (
		<scene ref={refScene}>
			{/* <AvatarPointer3D 
					  selo={props.selo}
					  nodeID={"avC"}
					  portals={props.portals}
			opacity={0.9}></AvatarPointer3D> */}

			{/* <AvatarReplica 
			selo={props.selo} 
			nodeID={"avatarTest"}  
			size={0.01}
			position={[0, 1.4, 0]}
			rotation={[-Math.PI/2, 0, -Math.PI]}
			scene={props.nodeID}
			portals={props.portals}
			currentSceneOnView={props.currentSceneOnView}
			costume={AvatarCosutme}
			/> */}



			<For each={props.selo.storeNode.clients}>

				{(item) =>

					<Dynamic
						nodeID={item}
						scene={props.nodeID}
						component={AvatarPointer3D} //{components["Avatar"]}
						selo={props.selo}
						moniker_={props.selo.storeVT.moniker_}
						portals={props.portals}
						opacity={0.9}
						size={1}
						currentSceneOnView={props.currentSceneOnView}
						scale={[0.7, 0.7, 0.7]}
						// costume={Box}
						costumeGeometry={local.data.properties.costumeGeometry}
					/>

				}
			</For>

			<Window3D
						selo={props.selo}
						nodeID={"wa1"}
						portal={"p2"}
						portalScene={"DiceWorld"}
					>
			</Window3D>

			<Show when={props.currentSceneOnView().name !== local.data.nodeID}>
				<Window3D
					selo={props.selo}
					nodeID={"wa2"}
					portalWindow={"wb1"}
				>
				</Window3D>
			</Show>

			<Portal2D
				sceneName={local.data.nodeID}
				position={[0, 0, 0]}
				rotation={[0, 0, 0]}
				destinationScene={"DiceWorld"}
				currentSceneOnView={props.currentSceneOnView}
				destination={"p2"}
				selo={props.selo}
				nodeID={"p1"}
				setPortal={props.setPortal} />


			<group>
				{/* <Box {...props} color={local.data.properties.color} position={[1, 0.5, 4]} /> */}
				{/* <mesh position={[-2.5, 2, 10]} rotation={local.data.properties.angle} castShadow
					onClick={() => { handlePause(!local.data.properties.paused) }}
				>
					<boxBufferGeometry />
					<meshPhysicalMaterial color={"#78b5cf"} />
				</mesh> */}
			</group>
			<ambientLight />
			<mesh
				receiveShadow
				position={[0, 0, 0]}
				//scale={[100, 100, 1]}
				rotation={[-Math.PI / 2, 0, 0]}
			>
				<planeGeometry args={[50, 50]} />
				<meshPhysicalMaterial color={"white"} transparent={false} opacity={1} />
			</mesh>
			<spotLight castShadow position={[-5, 5, 5]} intensity={1} />
			<group position={[0, 0.01, 0]}>
				<gridHelper args={[50, 50, 50]} />
			</group>

			{/* </MyCameraReactsToStateChanges>  */}

		</scene>
	)

}

