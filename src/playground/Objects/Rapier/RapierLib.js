import RAPIER from '@dimforge/rapier3d-compat';
import { CoefficientCombineRule, ColliderDesc, RigidBody, RigidBodyDesc, World, EventQueue, Vector3 } from '@dimforge/rapier3d-compat';
import { createSignal, createEffect, untrack, createResource, createRoot } from 'solid-js';
import { produce } from 'solid-js/store';

const [rap, sRap] = createSignal();


const rapier = async () => {
    //await new Promise(r => setTimeout(r, 2000))
    if (rap())
        return true

    return await RAPIER.init().then(() => {
        console.log("Init RAPIER: ", RAPIER);
        sRap(true)
        return true
    })
}

export function animateScene(props, local, doRapierWorldStep, m, sm){


    if (!props.rapier.world) {
        console.log("NO WORLD!!")
        sm((c) => c + 1)
      }
  
      //&& ready()
      if (!local.data.properties.paused && props.rapier.world) {
        //move()
        if (m() > 0) {
          console.log("Missed steps: ", m())
          for (let i = 0; i < m(); i++) {
            doRapierWorldStep()
          }
          sm(0)
  
        }
        doRapierWorldStep()
      }

    
}


export function loadRapierLib(){
    const [getRapier, setRapier] = createSignal();
    const [rapierLoad] = createResource(getRapier, rapier);

    setRapier(true) 
    // createEffect(() => {
    //     setTimeout(() => { setRapier(true) }, 0)
    // })

    return rapierLoad
}

export function initRapier(props, local, params) {
    
    const [rapierData, setRapierData] = createSignal({});
    createEffect(() => {

        if (props.selo.storeVT.stateSynced && rap()) {
            if (props.selo.storeVT.rapierWorlds && !props.selo.storeVT.rapierWorlds[props.nodeID])
                setTimeout(() => {
                    initRapierWorld(props, local, setRapierData, params)
                }, 0)
        }
    })

    return [rapierData]
}


function initRapierWorld(props, local, setRapierData, params) {

    console.log("Init Rapier world!")
    const events = new EventQueue(true)

    const obj = {}
    const gravity = params && params?.gravity ? params.gravity : new Vector3(0.0, -9.81, 0.0);

    if (local.data.rapierWorldState.length == 0) {
        const world = new World(gravity)
        Object.assign(obj, {
            rapier: RAPIER,
            world: world,
            events: events,
            restored: false
        })
        console.log("First Init physics: ", obj.world)
        setRapierData(obj)
    } else {

        const world = World.restoreSnapshot(local.data.rapierWorldState)
        Object.assign(obj, {
            rapier: RAPIER,
            world: world,
            events: events,
            restored: true
        })

        console.log("World state:", local.data.rapierWorldState)
        console.log("RESTORE from snapshot physics: ", obj.world)
        setRapierData(obj)
    }

    props.selo.setStoreVT(produce(s => {
        s.rapierWorlds[props.nodeID] = obj.world
    }))


}

