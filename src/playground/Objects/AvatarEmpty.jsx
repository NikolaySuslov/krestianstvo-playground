/*
The MIT License (MIT)
Copyright (c) 2022 Nikolay Suslov and the Krestianstvo.org project contributors.
(https://github.com/NikolaySuslov/krestianstvo/blob/master/LICENSE.md)
*/


import { createEffect, createSignal, children, onMount, batch } from 'solid-js';
import { getRandomColor, createLocalStore, createNode, deleteNode } from 'krestianstvo'


export default function Avatar(props) {

	const path = import.meta.url// + props.nodeID

	const [local, setLocal] = createLocalStore({
		data: {
			type: "Avatar",
			nodeID: props.nodeID,
			properties: {

				ticking: true,
				initialized: false,
				paused: true,
				color: '#eee'
			},
			dynamic: []
		}
	}, props);


	const initialize = (data) => {

		//batch(() => {
			setLocal("data", "properties", "initialized", true);
			setRandomColor()
			//animate()
		//})
	}

	const step = (tick) => { }

	const setRandomColor = () => {

		let newColor = getRandomColor(props.selo)
		setLocal("data", "properties", "color", newColor);

	}


	props.selo.createAction(props.nodeID, "initialize", initialize)
	props.selo.createAction(props.nodeID, "step", step)
	props.selo.createAction(props.nodeID, "setRandomColor", setRandomColor)


	//view signal

	return (
		<></>
	)
}
