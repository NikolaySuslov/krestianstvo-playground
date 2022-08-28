/*
The MIT License (MIT)
Copyright (c) 2022 Nikolay Suslov and the Krestianstvo.org project contributors.
(https://github.com/NikolaySuslov/krestianstvo/blob/master/LICENSE.md)
*/

import { createSignal } from "solid-js"
import { Link } from "solid-app-router"
import { createLocalStore, getRandomColor } from 'krestianstvo'
import DefaultAvatar from "../Objects/DefaultAvatar"


export default function HomeWorld(props) {

	const [local, setLocal] = createLocalStore({
		data: {
			type: "Node",
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
					/>
				</Show>

				<div m2 p2>
					<p text-9>Krestianstvo | Playground</p>
					<nav>
						<Link href="/">Home </Link>
						<Link class="p2" href="/settings">Settings</Link>
						<Link class="p2" href="https://github.com/NikolaySuslov/krestianstvo-playground">GitHub source code </Link>
					</nav>

					<hr />
					<div p3>
					<div style="padding:56.25% 0 0 0;position:relative;"><iframe src="https://player.vimeo.com/video/742885266?h=45918cfab7&title=0&byline=0&portrait=0" style="position:absolute;top:0;left:0;width:100%;height:100%;" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div><script src="https://player.vimeo.com/api/player.js"></script>
						<p text-6>About</p>
						<div text-5>
							Here you can find the full-featured implementation of the <a href="https://croquet.io">Croquet Application Architecture</a> in functional reactive paradigm, using <a href="https://www.solidjs.com">SolidJS</a> and <a href="https://github.com/adamhaile/S">S.JS</a>. It is based on just signals and reactive computations. Virtual Time and Reflector are based on <a href="https://github.com/virtual-world-framework/vwf">Virtual World Framework's</a> implementation. Krestianstvo is minimal and distributed as a standalone ESM module, that could be easily bundled with any <a href="https://www.solidjs.com">SolidJS</a> or <a href="https://astro.build/">Astro</a> web application.
						</div>
						<p text-6>Demo Worlds</p>
						<div text-5>
							<p> - All demos are collaborative worlds, just use the generated URL links or QR codes to join from other devices / web browsers</p>
							<p> - This page is a world and is collaborative, just open this site in another browser tab</p>
							<p> - You can insert in any portal's text fields links to the already created worlds, even linking worlds to themselves to make a recursive portals</p>
							<p> - There is no 404 world, an inexistent world is also a world to start with</p>
							<p> - No iFrames for portals. All objects in worlds are just pure Solid JS components - Signals and Effects </p>
						</div>

						<nav text-5 style={{ width: "fit-content" }}>
							<Link class="block p2" href="/simple">Hello world!</Link>
							<Link class="block p2" href="/demo1">World with counter and portals</Link>
							<Link class="block p2" href="/rapier">RapierJS world: cross-platform determinism </Link>
							<Link class="block p2" href="/multi">MultiPixel: Recursive ThreeJS world</Link>
							<Link class="block p2" href="/pixel">Pixel: ThreeJS world ready for multipixel</Link>
							<Link class="block p2" href="/fiber">SolidJS Fiber / ThreeJS world </Link>
							<Link class="block p2" href="/painter">Paint canvas</Link>
							<Link class="block p2" href="/demo3">Recursive Selo</Link>
							<Link class="block p2" href="/demo2">Recursive World app in single Selo</Link>
							<Link class="block p2" href="/demo2">Recursive World app in multi-local Selos</Link>
							<Link class="block p2" href="/grid?p=1">Grid 1: world with 1 portal </Link>
							<Link class="block p2" href="/grid?p=4">Grid 4: world with 4 portals </Link>
							<Link class="block p2" href="/errorworld">404 world </Link>
							<Link class="block p2" href="/counter">Counter object as world </Link>
						</nav>
						<hr></hr>

						<p text-6>Open Source</p>
						<nav text-4 style={{ width: "fit-content" }}>
							<Link class="block p2" href="https://github.com/NikolaySuslov/krestianstvo-playground">Krestianstvo Playground on GitHub </Link>
							<Link class="block p2" href="https://github.com/NikolaySuslov/krestianstvo">Krestianstvo core SolidJS on GitHub </Link>
							<Link class="block p2" href="https://github.com/NikolaySuslov/krestianstvo-s.js">Krestianstvo core S.js on GitHub </Link>
							<Link class="block p2" href="https://github.com/NikolaySuslov/lcs-reflector">Krestianstvo Reflector server on GitHub</Link>
						</nav>

						<p text-6>TODO: API & Documentation</p>

					</div>

					<hr></hr>
					<div class="p4 text-4"><Link href="https://www.krestianstvo.org">Krestianstvo.org</Link> | 2022</div>

				</div>
			</div>
		</>
	)
}
