/*
The MIT License (MIT)
Copyright (c) 2022 Nikolay Suslov and the Krestianstvo.org project contributors.
(https://github.com/NikolaySuslov/krestianstvo/blob/master/LICENSE.md)
*/

import { createSignal, onMount } from "solid-js"
import { createLocalStore, getRandomColor, createQRCode, createLinkForSelo } from 'krestianstvo'
import DefaultAvatar from "../Objects/DefaultAvatar"
import QRCode from "../Objects/QRCode"

import Index from "./Index.mdx"

export default function HomeWorld(props) {

	const [local, setLocal] = createLocalStore({
		data: {
			type: "App",
			nodeID: props.nodeID,
			properties: {
				name: props.name ? props.name : props.nodeID,
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


	const [el, setEl] = createSignal(null);
	return (
		<>

			<div class="relative p2 m2" ref={setEl} style={{
				border: "1px solid grey",

			}}>
				<Show when={!props.noAvatar}>
					<DefaultAvatar
						{...props}
						el={el}
						scale={0.7}
					/>
				</Show>

				<Show when={props.info}>
					<QRCode selo={props.selo} />
				</Show>

				<div m2 p2>
					<Index {...props}/>
				</div>
			</div>
		</>
	)
}
