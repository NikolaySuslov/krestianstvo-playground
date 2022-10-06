/** @jsxImportSource solid-js */
import { createLocalStore } from "krestianstvo";

export default function Simple(props) {

    const [local, setLocal] = createLocalStore({
        data: {
            type: "App",
            nodeID: props.nodeID,
            properties: {
                name: props.name ? props.name : props.nodeID
            },
            dynamic: []
        }
    }, props);

    return (
        <div>Welcome to {local.data.properties.name} !
            <br />
            Initialised in Selo: {props.selo.id}
        </div>
    )

}