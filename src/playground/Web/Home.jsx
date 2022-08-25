/*
The MIT License (MIT)
Copyright (c) 2022 Nikolay Suslov and the Krestianstvo.org project contributors.
(https://github.com/NikolaySuslov/krestianstvo/blob/master/LICENSE.md)
*/

import { Link } from "solid-app-router"

export default function Home(props) {

	return (
		<>
			<div m2 p2>
				<p text-7>Krestianstvo | Multiverse</p>
				<nav>
					<Link href="/">Home </Link>
					<Link class="p2" href="/settings">Settings</Link>
					<Link class="p2" href="">GitHub source code </Link>
				</nav>
				<hr />
				<div p3>
					<p text-6>About</p>
					<div text-5>
					Here you can find the full-featured implementation of the <a href="">Croquet Application Architecture</a> in functional reactive paradigm, based on <a href="">SolidJS</a> and <a href="">S.JS</a>. Based on just signals and reactive computations. It's Virtual Time and Reflector are based on <a href="">Virtual World Framework's</a> implementation. Krestianstvo is minimal and distributed as a standalone ESM module, that could be easily bundled with any <a href="">SolidJS</a> or <a href="">Astro</a> web application.
					</div>
					<p text-6>Demo Worlds</p>
					<p text-4> - All demos are collaborative worlds, just use the generated URL links or QR codes to join from other devices / web browsers</p>
					<p text-4> - You can insert in any portal text fields the links to the already created worlds, even world link pointing to itself to make a recursive portal</p>
					<p text-4> - There is no 404 world, an inexistent world is also a world to start with</p>
					<p text-4> - No iFrames for portals. All objects in worlds are just pure Solid JS components - Signals and Effects </p>
					<nav text-5 style={{ width: "fit-content" }}>
						<Link class="block p2" href="/simple">Hello world!</Link>
						<Link class="block p2" href="/demo1">World with counter and portals</Link>
						<Link class="block p2" href="/rapier">RapierJS world: cross-platform determinism </Link>
						<Link class="block p2" href="/multi">MultiPixel: Recursive ThreeJS world</Link>
						<Link class="block p2" href="/demo3">Recursive Selo</Link>
						<Link class="block p2" href="/demo2">Recursive World app in single Selo</Link>
						<Link class="block p2" href="/pixel">Pixel: ThreeJS world ready for multipixel</Link>
						<Link class="block p2" href="/fiber">SolidJS Fiber / ThreeJS world </Link>
						<Link class="block p2" href="/painter">Paint canvas</Link>
						<Link class="block p2" href="/grid?p=1">Grid 1: world with 1 portal </Link>
						<Link class="block p2" href="/grid?p=4">Grid 4: world with 4 portals </Link>
						<Link class="block p2" href="/errorworld">404 world </Link>
						<Link class="block p2" href="/counter">Counter object as world </Link>

					</nav>
				</div>
				<hr></hr>
				<div class="p2 text-3"><Link href="https://www.krestianstvo.org">Krestianstvo.org</Link> | 2022</div>


			</div>

		</>
	)
}
