/*
The MIT License (MIT)
Copyright (c) 2022 Nikolay Suslov and the Krestianstvo.org project contributors.
(https://github.com/NikolaySuslov/krestianstvo/blob/master/LICENSE.md)
*/


import { createEffect, createSignal, children, onMount, batch } from 'solid-js';
import { getRandomColor, createLocalStore, createNode, deleteNode } from 'krestianstvo'
import styles from './Objects.module.css';

import { createPerPointerListeners } from '@solid-primitives/pointer'
import createRAF from "@solid-primitives/raf";
import Pen from './Pen';

export default function Avatar(props) {

	const components = {
		Avatar: Avatar,
		Pen: Pen
	}

	const path = import.meta.url// + props.nodeID

	const [local, setLocal] = createLocalStore({
		data: {
			type: "Avatar",
			nodeID: props.nodeID,
			properties: {
				clientX: 0,
				clientY: 0,
				ticking: true,
				angle: 0,
				scale: props.scale ? props.scale : 1,
				theta: 0,
				initialized: false,
				paused: true,
				color: '#eee'
			},
			dynamic: [
				// {
				// 	component: "Pen",
				// 	nodeID: "pen_" + props.nodeID,
				// 	color: "black"
				// }
			]
		}
	}, props);


	const getMousePos = (canvas, x, y) => {
		var rect = canvas.getBoundingClientRect(),
			scaleX = canvas.offsetWidth / rect.width,
			scaleY = canvas.offsetHeight / rect.height;

		return {
			x: (x - rect.left) * scaleX,
			y: (y - rect.top + canvas.scrollTop) * scaleY
		}

	}
	const initializeAvatarMouse = (props) => {

		if (props.nodeID == props.moniker_) {
			createPerPointerListeners({
				target: () => props.el(),
				onEnter(e, { onDown, onMove, onUp, onLeave }) {
					onDown(({ x, y }) => {
						let cp = getMousePos(props.el(), x, y)
						props.selo.sendExtMsg({ msg: "mouseEvent", id: props.nodeID, params: ["mouseDown", props.nodeID, cp.x, cp.y] })
					})
					onUp(({ x, y }) => {
						let cp = getMousePos(props.el(), x, y)
						props.selo.sendExtMsg({ msg: "mouseEvent", id: props.nodeID, params: ["mouseUp", props.nodeID, cp.x, cp.y] })
					})
					onLeave(() => {
						props.selo.sendExtMsg({ msg: "mouseEvent", id: props.nodeID, params: ["mouseLeave", props.nodeID] })
					})
					onMove(({ x, y }) => {
						let cp = getMousePos(props.el(), x, y)
						props.selo.sendExtMsg({ msg: "mouseEvent", id: props.nodeID, params: ["mouseMove", props.nodeID, cp.x, cp.y] })
					})
				}
			})
		}
		// TODO: supprot for throttled mouse events
		//  createThrottledMemo(() => {
		//     console.log(mouse)
		//     handleMouseMove({clientX: mouse.x, clientY: mouse.y})
		//   }, 0);

	}

	const initialize = (data) => {

		batch(() => {
			setLocal("data", "properties", "initialized", true);
			setRandomColor()
			//animate()
		})
	}

	const step = (tick) => { }

	const setRandomColor = () => {

		let newColor = getRandomColor(props.selo)
		setLocal("data", "properties", "color", newColor);

	}

	const handleMouseEvent = (data) => {

		if (data[0] == "mouseDown") {
		}

		if (data[0] == "mouseMove") {
			props.selo.future(data[1], "mouseMove", 0, { x: data[2], y: data[3] })
		}

		if (data[0] == "mouseUp") {
		}


	}

	function handleMouseMoveSate(event) {

		setLocal("data", "properties", "clientX", event[0].x)
		setLocal("data", "properties", "clientY", event[0].y)

	}

	const createPen = () => {
		let penID = "pen_" + props.nodeID
		let pen = props.selo.getNodeByID(penID)
		if (!pen) {
			createNode(props.selo, setLocal, "first", {
				component: "Pen",
				id: penID
			})
		}

	}

	const deletePen = () => {
		let penID = "pen_" + props.nodeID;
		let pen = props.selo.getNodeByID("pen_" + props.nodeID)
		if (pen)
			deleteNode([penID], setLocal, props.selo)
	}

	createEffect(() => {
		let penID = 'pen_' + props.nodeID;
		if (props.selo.getNodeByID(penID)) {
			console.log("Changed pen color:", local.data.properties.color)
			props.selo.future(penID, "changeColor", 0.01, local.data.properties.color)
		}
	})

	props.selo.createAction(props.nodeID, "initialize", initialize)

	props.selo.createAction(props.nodeID, "step", step)
	props.selo.createAction(props.nodeID, "mouseMove", handleMouseMoveSate)
	props.selo.createAction(props.nodeID, "mouseEvent", handleMouseEvent)
	props.selo.createAction(props.nodeID, "setRandomColor", setRandomColor)
	props.selo.createAction(props.nodeID, "createPen", createPen)
	props.selo.createAction(props.nodeID, "deletePen", deletePen)


	function handlePause(value) {
		props.selo.sendExtMsg({ msg: "setProperty", id: props.nodeID, params: ["paused", value] })
	}

	function handleColor() {
		props.selo.sendExtMsg({ msg: "setRandomColor", id: props.nodeID })
	}

	const lerp = (current, goal, p) => {
		return (1 - p) * current + p * goal
	}

	//view signal
	const [pos, setPos] = createSignal({ x: 0, y: 0 });
	const [, start] = createRAF(() => {

		queueMicrotask(() =>
			setPos((p) => ({
				x: lerp(p.x, local.data?.properties.clientX, 0.7),
				y: lerp(p.y, local.data?.properties.clientY, 0.7)
			}))
		)
	});

	onMount(() => {
		initializeAvatarMouse(props)
		start();
	})


	return (
		<>
			<div class={styles.avatarCircle} style={{
				transform: `translate3d(
					${pos().x - 25}px,
					${pos().y - 25}px, 
					0px) scale(${local.data.properties.scale})`,
				color: `${local.data.properties.color}`,
				background: `${local.data.properties.color}`

			}}>

				<div class={styles.avatarBody}>

					<For each={local.data.dynamic}>
						{(item) =>
							<Dynamic component={components[item.component]}
								nodeID={item.nodeID}
								name={item.name}
								dynamic={true}
								parentID={props.nodeID}
								selo={props.selo}
								color={item.color}
							/>
						}
					</For>
				</div>
			</div>
		</>
	)
}
