import { genID, createLocalStore } from "krestianstvo";
import Counter from './Objects/Counter.jsx'

export default function App(props) {

    const path = import.meta.url

    const [local, setLocal] = createLocalStore({
        data: {
            type: "App",
            nodeID: props.nodeID,
            properties: {},
            dynamic: [],
            dynamicSelo: [],
        }
    }, props)

    return (
        <>
            <div>App ID: {local.data.nodeID}</div>
            <Counter name="Counter"
                nodeID={genID("Counter" + local.data.nodeID, path)}
                selo={props.selo}
                parentID={props.nodeID}
            />
        </>
    )
}