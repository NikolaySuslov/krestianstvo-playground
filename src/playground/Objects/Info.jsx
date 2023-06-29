/*
The MIT License (MIT)
Copyright (c) 2022 Nikolay Suslov and the Krestianstvo.org project contributors.
(https://github.com/NikolaySuslov/krestianstvo/blob/master/LICENSE.md)
*/

import { onMount } from 'solid-js';
import { showState, createQRCode, createLinkForSelo } from 'krestianstvo'

export default function SeloInfo(props) {

    let thisDiv;

    let link = createLinkForSelo(props.selo, {p: props.parameters, d: props.deepCount})

    onMount(() => {
        createQRCode(thisDiv, link)
    })
    
    return (
        <>
            <div class="p2 truncate">
                <pre>
                    <strong>Selo</strong>
                    <br />World: {props.selo.app}
                    <br />ID: {props.selo.id}
                    <br />Reflector: {props.selo.reflectorHost}
                </pre>
                <pre>Virtual Time: <strong>{props.selo.storeNode.tick?.toPrecision(4)} </strong></pre>
                <pre>Clients: </pre>
                <For each={props.selo.storeNode.clients} fallback={<div>Loading...</div>}>
                    {(item) =>
                        <Switch>
                            <Match when={item === props.selo.storeVT.moniker_}>
                                <strong><div>{item} </div></strong>
                            </Match>
                            <Match when={item !== props.selo.storeVT.moniker_}>
                                <div>{item}</div>
                            </Match>
                        </Switch>
                    }
                </For>

                <div>
                    <pre>
                        <strong>Debug</strong>
                        <br />
                        Deep: {props.deep} </pre>
                    <button onClick={[showState, props.selo.owner]}>Show state</button>
                </div>
            </div>

            <div p-1>
                <div text-center ref={thisDiv} />
                <a href={link} text-center fw300 target="_blank">Link</a>
            </div>
        </>
    )

}
