/*
The MIT License (MIT)
Copyright (c) 2022 Nikolay Suslov and the Krestianstvo.org project contributors.
(https://github.com/NikolaySuslov/krestianstvo/blob/master/LICENSE.md)
*/

import demo1 from '../Worlds/demo1/Index'
import demo2 from '../Worlds/demo2/Index'
import demo3 from '../Worlds/demo3/Index'
import demo4 from '../Worlds/demo4/Index'

import pixel from '../Worlds/pixel/Index'
import rapier from '../Worlds/rapier/Index'
import painter from '../Worlds/painter/Index'
import multi from '../Worlds/multi/Index'
import multicamera from '../Worlds/multicamera/Index'
import grid from '../Worlds/grid/Index'
import fiber from '../Worlds/fiber/Index'
import portals3d from '../Worlds/3d/Index'

import { default as simple } from '../Worlds/Simple'
import { default as emptyWorld } from '../Worlds/EmptyWorld'
import HomeWorld from "../Worlds/HomeWorld"

import counter from '../Objects/Counter'
import portal from '../Objects/Portal'

import { default as rselo } from '../Worlds/Examples/Portal/RecursiveSelo'
import { default as rworld } from '../Worlds/Examples/Portal/RecursiveWorld'

const worlds = {

    demo1: demo1,
    demo2: demo2,
    demo3: demo3,
    demo4: demo4,

    rapier: rapier,
    pixel: pixel,
    painter: painter,
    multi: multi,
    grid: grid,
    multicamera: multicamera,
    fiber: fiber,

    counter: counter,
    portal: portal,
    simple: simple,
    emptyWorld: emptyWorld,
    home: HomeWorld,

    rselo: rselo,
    rworld: rworld,
    "3d": portals3d

}

export default worlds