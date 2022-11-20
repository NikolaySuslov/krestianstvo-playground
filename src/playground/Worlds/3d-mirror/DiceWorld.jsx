/*
The MIT License (MIT)
Copyright (c) 2022 Nikolay Suslov and the Krestianstvo.org project contributors.
(https://github.com/NikolaySuslov/krestianstvo/blob/master/LICENSE.md)
*/

import { createSignal, onMount, onCleanup, Show, lazy, Suspense, batch, createEffect, untrack } from 'solid-js';
import { createStore, produce, unwrap, reconcile } from "solid-js/store";
import { createLocalStore, Selo, createQRCode, getRandomColor } from 'krestianstvo'
import { v4 as uuidv4 } from 'uuid';

import { Canvas, useThree, useFrame } from "@krestianstvo/solid-three";
import { OrbitControls } from "../../Objects/Fiber/OrbitControls"
import { useGLTF } from "solid-drei";
//import { WebGLRenderer } from "three/src/renderers/WebGLRenderer";

import { CoefficientCombineRule, ColliderDesc, RigidBody, RigidBodyDesc, World, Vector3, Quaternion } from '@dimforge/rapier3d-compat';

import AvatarPointer3D from '../../Objects/3D/AvatarPointer3D';
import Window3D from "../../Objects/3D/Window3D"
import Portal2D from "../../Objects/3D/Portal2D"

//const cube = useGLTF('/dice.glb')

