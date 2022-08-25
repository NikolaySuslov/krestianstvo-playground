/*
The MIT License (MIT)
Copyright (c) 2022 Nikolay Suslov and the Krestianstvo.org project contributors.
(https://github.com/NikolaySuslov/krestianstvo/blob/master/LICENSE.md)
*/

import { createSignal } from 'solid-js';
import AvatarSimple from './AvatarSimple'

const [uiEl, setUiEl] = createSignal(null);
const Avatars = (props) => {

	return (
		<>
			<div ref={setUiEl}></div>
			<For each={props.selo.storeNode.clients}
				fallback={<div>Loading...</div>}>
				{(item) =>
					<Dynamic
						nodeID={item}
						component={props.avatarComponent} //{components["Avatar"]}
						el={props.el}
						uiEl={props.uiEl ? props.uiEl : uiEl}
						scale={props.scale}
						angle={props.angle}
						selo={props.selo}
						moniker_={props.selo.storeVT.moniker_} />
				}
			</For>
		</>
	)

}

const DefaultAvatar = (props) => {

	return (
		<>
			<Switch>
				<Match when={!props.avatarComponent}>
					<Avatars
						{...props}
						avatarComponent={AvatarSimple}
					/>
				</Match>
				<Match when={props.avatarComponent}>
					<Avatars
						{...props}
					/>
				</Match>
			</Switch>
		</>
	)


}

export default DefaultAvatar