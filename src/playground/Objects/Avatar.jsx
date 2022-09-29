/*
The MIT License (MIT)
Copyright (c) 2022 Nikolay Suslov and the Krestianstvo.org project contributors.
(https://github.com/NikolaySuslov/krestianstvo/blob/master/LICENSE.md)
*/

import { createEffect, createSignal, children, onMount, batch } from 'solid-js';
import { produce } from "solid-js/store";
import { getRandomColor, createLocalStore, createNode, deleteNode } from 'krestianstvo'
import Pen from './Pen'

import styles from './Objects.module.css';
import createRAF from "@solid-primitives/raf";
import { createPerPointerListeners } from '@solid-primitives/pointer'


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
				paused: true,
				angle: 0,
				scale: 1,
				theta: 0,
				initialized: false,
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
				//passive: false,
				target: () => props.el(),
				pointerTypes: ['mouse', 'touch', 'pen'],
				onEnter(e, { onDown, onMove, onUp, onLeave }) {
					props.el().focus()
					//e.preventDefault();
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

	const animate = () => {

		if (!local.data.properties.paused) {

			setLocal(
				produce((s) => {
					s.data.properties.scale = 1 + Math.abs(Math.sin(s.data.properties.theta) * 2);
					s.data.properties.theta = s.data.properties.theta + 0.05;
				})
			)
		}

		props.selo.future(props.nodeID, "animate", 0.05)
	}

	const initialize = (data) => {
		console.log("INITIALIZE: ", local.data)

		batch(() => {
			setRandomColor()
			animate()
		})

	}

	createEffect(() => {
		let penID = 'pen_' + props.nodeID;
		if (props.selo.getNodeByID(penID)) {
			console.log("Changed pen color:", local.data.properties.color)
			props.selo.future(penID, "changeColor", 0.01, local.data.properties.color)
		}
	})

	const rotate = () => {
		setLocal("data", "properties", "angle", (a) => a + 1)
	}

	const step = (tick) => {

		if (!local.data.properties.paused) {
			rotate()
		}
	}

	const setRandomColor = () => {

		let newColor = getRandomColor(props.selo)
		setLocal("data", "properties", "color", newColor);

	}

	const handleMouseEvent = (data) => {

		if (data[0] == "mouseDown") {}

		if (data[0] == "mouseMove") {
			props.selo.future(data[1], "mouseMove", 0, { x: data[2], y: data[3] })
		}

		if (data[0] == "mouseUp") {}


	}

	function handleMouseMoveSate(event) {

		batch(() => {
			setLocal("data", "properties", "clientX", event[0].x)
			setLocal("data", "properties", "clientY", event[0].y)
		})


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


	props.selo.createAction(props.nodeID, "animate", animate)
	props.selo.createAction(props.nodeID, "initialize", initialize)
	props.selo.createAction(props.nodeID, "rotate", rotate)
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
		setPos((p) => ({
			x: lerp(p.x, local.data?.properties.clientX, 0.7),
			y: lerp(p.y, local.data?.properties.clientY, 0.7)
		})
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
					0px) rotate(${local.data.properties.angle}deg)
					scale(${local.data.properties.scale})`,
				color: `${local.data.properties.color}`,
				background: `${local.data.properties.color}`

			}}>

				<div class={styles.avatarLabel} flex>id: {props.nodeID}
					<br />x: {local.data?.properties.clientX.toPrecision(4)} y: {local.data?.properties.clientY.toPrecision(4)}
					<br />
					Angle: {local.data?.properties.angle} <br />
					Scale: {local.data?.properties.scale.toPrecision(4)} <br />
					Color: {local.data?.properties.color}
				</div>


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
			<div class="m-2 text-left op60 fw300">
				<Portal mount={props.uiEl()}>
					<Switch>
						<Match when={props.nodeID == props.moniker_}>
							<pre>My Avatar control:</pre>
							<button class="m1" onClick={handleColor}>Random color</button>
							<br />
							<Switch>
								<Match when={!local.data.properties.paused}>
									<button class="m1" onClick={[handlePause, true]}>Pause animation</button>
								</Match>
								<Match when={local.data.properties.paused}>
									<button class="m1" onClick={[handlePause, false]}>Play animation</button>
								</Match>
							</Switch>
						</Match>
					</Switch>
				</Portal>
			</div>
		</>
	)
}
