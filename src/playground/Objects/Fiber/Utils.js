export function randomCostume (props, setLocal)  {
    const geometries = ["DodecahedronGeometry", "IcosahedronGeometry", "OctahedronGeometry", "TetrahedronGeometry", "SphereGeometry", "BoxGeometry"];

    const random = Math.floor(props.selo.random() * geometries.length);
    console.log(random, geometries[random]);
    setLocal("data", "properties", "costumeGeometry", geometries[random])// geometries[random]);

  }