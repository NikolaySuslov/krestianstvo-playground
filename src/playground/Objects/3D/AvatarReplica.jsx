/*
The MIT License (MIT)
Copyright (c) 2022 Nikolay Suslov and the Krestianstvo.org project contributors.
(https://github.com/NikolaySuslov/krestianstvo/blob/master/LICENSE.md)
*/

import { createEffect, createSignal, onCleanup, batch, untrack } from 'solid-js';
import * as THREE from "three";
import { createLocalStore, getRandomColor, deleteNode } from 'krestianstvo'
import { useThree, useFrame } from "@krestianstvo/solid-three";

import {
    useKeyDownList,
    createKeyHold
} from '@solid-primitives/keyboard'
import AvatarPointer3D from './AvatarPointer3D';


export default function AvatarReplica(props) {

    const path = import.meta.url// + props.nodeID

    const [local, setLocal] = createLocalStore({
        data: {
            type: "Avatar",
            nodeID: props.nodeID,
            properties: {
                ticking: true,
                paused: false,
                initialized: false,
                color: props.color ? props.color : 'grey',
                scale: props.scale ? props.scale : [1, 1, 1],
                position: props.position ? props.position : [0, 0, 0],
                rotation: props.rotation ? props.rotation : [0, 0, 0]
            },
            dynamic: [
            ]
        }
    }, props)

    let ref


    const [pressedKeys] = useKeyDownList()


    let fwdValue = 0
    let bkdValue = 0;
    let rgtValue = 0;
    let lftValue = 0;
    let mult = 0.1

    const tempVector = new THREE.Vector3();
    const upVector = new THREE.Vector3(0, 1, 0);




    createEffect(() => {

        pressedKeys()[0] == 'W' ? handleMove({}, { vector: { y: 1 } }) : fwdValue = 0;
        pressedKeys()[0] == 'S' ? handleMove({}, { vector: { y: -1 } }) : bkdValue = 0;
        pressedKeys()[0] == 'A' ? handleMove({}, { vector: { x: -1 } }) : lftValue = 0;
        pressedKeys()[0] == 'D' ? handleMove({}, { vector: { x: 1 } }) : rgtValue = 0;

    })

    const handleMove = (evt, data) => {
        const forward = data.vector.y;
        const turn = data.vector.x;

        if (forward > 0) {
            fwdValue = Math.abs(forward);
            bkdValue = 0;
        } else if (forward < 0) {
            fwdValue = 0;
            bkdValue = Math.abs(forward);
        }

        if (turn > 0) {
            lftValue = 0;
            rgtValue = Math.abs(turn);
        } else if (turn < 0) {
            lftValue = Math.abs(turn);
            rgtValue = 0;
        }
    };

    const updatePlayer = (state) => {

        let me = ref//state.scene.getObjectByName(local.data.nodeID, true);
        let camera = state.camera
        let controls = state.controls
        if (camera && me && controls) {


            const angle = controls.getAzimuthalAngle();
            if (fwdValue > 0) {
                tempVector.set(0, 0, -fwdValue).applyAxisAngle(upVector, angle);
                me.position.addScaledVector(tempVector, mult);
            }

            if (bkdValue > 0) {
                tempVector.set(0, 0, bkdValue).applyAxisAngle(upVector, angle);
                me.position.addScaledVector(tempVector, mult);
            }

            if (lftValue > 0) {
                tempVector.set(-lftValue, 0, 0).applyAxisAngle(upVector, angle);
                me.position.addScaledVector(tempVector, mult);
            }

            if (rgtValue > 0) {
                tempVector.set(rgtValue, 0, 0).applyAxisAngle(upVector, angle);
                me.position.addScaledVector(tempVector, mult);
            }


            // me.lookAt(state.controls.target)

            me.updateMatrixWorld();


            // camera.position.sub(controls.target);
            // controls.target.copy(me.position);
            // camera.position.add(me.position);
            //console.log(angle, ' - ', fwdValue)
        }

    }

    useFrame((state) => {

        const { gl, scene, camera, mouse } = state

        if (state && ref)
            updatePlayer(state);
    })

    return (
        <group ref={ref} position={local.data.properties.position} rotation={local.data.properties.rotation}>
            <mesh scale={local.data.properties.scale}>
                <sphereGeometry args={[props.size, 16, 16]} />
                <meshPhysicalMaterial color={local.data.properties.color} transparent={true} opacity={local.data.properties.opacity} />
            </mesh>

            <Show when={props.costume}>
                <Dynamic component={props.costume} selo={props.selo} color={local.data.properties.color} />
            </Show>
        </group>
    )


}