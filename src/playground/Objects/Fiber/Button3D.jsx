
import { DoubleSide } from 'three'

  export default function Button3D(props) {

    let ref;

    // const geometry = new PlaneGeometry( props.width, props.height );
    // const material = new MeshPhysicalMaterial( { color: props.color, opacity: props.opacity, transparent: true, side: DoubleSide } );
    // geometry.center()

    return (
        <mesh {...props} ref={ref} position={props.position}>
        <planeGeometry attach="geometry" args={[props.width, props.height]}/> 
        <meshStandardMaterial attach="material" color={props.color} opacity= {props.opacity} transparent= {true} side={DoubleSide}/>
        </mesh>
      )

  }

