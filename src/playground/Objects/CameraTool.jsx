/*
The MIT License (MIT)
Copyright (c) 2022 Nikolay Suslov and the Krestianstvo.org project contributors.
(https://github.com/NikolaySuslov/krestianstvo/blob/master/LICENSE.md)
*/

import { onMount, createSignal, createEffect } from 'solid-js';
import { createLocalStore } from 'krestianstvo'

import { createCameras } from "@solid-primitives/devices"

export default function App(props) {

	const [local, setLocal] = createLocalStore({
		data: {
			type: "Node",
			nodeID: props.nodeID,
			properties: props.properties ? props.properties : {
				name: props.name ? props.name : props.nodeID,
				ticking: false,
				initialized: false,
				dynamic: props.dynamic ? props.dynamic : false,
				width: props.width ? props.width : 320,
				height: props.height ? props.height : 180,
				parentID: props.parentID ? props.parentID : null,
				constraints: props.constraints ? props.constraints : {
					audio: false,
					video: { width: 320, height: 180 } // facingMode: 'user'
				}
			},
			dynamic: [
			]
		}
	}, props);

	const cameras = createCameras();

	const step = (tick) => { }


	const initialize = () => { }

	const doesNotUnderstand = (data) => {
		console.log("MY doesNotUnderstand action: ", data)
	}


	props.selo.createAction(props.nodeID, "doesNotUnderstand", doesNotUnderstand, true)
	props.selo.createAction(props.nodeID, "step", step)
	props.selo.createAction(props.nodeID, "initialize", initialize)


	function handleClick(msg) {
		props.selo.sendExtMsg({ msg: msg, id: props.nodeID })
	}

	let video
	const [stream, setStream] = createSignal()

	createEffect(() => {
		console.log(cameras())
		navigator.mediaDevices.getUserMedia(local.data.properties.constraints)
			.then((mediaStream) => {

				let str = props.streamSignal && props.streamSignal[0]() ? props.streamSignal[0]() : stream()

				if (str == null)
					props.streamSignal ? props.streamSignal[1](mediaStream) : setStream(mediaStream)


				video.srcObject = mediaStream;
				video.onloadedmetadata = () => {
					video.play();
				};
			})
			.catch((err) => {
				// always check for errors at the end.
				console.error(`${err.name}: ${err.message}`);
			});
	})

	return (
		<>
			<video ref={video}
				style={{ width: local.data.properties.width, height: local.data.properties.height, background: "black" }}>
			</video>
		</>
	)
}
