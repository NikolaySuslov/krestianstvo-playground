/*
The MIT License (MIT)
Copyright (c) 2022 Nikolay Suslov and the Krestianstvo.org project contributors.
(https://github.com/NikolaySuslov/krestianstvo/blob/master/LICENSE.md)
*/

import { onMount } from 'solid-js';
import { showState, createQRCode, createLinkForSelo } from 'krestianstvo'

export default function SeloInfo(props) {

    let thisDiv;

    let link = createLinkForSelo(props.selo)

    onMount(() => {
        createQRCode(thisDiv, link)
    })
    
    return (
        <>
            <div p2 absolute flex-h style={{ right: 0 }}>
                <div text-center ref={thisDiv} />
                <a href={link} text-center fw300 target="_blank">Link</a>
            </div>
        </>
    )

}
