/*
The MIT License (MIT)
Copyright (c) 2022 Nikolay Suslov and the Krestianstvo.org project contributors.
(https://github.com/NikolaySuslov/krestianstvo/blob/master/LICENSE.md)
*/


import { onMount } from 'solid-js';
import { createLocalStore }from 'krestianstvo'

const Pen = (props) => {

	const [local, setLocal] = createLocalStore({
		data: {
			type: "Node",
			nodeID: props.nodeID,
			properties: {
				name: props.name ? props.name : props.nodeID,
				ticking: false,
				initialized: false,
				x: 0,
				y: 0,
				color: props.color,
				width: props.width,
				parentID: props.parentID ? props.parentID : null
			},
			dynamic: [
			]
		}
	}, props);

	const step = (tick) => {
		// step on tick
	}

	const changeColor = (color) => {
		setLocal("data", "properties", "color", color[0])
	}

	const initialize = () => {
	}

	const handleMouseEvent = (data) => {

		if (data[0] == "mouseDown")
			props.selo.callAction(data[1], "startDraw", [
				{ x: data[2], y: data[3], color: local.data.properties.color, pen: props.nodeID }
			])

		if (data[0] == "mouseMove")
			props.selo.callAction(data[1], "draw", [
				{ x: data[2], y: data[3], color: local.data.properties.color, pen: props.nodeID }
			])

		if (data[0] == "mouseUp")
			props.selo.callAction(data[1], "stopDraw", [
				{ x: data[2], y: data[3], color: local.data.properties.color, pen: props.nodeID }
			])
	}

	props.selo.createAction(props.nodeID, "initialize", initialize)
	props.selo.createAction(props.nodeID, "mouseEvent", handleMouseEvent)
	props.selo.createAction(props.nodeID, "changeColor", changeColor)
	props.selo.createAction(props.nodeID, "step", step)

	onMount(() => {
		console.log("Mount ", props.nodeID)
	})

	return (
		<>
			<div class="box-border text-lg rounded b-1 text-center"> pen</div>
		</>
	)
}

export default Pen

