/*
The MIT License (MIT)
Copyright (c) 2022 Nikolay Suslov and the Krestianstvo.org project contributors.
(https://github.com/NikolaySuslov/krestianstvo/blob/master/LICENSE.md)
*/

import { lazy } from "solid-js";
import { Routes, Route } from "solid-app-router"
import { Selo } from "krestianstvo"

const World = lazy(() => import('./World'))
const Settings = lazy(() => import('./Settings'))

import worlds from "./Worlds"

export default function Root(props) {

	return (
		<>
			<Routes>
				<Route path="/" element={
					<Selo
						nodeID={"home"}
						seloID={"home"}
						component={worlds.home}
					/>
				} />
				<Route path="/settings" element={<Settings config={props.config} setConfig={props.setConfig} />} />
				<Route path="/:world" element={<World worlds={worlds}></World>} />
			</Routes>
		</>
	)
}
