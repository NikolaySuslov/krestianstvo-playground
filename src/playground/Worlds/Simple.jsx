import { createLocalStore, getRandomColor } from 'krestianstvo'

export default function Simple(props) {

	const [local, setLocal] = createLocalStore({
		data: {
			type: "Node",
			nodeID: props.nodeID,
			properties: {
				name: props.name ? props.name : props.nodeID,
				count: 0,
				tick: 0,
				color: "#fff",
				ticking: false,
				initialized: false,
				dynamic: props.dynamic ? props.dynamic : false,
				parentID: props.parentID ? props.parentID : null
			},
			dynamic: [
			]
		}
	}, props);

	const step = (tick) => {
		// step on tick
	}

	const inc = () => {
		setLocal("data", "properties", "tick", props.selo.storeNode.tick)
		setLocal("data", "properties", "count", (c) => c + 1)
		setLocal("data", "properties", "color", getRandomColor(props.selo))

		props.selo.future(props.nodeID, "inc", 1)
	}

	const initialize = () => {
		// if (!local.data.properties.initialized) {
		// 	//do initialization
		// 	setLocal("data", "properties", "initialized", true);
			inc()
		// }
	}

	props.selo.createAction(props.nodeID, "inc", inc)
	props.selo.createAction(props.nodeID, "initialize", initialize)

	return (
		<>
			<div flex-col text-7 m2 p4 style={{
					opacity: 0.8,
					background: local.data.properties.color,
					width: "fit-content"
				}}>
			<div p1 style={{background: "rgba(255,255,255, 0.4)"}}>
				<pre>Tick: {local.data.properties.tick?.toPrecision(4)}</pre>	
				<pre>Count: {local.data.properties.count}</pre>
				<pre>Color: {local.data.properties.color}</pre>	
				</div>	
			</div>
		</>
	)
}
