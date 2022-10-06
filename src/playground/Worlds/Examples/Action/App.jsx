/** @jsxImportSource solid-js */
import { createSignal } from 'solid-js';
import { createLocalStore } from 'krestianstvo'
import VButton from '../../Playground/View/VButton'
import DefaultAvatar from "../../Playground/DefaultAvatar"

export default function App(props) {

    const [local, setLocal] = createLocalStore({
        data: {
            type: "Node",
            nodeID: props.nodeID,
            name: "Counter",
            properties: {
                name: props.name ? props.name : props.nodeID,
                count: 0,
                ticking: true,
                initialized: false
            },
            dynamic: []
        }
    }, props);

    const initialize = () => {
        props.selo.future(props.nodeID, "add", 0, [])
    }

    const add = () => {
        setLocal("data", "properties", "count", (a) => a + 1)
        // recursevly increment counter after every Future 1s
        props.selo.future(props.nodeID, "add", 1, [])
    }

    const reset = () => {
        setLocal("data", "properties", "count", 0)
    }

    const step = (tick) => {
        // do steps here on eevery Reflector tick
        // props.selo.storeNode.tick
    }

    const doesNotUnderstand = () => {
        console.log("My replaced action for doesNotUnderstand message!")
    }


    props.selo.createAction(props.nodeID, "initialize", initialize)
    props.selo.createAction(props.nodeID, "add", add)
    props.selo.createAction(props.nodeID, "reset", reset)
    props.selo.createAction(props.nodeID, "step", step)
    props.selo.createAction(
        props.nodeID,
        "doesNotUnderstand",
        doesNotUnderstand,
        true
    )

    function handleClick(msg) {
        props.selo.sendExtMsg({ msg: msg, id: props.nodeID })
    }

    const [el, setEl] = createSignal(null);

    return (
        <>
            <div ref={setEl} class="bg-blend-color relative"
                style={{
                    border: "2px dotted grey",
                    width: "fit-content"
                }}>

                <Show when={!props.noAvatar}>
                    <DefaultAvatar
                        {...props}
                        el={el}
                        scale={0.4}
                    />
                </Show>

                <div text-center text-3xl fw400>{local.data.properties.count}</div>
                <VButton color="green" onClick={[handleClick, "reset"]}>Reset</VButton>

            </div>
        </>
    )
}