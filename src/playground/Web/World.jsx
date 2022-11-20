/*
The MIT License (MIT)
Copyright (c) 2022 Nikolay Suslov and the Krestianstvo.org project contributors.
(https://github.com/NikolaySuslov/krestianstvo/blob/master/LICENSE.md)
*/


import { useLocation, useSearchParams, useParams } from "@solidjs/router"
import { createMemo } from "solid-js";
import worlds from "./Worlds"

import { generateURL, Selo } from "krestianstvo"

export default function World(props) {

    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const worldName = props.worldName ? props.worldName : useParams().world ? useParams().world : "emptyWorld";
    const pathname = createMemo(() => location.pathname);

    let reflectorHost = searchParams?.r ? searchParams?.r : null
    let parameters = searchParams?.p ? searchParams?.p : null
    let seloID = props.seloID ? props.seloID : searchParams?.k ? searchParams?.k : generateURL(pathname, worldName, reflectorHost, parameters)

    const worldComp = props.worlds[worldName]
   
    return (
        <Selo
            nodeID={worldName}
            seloID={seloID}
            reflectorHost={reflectorHost}
            info={true}
            parameters={parameters}
            component={worldComp}
            worlds={worlds}
            fallbackWorld={worlds.emptyWorld}
        />
    )
}