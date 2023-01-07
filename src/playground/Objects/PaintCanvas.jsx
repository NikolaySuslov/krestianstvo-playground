/*
The MIT License (MIT)
Copyright (c) 2022 Nikolay Suslov and the Krestianstvo.org project contributors.
(https://github.com/NikolaySuslov/krestianstvo/blob/master/LICENSE.md)
*/

import { onMount, onCleanup, createSignal, createEffect } from 'solid-js';
import { produce } from "solid-js/store";
import { createLocalStore } from 'krestianstvo'

import { createPerPointerListeners } from '@solid-primitives/pointer'

const PaintCanvas = (props) => {

	const [local, setLocal] = createLocalStore({
		data: {
			type: "Node",
			nodeID: props.nodeID,
			properties: props.properties ? props.properties :{
				name: props.name ? props.name : props.nodeID,
				ticking: false,
				initialized: false,
				color: props.color ? props.color : "white",
				size: props.size ? props.size : 2,
				width: props.width ? props.width : 256,
				height: props.height ? props.height : 256,
				parentID: props.parentID ? props.parentID : null,
				penArray: []
			},
			dynamic: [
			]
		}
	}, props);

	const step = (tick) => { }

	const initialize = () => { }

	let [syncLines, setSyncLines] = createSignal(false)

	const drawLineOnCanvas = (ctx, line, from, to) => {
		ctx.beginPath();
		ctx.moveTo(from.x, from.y);
		ctx.lineWidth = line.size;
		ctx.lineCap = "round";
		ctx.strokeStyle = line.color;
		ctx.lineTo(to.x, to.y);
		ctx.stroke();
	}

	createEffect(() => {

		let ctx = context()

		local.data.properties.penArray.forEach(el => {
			createEffect(() => {
				drawLine(el.lines)
			})
		})

		if (ctx) {

			if (local.data.properties.penArray.length > 0) {
				if (!syncLines()) {
					local.data.properties.penArray.forEach(key => {
						let linesArray = key.lines 
						linesArray.forEach((line, index) => {
							if (index !== 0) {
								drawLineOnCanvas(ctx, line,
									{ x: linesArray[index - 1].x, y: linesArray[index - 1].y },
									{ x: linesArray[index].x, y: linesArray[index].y }
								)
							}
						})
					})
					setSyncLines(true)
				}
			}
		}
	})


	const drawLine = (linesArray) => {
		let ctx = context()

		if (ctx) {
			if (linesArray.length > 1) {
				let line = linesArray.at(0);
				//console.log("Pen: ", line.pen, " LINE: ", line)
				drawLineOnCanvas(ctx, line,
					{ x: linesArray.at(1).x, y: linesArray.at(1).y },
					{ x: linesArray.at(0).x, y: linesArray.at(0).y }
				)
			}
		}
	}

	const store = (penID, x, y, s, c) => {

		let line = {
			//"pen": penID,
			"x": x,
			"y": y,
			"size": s,
			"color": c
		}

		setLocal("data", "properties", "penArray", el => el.pen == penID, 'lines', l => [line, ...l])

	}

	const startDraw = (data) => {

		//console.log("Start draw: ", data)

		let pen = data[0].pen

		setLocal(produce((s) => {
			let p = s.data.properties.penArray.filter(el => el.pen == pen)
			if (p.length == 0) {
				s.data.properties.penArray.unshift({ pen: pen, lines: [] })
			}
		}))


	}

	const stopDraw = (data) => {

		let pen = data[0].pen
		store(pen);
	}

	const draw = (data) => {

		let x = data[0].x
		let y = data[0].y
		let color = data[0].color
		let pen = data[0].pen

		store(pen, x, y, local.data.properties.size, color);

	}

	const storePixels = (data) => {
		console.log("Store pixels: ", data)
		store(...data);
	}

	props.selo.createAction(props.nodeID, "initialize", initialize)
	props.selo.createAction(props.nodeID, "startDraw", startDraw)
	props.selo.createAction(props.nodeID, "draw", draw)
	props.selo.createAction(props.nodeID, "stopDraw", stopDraw)
	props.selo.createAction(props.nodeID, "storePixels", storePixels)
	props.selo.createAction(props.nodeID, "step", step)


	const getMousePos = (canvas, x, y) => {
		var rect = canvas.getBoundingClientRect(),
			scaleX = canvas.width / rect.width,
			scaleY = canvas.height / rect.height;

		return {
			x: (x - rect.left) * scaleX,
			y: (y - rect.top + canvas.scrollTop) * scaleY
		}
	}

	const [context, setContext] = createSignal(null)

	let canvas;
	onMount(() => {

		const ctx = canvas.getContext("2d");

		canvas.style.border = "1px solid";
		canvas.style.zIndex = 8;

		ctx.globalAlpha = 0.5;
		ctx.fillStyle = local.data.properties.color;
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		setContext(ctx)

		let frame = requestAnimationFrame(loop);

		function loop(t) {
			frame = requestAnimationFrame(loop);
		}

		onCleanup(() => cancelAnimationFrame(frame));

		const [d, sD] = createSignal(false)

		createPerPointerListeners({
			target: () => canvas,
			pointerTypes: ['mouse', 'touch', 'pen'],
			onEnter(e, { onDown, onMove, onUp, onLeave }) {
				let last;
				props.selo.sendExtMsg({ msg: "createPen", id: props.selo.storeVT.moniker_, params: [] })

				onDown(({ x, y }) => {
					last = { x, y }
					let cp = getMousePos(canvas, x, y)
					props.selo.sendExtMsg({ msg: "mouseEvent", id: 'pen_' + props.selo.storeVT.moniker_, params: ["mouseDown", props.nodeID, cp.x, cp.y] })
				})

				onUp(({ x, y }) => {
					//console.log('UP X: ', x, 'Y: ', y)
					last = undefined
					let cp = getMousePos(canvas, x, y)
					props.selo.sendExtMsg({ msg: "mouseEvent", id: 'pen_' + props.selo.storeVT.moniker_, params: ["mouseUp", props.nodeID, cp.x, cp.y] })
				})
				onLeave(() => {
					//console.log('LEAVE!')
					last = undefined
					props.selo.sendExtMsg({ msg: "mouseEvent", id: 'pen_' + props.selo.storeVT.moniker_, params: ["mouseLeave", props.nodeID] })
					if(e.pointerType !== "touch"){
						props.selo.sendExtMsg({ msg: "deletePen", id: props.selo.storeVT.moniker_, params: [] })
					}
					
				})
				onMove(({ x, y }) => {
					if (!last) return
					//console.log('MOVE X: ', x, 'Y: ', y)

					let cp = getMousePos(canvas, x, y)

					props.selo.sendExtMsg({ msg: "mouseEvent", id: 'pen_' + props.selo.storeVT.moniker_, params: ["mouseMove", props.nodeID, cp.x, cp.y] })

				})
			},
		})
	})

	return (
		<>
			<div class="relative" style={{
				userSelect: 'none',
				'touch-action': 'none' 
			}}>
				<canvas ref={canvas} width={local.data.properties.width} height={local.data.properties.height} />
			</div>
		</>

	)
}

export default PaintCanvas
