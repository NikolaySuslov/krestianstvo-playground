/*
The MIT License (MIT)
Copyright (c) 2022 Nikolay Suslov and the Krestianstvo.org project contributors.
(https://github.com/NikolaySuslov/krestianstvo/blob/master/LICENSE.md)
*/

import { onMount, createSignal, createResource, createEffect } from 'solid-js';
import { createLocalStore } from 'krestianstvo'
import SolidMarkdown from "solid-markdown";

import { IoMenuOutline } from 'solid-icons/io'

import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

import 'highlight.js/styles/github.css';
import 'katex/dist/katex.min.css'

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
				source: props.source ? props.source : markdown1
			},
			dynamic: [
			]
		}
	}, props);

	async function getSource() {
		return local.data.properties.source
	}

	const [getMD, setMD] = createSignal();
	const [markdown, { mutate, refetch }] = createResource(getMD, getSource);

	setMD(true)


	const step = (tick) => {}

	const postInitialize = () => {
		refetch()
	}

	const initialize = () => {}

	const doesNotUnderstand = (data) => {
		console.log("MY doesNotUnderstand action: ", data)
	}

	const textChanged = (data) => {
		setLocal("data", "properties", "text", data[0])
	}

	const updateSource = (data) => {
		setLocal("data", "properties", "source", data[0])
		refetch()
	}

	props.selo.createAction(props.nodeID, "doesNotUnderstand", doesNotUnderstand, true)
	props.selo.createAction(props.nodeID, "step", step)
	props.selo.createAction(props.nodeID, "initialize", initialize)
	props.selo.createAction(props.nodeID, "postInitialize", postInitialize)
	props.selo.createAction(props.nodeID, "textChanged", textChanged)
	props.selo.createAction(props.nodeID, "updateSource", updateSource)


	onMount(() => { })

	function handleToggleCodeEditor(value) {

		let container = props.selo.getNodeByID(props.containerID);
		let position = container ? { x: container.data.properties.position.x + 270, y: container.data.properties.position.y } : { x: 0, y: 0 }
		let newMsg = {}
		newMsg.position = position
		newMsg.component = "CodeTool"
		newMsg.properties = { targetID: props.nodeID, text: local.data.properties.source, language: "markdown" }
		props.selo.sendExtMsg({ msg: "createNode", id: props.worldID, params: [newMsg] })

	}

	return (
		<>
			<div class="grid grid-rows-1 grid-cols-2" style={{
				"grid-template-columns": "max-content 1fr"
			}}>
				<div class="col-span-1 box">
					<div>{!markdown.loading &&
						<SolidMarkdown
							rehypePlugins={[rehypeRaw,
								[rehypeSanitize, {
									...defaultSchema,
									tagNames: [
										...defaultSchema.tagNames,
										'iframe'
									],
									attributes: {
										...defaultSchema.attributes,
										iframe: ["src", "source", "width", "height", "title", "id", "allow"],
										div: [
											...defaultSchema.attributes.div,
											['className', 'math', 'math-display']
										],
										span: [
											['className', 'math', 'math-inline']
										],
										code: [
											...(defaultSchema.attributes.code || []),
											// List of all allowed languages:
											['className', 'language-js', 'language-css', 'language-md']
										]
									}
								}],
								rehypeKatex, rehypeHighlight]}
							remarkPlugins={[remarkGfm, remarkMath]}
							children={markdown()} />}</div>
				</div>
				<div class="col-span-1 box">
					<button onClick={[handleToggleCodeEditor, true]} bg-transparent hover:bg-gray-100 text-sm text-black font-mono font-light py-2 px-4 rounded b-0 ><IoMenuOutline size={"2em"} /></button>
				</div>
			</div>
		</>
	)
}
