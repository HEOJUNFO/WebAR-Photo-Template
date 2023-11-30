import {
	AmbientLight,
	AnimationMixer,
	AxesHelper,
	Box3,
	Cache,
	Color,
	DirectionalLight,
	GridHelper,
	HemisphereLight,
	LoaderUtils,
	LoadingManager,
	PMREMGenerator,
	PerspectiveCamera,
	PointsMaterial,
	REVISION,
	Scene,
	SkeletonHelper,
	Vector3,
	WebGLRenderer,
	LinearToneMapping,
	ACESFilmicToneMapping,
  SRGBColorSpace
} from 'three';
import React, { useEffect, useState, useRef } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

import { environments } from '../environments.js';

import CameraBackground from "../CameraBackground";
import "../styles.css"

const DEFAULT_CAMERA = '[default]';

const MANAGER = new LoadingManager();
const THREE_PATH = `https://unpkg.com/three@0.${REVISION}.x`;
const DRACO_LOADER = new DRACOLoader(MANAGER).setDecoderPath(
	`${THREE_PATH}/examples/jsm/libs/draco/gltf/`,
);
const KTX2_LOADER = new KTX2Loader(MANAGER).setTranscoderPath(
	`${THREE_PATH}/examples/jsm/libs/basis/`,
);

const IS_IOS = isIOS();

const Preset = { ASSET_GENERATOR: 'assetgenerator' };

Cache.enabled = true;


export default function App({settings}) {
  return (
    <Canvas dpr={[1, 1]} camera={{ fov: 50, position: [0, 0, 25], near: 1, far: 100 }}  onCreated={({ gl }) => {
        gl.toneMapping = LinearToneMapping
        gl.colorSpace = SRGBColorSpace
        gl.toneMappingExposure = Math.pow(2, 0)
        gl.punctualLights = true
      }}>
      <CameraBackground/>
      {settings.model && <Viewer url={settings.model} />}
    </Canvas>
  )
}

function Viewer({ url }) {
  const { scene, gl } = useThree();
  const model = useLoader(GLTFLoader, url); // GLTF 모델 로드

  useEffect(() => {
    scene.add(model.scene);

  }, [model, scene]);

  useFrame(({ clock }) => {
    const mixer = new AnimationMixer(model.scene);
  
  });

  return null; 
}


function isIOS() {
  return (
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
  );
}
