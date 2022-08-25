/*
The MIT License (MIT)
Copyright (c) 2022 Nikolay Suslov and the Krestianstvo.org project contributors.
(https://github.com/NikolaySuslov/krestianstvo/blob/master/LICENSE.md)
*/

import { onMount } from 'solid-js';

export default function Button(props) {

    let thisDiv;

    onMount(() => { 

    })

    return (
        <Switch>
            <Match when={props.color == "green" && props.size == "large"}>
                <button class="m1 bg-green-200 hover:bg-green-300 text-sm text-black font-mono font-light py-2 px-4 rounded border-2 border-green-200" onClick={props.onClick}>{props.children}</button>
            </Match>
            <Match when={props.color == "green" && props.size == "small"}>
                <button class="m1 bg-green-200 hover:bg-green-300 text-sm text-black font-mono font-light py-1 px-2 rounded border-2 border-green-200" onClick={props.onClick}>{props.children}</button>
            </Match>
            <Match when={props.color == "red" && props.size == "large"}>
                <button class="m1 bg-red-200 hover:bg-red-300 text-sm text-black font-mono font-light py-2 px-4 rounded border-2 border-red-200" onClick={props.onClick}>{props.children}</button>
            </Match>
            <Match when={props.color == "red" && props.size == "small"}>
                <button class="m1 bg-red-200 hover:bg-red-300 text-sm text-black font-mono font-light py-1 px-2 rounded border-2 border-red-200" onClick={props.onClick}>{props.children}</button>
            </Match>
        </Switch>

    )

}
