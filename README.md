# Krestianstvo | Playground

Krestianstvo | Playground - is the collection of worlds and experiences, developed using **[Krestianstvo | Solid JS](https://github.com/NikolaySuslov/krestianstvo)**

## Live Demo

**https://play.krestianstvo.org**

Mirror hosting:    
**https://krestianstvo-playground.glitch.me** (Glitch deployment with own Reflector)   
**https://xrvr.art** (Vercel deployment)

## [Read Documentation](https://docs.krestianstvo.org)  
**[Introduction post](https://dev.to/nikolaysuslov/krestianstvo-sdk-4-implementing-croquet-and-recursive-portals-on-solid-js-54ai)**

![image](/public/sdk4.jpg)


**Krestianstvo SDK 4** is the Open Source implementation of the **[Croquet](https://en.wikipedia.org/wiki/Croquet_OS)** application architecture in **Functional Reactive Paradigm**.

Krestianstvo SDK 4 is mainly developed using **[Solid JS](https://www.solidjs.com)** with the prototype in [S.JS](https://github.com/NikolaySuslov/krestianstvo-s.js). The applications built with Krestianstvo SDK 4 are using just Signals, Effects and reactive computations to get the original scene of Croquet's Objects with Message passing. It is minimal and distributed as a standalone ESM JavaScript module to be bundled within any **[Solid JS](https://www.solidjs.com)** or **[Astro](https://astro.build)** web applications.


## Playground Worlds

![image](/public/portals3d.jpg)  
[Video of 3D Portals](https://vimeo.com/768846153)

>- All demos are collaborative worlds, just use the generated URL links or QR codes to join from other devices / web browsers 
>- The home page is a world and is collaborative, just open it in another browser tab
>- You can insert in any portal's text fields links to the already created worlds, even linking worlds to themselves to make a recursive portals
>- There is no 404 world, an inexistent world is also a world to start with
>- No iFrames for portals. All objects in worlds are just pure Solid JS components - Signals and Effects

## List of Worlds

### [Portals 3D (direct)](https://play.krestianstvo.org/3d)
### [Portals 3D (mirror)](https://play.krestianstvo.org/3d?p=mirror0.2)
### [Hello world!](https://play.krestianstvo.org/simple)
### [World with counter and portals](https://play.krestianstvo.org/demo1)
### [RapierJS world: cross-platform determinism](https://play.krestianstvo.org/rapier)
### [MultiPixel: Recursive ThreeJS world](https://play.krestianstvo.org/multi)
### [Pixel: ThreeJS world ready for multipixel](https://play.krestianstvo.org/pixel)
### [SolidJS Fiber / ThreeJS world](https://play.krestianstvo.org/fiber)
### [Paint canvas](https://play.krestianstvo.org/painter)
### [Recursive Selo](https://play.krestianstvo.org/demo3)
### [Recursive World app in single Selo](https://play.krestianstvo.org/demo2)
### [Recursive World app in multi-local Selos](https://play.krestianstvo.org/demo4)
### [Grid 1: world with 1 portal](https://play.krestianstvo.org/grid?p=1)
### [Grid 4: world with 4 portals](https://play.krestianstvo.org/grid?p=4)
### [404 world](https://play.krestianstvo.org/errorworld)
### [Counter object as world](https://play.krestianstvo.org/counter)
### [Portal example from Docs: Recursive World ](https://play.krestianstvo.org/rworld)
### [Portal example from Docs: Recursive Selo ](https://play.krestianstvo.org/rselo)
### [Prototype World on S.js](https://krestianstvo.org/s)


## Develop 

**Run Krestianstvo | Playground**

```js
git clone https://github.com/NikolaySuslov/krestianstvo-playground 
npm install
npm run dev  
```

By default Vite will start the development server: `http://localhost:5173`   
Copy this link to the Web browser

**Run local Reflector server or connect to the public one**

Public running reflector: **https://time.krestianstvo.org**

Run your local Reflector 

```js
git clone https://github.com/NikolaySuslov/lcs-reflector 
npm install  
npm run start 
```

By default Reflector server will start at: http://localhost:3001  


## Build and deploy

The project is using Vite

```js
npm run build
npm run serve
```

## Contributing

All code is published under the MIT license
