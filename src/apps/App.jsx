import * as THREE from "three"
import { Suspense, useMemo, useRef } from "react"
import { Canvas, useThree, useFrame } from "@react-three/fiber"
import { useGLTF,  MeshRefractionMaterial, CubeCamera } from "@react-three/drei"
import { EffectComposer, Bloom, DepthOfField } from "@react-three/postprocessing"

import CameraBackground from "../CameraBackground";
import "../styles.css"


function Diamonds({ count=20 }) {
  const { viewport, clock } = useThree()
  const model = useRef()
  const { nodes } = useGLTF('./assets/dflat.glb')

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const diamonds = useMemo(() => 
  new Array(count).fill().map(() => ({
    position: [
      THREE.MathUtils.randFloatSpread(viewport.width), 
      10 - Math.random() * 20,
      THREE.MathUtils.randFloatSpread(15) - 10
    ],
    factor: 0.75 + Math.random() * 2,
    direction: Math.random() < 0.5 ? -1 : 1,
    rotation: [Math.sin(Math.random()) * Math.PI, Math.sin(Math.random()) * Math.PI, Math.cos(Math.random()) * Math.PI]
  })),
  [count, viewport.width] 
);

useFrame((state, delta) => {
    const t = clock.getElapsedTime();
  
    const updatePosition = (data) => {
      data.position[1] -= data.factor * 1 * delta * data.direction;
      if (data.direction === 1 ? data.position[1] < -20 : data.position[1] > 20) {
        data.position = [viewport.width / 2 - Math.random() * viewport.width, 50 * data.direction, data.position[2]];
      }
    };
  
    diamonds.forEach((data, i) => {
      updatePosition(data);
      const { position, rotation, factor } = data;
  
      dummy.position.set(position[0], position[1], position[2]);
      dummy.rotation.set(rotation[0] + (t * factor) / 10, rotation[1] + (t * factor) / 10, rotation[2] + (t * factor) / 10);
      dummy.scale.setScalar(1 + factor);
      dummy.updateMatrix();
      model.current.setMatrixAt(i, dummy.matrix);
    });
  
    model.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <CubeCamera>
      {(texture) => (
        <instancedMesh ref={model} args={[nodes.Diamond_1_0.geometry, null, diamonds.length]}>
          <MeshRefractionMaterial bounces={1} aberrationStrength={0.01} envMap={texture} toneMapped={false} />
        </instancedMesh>
      )}
    </CubeCamera>
  )
}

export default function App({settings}) {
  return (
    <Canvas dpr={[1, 1]} camera={{ fov: 50, position: [0, 0, 25], near: 1, far: 100 }}  onCreated={({ gl }) => {
        gl.setSize(window.innerWidth, window.innerHeight)
        gl.toneMapping = THREE.LinearToneMapping
        gl.colorSpace = THREE.SRGBColorSpace
        gl.toneMappingExposure = Math.pow(2, 0)
        gl.punctualLights = true
      }}>
  
        <CameraBackground/>
        <Diamonds count={settings.diamondCount}/>
    
      <EffectComposer>
        <Bloom luminanceThreshold={0.8} luminanceSmoothing={0.1} intensity={0.1} levels={1} mipmapBlur={false} />
      </EffectComposer>
    </Canvas>
  )
}


