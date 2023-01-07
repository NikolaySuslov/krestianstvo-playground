/*
The MIT License (MIT)
Copyright (c) 2022 Nikolay Suslov and the Krestianstvo.org project contributors.
(https://github.com/NikolaySuslov/krestianstvo/blob/master/LICENSE.md)
*/

import { onMount, createSignal, createResource } from 'solid-js';
import { createLocalStore, createLinkForSelo, createQRCode } from 'krestianstvo'

import CodeMirror from './CodeMirror'
import MarkDown from './Markdown'

export default function App(props) {

	const markdown1 =
		`# Title

- here's
- a
- list

<div>

Some *emphasis* HTML <strong>strong</strong>!

</div>`

	const [local, setLocal] = createLocalStore({
		data: {
			type: "Node",
			nodeID: props.nodeID,
			properties: props.properties ? props.properties : {
				name: props.name ? props.name : props.nodeID,
				text: props.text ? props.text : "",
				ticking: false,
				initialized: false,
				dynamic: props.dynamic ? props.dynamic : false,
				parentID: props.parentID ? props.parentID : null,

			},
			dynamic: [
			]
		}
	}, props);



	const step = (tick) => { }

	const postInitialize = () => { }

	const initialize = () => { }

	const doesNotUnderstand = (data) => {
		console.log("MY doesNotUnderstand action: ", data)
	}

	props.selo.createAction(props.nodeID, "doesNotUnderstand", doesNotUnderstand, true)
	props.selo.createAction(props.nodeID, "step", step)
	props.selo.createAction(props.nodeID, "initialize", initialize)
	props.selo.createAction(props.nodeID, "postInitialize", postInitialize)

	onMount(() => { })

	let thisDiv;

	let link = createLinkForSelo(props.selo, { p: props.parameters, d: props.deepCount })

	onMount(() => {
		createQRCode(thisDiv, link)
	})


	return (
		<>

			<div p2>
				<div pb1 ref={thisDiv} />
				<a href={link} text-center fw300 target="_blank">Link</a>
			</div>

			<div class="grid grid-rows-1 grid-cols-2" style={{
				"grid-template-columns": "50% 50%",
				"grid-template-rows": "0.1fr",
				"gap": "0px 6px",
				"grid-template-areas":
					". ."
			}}>
				<div p4 class="col-span-1 box">
					<MarkDown nodeID={props.nodeID + '_markdown_'} selo={props.selo} />
				</div>
				<div p4 class="col-span-1 box">
					<CodeMirror nodeID={props.nodeID + '_code_editor'} selo={props.selo} targetID={props.nodeID + '_markdown_'} text={markdown1}></CodeMirror>
				</div>
			</div>
		</>
	)
}