export default function Scene(props) {

  // const cube = props.selo.resources

  const path = import.meta.url// + props.nodeID;

  let boxPositionProto = [-2, 5, 0]
  let boxRotationProto = [0.5, 0, 0, 1]

  const initPhysics = () => {
    // Create a dynamic rigid-body.

    let boxPosition = boxPositionProto

    let boxRotation = boxRotationProto

    let rigidBodyDesc = RigidBodyDesc.dynamic() //.kinematicPositionBased()
      .setTranslation(boxPosition[0], boxPosition[1], boxPosition[2])//(0.0, 1.0, 0.0);
      .setRotation(boxRotation[0], boxRotation[1], boxRotation[2], boxRotation[3])


    let rigidBody = props.rapier.world.createRigidBody(rigidBodyDesc);
    rigidBody.setTranslation({ x: boxPosition[0], y: boxPosition[1], z: boxPosition[2] }, true)
    rigidBody.setRotation({ x: boxRotation[0], y: boxRotation[1], z: boxRotation[2], w: boxRotation[3] }, true)

    // Create a cuboid collider attached to the dynamic rigidBody.
    let colliderDesc = ColliderDesc.cuboid(0.5, 0.5, 0.5);
    // colliderDesc.setRestitution(0.5);
    //colliderDesc.setFriction(2);
    let collider = props.rapier.world.createCollider(colliderDesc, rigidBody);
    console.log("Collider: ", collider)

    let groundColliderDesc = ColliderDesc.cuboid(10.0, 0.1, 10.0);
    props.rapier.world.createCollider(groundColliderDesc);

    console.log("ground: ", groundColliderDesc)

  }

  const [local, setLocal] = createLocalStore({
    data: {
      type: "App",
      nodeID: props.nodeID,
      properties: {
        initialized: false,
        color: 'green',
        ticking: true,
        paused: false,
        angle: [0, 0, 0],
        boxPosition: boxPositionProto,
        boxRotation: boxRotationProto,
        costumeGeometry: props.costumeGeometry ? props.costumeGeometry : "SphereGeometry",
        test: 0
      },
      dynamic: [
      ],
      dynamicSelo: [
      ]
    }
  }, props)


  onCleanup(() => {
  });

  let refScene;

  const [ph, setPh] = createStore({})

  const postInitialize = () => {

    if (!props.rapier.restored) {
      initPhysics()

    }

    let myRigitBody = props.rapier.world.getRigidBody(0)
    let position = myRigitBody.translation()
    let rotation = myRigitBody.rotation()
    setLocal("data", "properties", "boxPosition", [position.x, position.y, position.z])
    setLocal("data", "properties", "boxRotation", [rotation.x, rotation.y, rotation.z, rotation.w])

    if (props.rapier.restored) {
      doRapierWorldStep()

    }

  }


  const initialize = () => {

    animate()
    randomCostume()

  }

  const move = () => {
    // let a = local.data.properties.boxPosition
    // setKinematicTranslation(newPos)
    // 
  }

  const step = (tick) => {

    if (!local.data.properties.paused) {
      //rotate()
    }
  }

  const [m, sm] = createSignal(0)

  const animate = () => {

    // setLocal("data", "properties", "test", c => c + 1)

    if (!props.rapier.world) {
      console.log("NO WORLD!!")
      sm((c) => c + 1)
    }

    if (!local.data.properties.paused && props.rapier.world) {
      //move()
      if (m() > 0) {
        console.log("Missed steps: ", m())
        for (let i = 0; i < m(); i++) {
          doRapierWorldStep()
        }
        sm(0)

      }
      doRapierWorldStep()
    }

    props.selo.future(props.nodeID, "animate", 0.05)
  }

  const moveCube = () => {

    if (!local.data.properties.paused) {
      //move()
    }
    //props.selo.future(props.nodeID, "moveCube", 0.5)
  }




  const setKinematicTranslation = (data) => {

    // let newPos = new Vector3(data[0], data[1], data[2])
    // ph.space.rigidBody.setNextKinematicTranslation(newPos)

  }

  const doRapierWorldStep = () => {
    //  console.log("Time: ", props.selo.storeNode.tick)

    props.rapier.world.step(props.rapier.events)

    props.rapier.world.forEachActiveRigidBody(b => {
      // console.log(b)

      let position = b.translation();
      let rotation = b.rotation();

      // console.log("Pos: ", position)
      // console.log("Rot: ", rotation)

      props.selo.future(props.nodeID, "changeBoxPosition", 0, [position.x, position.y, position.z])
      props.selo.future(props.nodeID, "changeBoxRotation", 0, [rotation.x, rotation.y, rotation.z, rotation.w])

    })

  }

  const applyImpulse = () => {
    let myRigitBody = props.rapier.world.getRigidBody(0)
    myRigitBody.applyImpulse({ x: 0.0, y: 5.0, z: 0.0 }, true);
    myRigitBody.applyTorqueImpulse({ x: 0.0, y: 0.0, z: -1.0 }, true);
  }

  const changeBoxPosition = (data) => {
    setLocal("data", "properties", "boxPosition", data[0])

  }

  const changeBoxRotation = (data) => {
    setLocal("data", "properties", "boxRotation", data[0])

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

  props.selo.createAction(props.nodeID, "postInitialize", postInitialize)
  props.selo.createAction(props.nodeID, "initialize", initialize)
  props.selo.createAction(props.nodeID, "step", step)
  props.selo.createAction(props.nodeID, "setRandomColor", setRandomColor)
  props.selo.createAction(props.nodeID, "doRapierWorldStep", doRapierWorldStep)
  props.selo.createAction(props.nodeID, "animate", animate)
  props.selo.createAction(props.nodeID, "changeBoxPosition", changeBoxPosition)
  props.selo.createAction(props.nodeID, "changeBoxRotation", changeBoxRotation)
  props.selo.createAction(props.nodeID, "moveCube", moveCube)
  props.selo.createAction(props.nodeID, "applyImpulse", applyImpulse)
  props.selo.createAction(props.nodeID, "randomCostume", randomCostume)


  createEffect(() => {

    if (local.data.properties.paused) {
      //console.log(local.data.properties.paused)
      setLocal("data", "properties", "color", "green")
    } else {
      setLocal("data", "properties", "color", "red")
    }

  })

  onMount(() => {
    // createPhysics()

  })

  function Ground(props) {

    return (
      <mesh receiveShadow>
        <planeGeometry />
        <meshStandardMaterial color={"white"} /> //"#c9c9c9"
      </mesh>
    )
  }
  function Box(props) {
    let box;
    const [model] = useGLTF('/dice.glb')
    // let model = props.model //cube[0]()
    // console.log("GLTF: ", model)

    // useThree((state)=>{
    //   console.log("State: ",box)
    //  })
    useFrame(() => {
      if (props.rapier?.world) {
        let rot = new Quaternion(...props.qRotation)
        if (box)
          box.setRotationFromQuaternion(rot)
      }
    })

    const handleBoxClick = () => {
      //props.selo.sendExtMsg({ msg: "setRandomColor", id: props.nodeID, params: [] })
      if (!local.data.properties.paused)
        props.selo.sendExtMsg({ msg: "applyImpulse", id: props.nodeID, params: [] })

    }

    return (
      <Show when={model()}>
        <mesh position={props.position}
          scale={[0.5, 0.5, 0.5]}
          ref={box} castShadow onClick={handleBoxClick}
          geometry={model().nodes.Cube.geometry}
          material={model().materials.Material} >
        </mesh>
      </Show>
    )

    //   <mesh position={props.position} ref={box} castShadow onClick={handleBoxClick}>
    //   <boxBufferGeometry />
    //   <meshStandardMaterial color={props.color} />
    // </mesh>
  }

  const RapierWorld = (props) => {

    useFrame(state => {
      //props.world?.step()
    })

  }

  function MyCameraReactsToStateChanges(props) {
    let pos = props.pos
    useFrame(state => {
      //console.log("State: ", state, 'pos: ', pos)
      // state.camera.lerp({ x, y, z }, 0.1)
      // state.camera.lookAt(0, 0, 0)
    })
  }


  function handlePause(value) {
    props.selo.sendExtMsg({ msg: "setProperty", id: props.nodeID, params: ["paused", value] })
  }

  function handleClick(msg) {
    props.selo.sendExtMsg({ msg: msg, id: props.nodeID })
  }

  const [el, setEl] = createSignal(null);
  const [uiEl, setUiEl] = createSignal(null);


  useThree((state) => {
    //console.log("State: ", state)

    if (state && refScene) {
      //state.gl.setClearColor("black");
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


  createEffect(()=>{
		console.log("MIR: ", props.start);
		setTimeout(()=>{
				props.selo.callAction("wa7", "setProperty", ["rotation", props.start.includes("mirror") ? [0, -Math.PI/2, isNaN(parseFloat(props.start.slice(6))) ? 0.2 : props.start.slice(6)] : [0, -Math.PI/2, 0]])
		},0)
	})


  return (

    <scene ref={refScene}>
      {/* <color attach="backgroundColor" r={1} g={1} b={0} /> */}

      <For each={props.selo.storeNode.clients}>

        {(item) =>

          <Dynamic
            nodeID={item}
            scene={props.nodeID}
            component={AvatarPointer3D} //{components["Avatar"]}
            selo={props.selo}
            moniker_={props.selo.storeVT.moniker_}
            portals={props.portals}
            currentSceneOnView={props.currentSceneOnView}
            opacity={0.9}
            size={1}
            scale={[0.5, 0.5, 0.5]}
            dynamicCostume={local.data.properties.costumeGeometry}
          // costume={Box}
          //costumeGeometry={local.data.properties.costumeGeometry}
          />

        }
      </For>

      <RapierWorld world={props.rapier.world} />
      <MyCameraReactsToStateChanges pos={[0, 0, 0]} />
      <group>
        <Box {...props} position={local.data.properties.boxPosition} world={props.rapier.world} qRotation={local.data.properties.boxRotation} model={props.selo.resources} />

        <mesh position={[0.5, 0.5, 0]} rotation={local.data.properties.angle} castShadow
          onClick={() => { handlePause(!local.data.properties.paused) }}>
          <boxBufferGeometry />
          <meshStandardMaterial color={local.data.properties.color} />
        </mesh>
      </group>
      <ambientLight intensity={0.1} />
      <mesh
        position={[0, 0, 0]}
        scale={[100, 100, 1]}
        rotation={[-Math.PI / 2, 0, 0]}
      >

        <Ground rapier={props.rapier} />
      </mesh>
      <spotLight castShadow position={[-3, 5, 3]} intensity={2} color={"red"} penumbra={1} />
      <spotLight castShadow position={[0, 5, 3]} intensity={2} color={"green"} penumbra={1} />
      <spotLight castShadow position={[3, 5, 3]} intensity={2} color={"blue"} penumbra={1} />

      <Window3D
				selo={props.selo}
				nodeID={"wa7"}
				position={[4, 2, 0]}
				//rotation={[0, -Math.PI/2, 0]}
				portal={"pa7"}
				portalScene={local.data.nodeID}
			/>


			<Portal2D
				sceneName={local.data.nodeID}
				destinationScene={local.data.nodeID}
				destination={"pa6"}
				selo={props.selo}
				nodeID={"pa7"}
				setPortal={props.setPortal}
				currentSceneOnView={props.currentSceneOnView}
			/>



			<Window3D
				selo={props.selo}
				nodeID={"wa6"}
				position={[-4, 2, 0]}
				rotation={[0, Math.PI/2, 0]}
				portal={"pa6"}
				portalScene={local.data.nodeID}
			/>


			<Portal2D
				sceneName={local.data.nodeID}
				destinationScene={local.data.nodeID}
				destination={"pa7"}
				selo={props.selo}
				nodeID={"pa6"}
				setPortal={props.setPortal}
				currentSceneOnView={props.currentSceneOnView}
			/> 

    </scene>
  )
}

