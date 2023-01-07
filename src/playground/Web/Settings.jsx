/*
The MIT License (MIT)
Copyright (c) 2022 Nikolay Suslov and the Krestianstvo.org project contributors.
(https://github.com/NikolaySuslov/krestianstvo/blob/master/LICENSE.md)
*/

import { Link } from "@solidjs/router"

export default function Settings(props) {

	let inputDiv;
	let devMode;

	const handleKeyUp = (e) => {
		if (e.key === 'Enter' || e.keyCode === 13) {
			props.setConfig("defaultReflectorHost", inputDiv.value)
			//history.back();
		}
	}

	const handleClick = (e) => {
		props.setConfig("defaultReflectorHost", inputDiv.value)
		//history.back();
	}

	const setDevMode = (e) => {
		props.setConfig("devMode", devMode.checked)
	}

	return (
		<>
			<div m2 p2>
				<nav>
					<Link href="/"> Home </Link>
				</nav>

				<p text-7>Settings</p>
				<div align-center flex >
					<div pr2 text-4 class="fw400">Default reflector host:</div>
					<input text-4 ref={inputDiv}
						size={30}
						placeholder="enter text"
						value={props.config.defaultReflectorHost}
						onKeyUp={handleKeyUp}
					//onInput={(e) => handleTextInput(e.currentTarget.value)}
					/>
				</div>
				<div pt3><button text-4 onClick={handleClick}>Update</button></div>

				<div pt5 align-center flex >
					<div pr2 text-4 class="fw700">DEV mode:</div>
					<input ref={devMode} type="checkbox" checked={props.config.devMode} onChange={setDevMode}/>

				</div>

			</div>
		</>
	)
}
