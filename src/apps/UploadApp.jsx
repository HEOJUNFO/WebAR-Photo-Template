import {
	Box3,
	Cache,
	LoaderUtils,
	LoadingManager,
	PMREMGenerator,
	PerspectiveCamera,
	REVISION,
	Vector3,
	WebGLRenderer,
	LinearToneMapping,
  SRGBColorSpace,
} from 'three';
import React, { useEffect, useState, useRef,useMemo } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, useAnimations, TransformControls } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { proxy, useSnapshot } from 'valtio'

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

const modes = ['translate', 'rotate', 'scale']
const state = proxy({ current: null, mode: 0 })

export default function App({settings}) {
  const [state, setState] = useState({
    environments : environments[1].name,
    playbackSpeed : 1.0,
    actionStates : {},
    camera : DEFAULT_CAMERA,
    autoRoate: false,

    exposure: 0.0,
    ambientIntensity: 0.3,
    ambientColor:  '#FFFFFF',
    directIntensity: 0.8 * Math.PI,
    directColor:  '#FFFFFF',

    pointSize: 1.0,
  });

  const fov =  60;
	const aspect = window.innerWidth / window.innerHeight;

  const[camera,setCamera] = useState(new PerspectiveCamera(fov, aspect, 0.01, 1000));
  const orbitControls = useRef();

  const {renderer} = useRef(new WebGLRenderer({ antialias: true }));
  return (
   <>
     <Canvas
        concurrent="true"
        gl={renderer}
        camera={camera}
        onCreated={({ gl }) => {
          gl.setPixelRatio(window.devicePixelRatio);
          gl.toneMapping = LinearToneMapping;
          gl.outputColorSpace = SRGBColorSpace;
        }}> 
      <Viewer setting={settings} state={state} camera={camera} orbitControls={orbitControls}  />
      <CameraBackground />
      <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.75} ref={orbitControls} />
    </Canvas>
    </>
  )
}

function Viewer({ setting,state, camera, orbitControls }) {
  const { gl, scene } = useThree();

  const neutralEnvironment = useMemo(() => {
    const pmremGenerator = new PMREMGenerator(gl);
    pmremGenerator.compileEquirectangularShader();

    const envMap = pmremGenerator.fromScene(new RoomEnvironment()).texture;

    pmremGenerator.dispose();
    return envMap;
  }, [gl]);


  useMemo(() => {
    scene.environment = neutralEnvironment;
  }, [neutralEnvironment, scene]);

  return (
    <>
        <ambientLight intensity={state.ambientIntensity} color={state.ambientColor} />
        <directionalLight
          intensity={state.directIntensity}
          color={state.directColor}
          position={[0, 0, 100]}
          castShadow /> 
        {setting.rootFile && <Load url={setting.rootFile} rootPath={setting.rootPath} assetMap={setting.fileMap} camera={camera} orbitControls={orbitControls}/>}
    </>
  )
}

function Load({url,rootPath, assetMap,camera, orbitControls}) {
  const [light, setLight] = useState([]);
  const [content, setContent] = useState(null);
  const [mixer, setMixer] = useState(null);
  const [clips, setClips] = useState([]);
  const { gl, scene } = useThree();
  const [object, setObject] = useState(null);
  const baseURL = useMemo(() => LoaderUtils.extractUrlBase(url), [url]);

  useEffect(() => {
    MANAGER.setURLModifier((url, path) => {
      const normalizedURL =
        rootPath +
        decodeURI(url)
          .replace(baseURL, '')
          .replace(/^(\.?\/)/, '');

      if (assetMap.has(normalizedURL)) {
        const blob = assetMap.get(normalizedURL);
        const blobURL = URL.createObjectURL(blob);
        blobURLs.push(blobURL);
        return blobURL;
      }

      return (path || '') + url;
    });

    const loader = new GLTFLoader(MANAGER)
      .setCrossOrigin('anonymous')
      .setDRACOLoader(DRACO_LOADER)
      .setKTX2Loader(KTX2_LOADER.detectSupport(gl))
      .setMeshoptDecoder(MeshoptDecoder);

    const blobURLs = [];

    loader.load(
      url,
      (gltf) => {
        const scene = gltf.scene || gltf.scenes[0];
        const clips = gltf.animations || [];

        if (!scene) {
          throw new Error(
            'This model contains no scene, and cannot be viewed here. However,' +
              ' it may contain individual 3D resources.',
          );
        }

        setObject(scene);
        setClips(clips);
      
        blobURLs.forEach(URL.revokeObjectURL);
      },
      undefined,
      (e) => console.error(e),
    );
  },[assetMap, baseURL, rootPath]);

  return <>
  {object !== null &&<SetContent object={object} clip={clips} camera={camera} orbitControls={orbitControls} name="model"/>}
 </>
}

function SetContent({object,clip,camera, orbitControls,name}){
  const { actions } = useAnimations(clip, object);
  const snap = useSnapshot(state)

  useEffect(() => {

    Object.values(actions).forEach(action => action.play());
 
  }, [actions]);

  useEffect(() => {
    object.updateMatrixWorld();
  
    const box = new Box3().setFromObject(object);
    const size = box.getSize(new Vector3()).length();
    const center = box.getCenter(new Vector3());
  
    object.position.x += object.position.x - center.x;
    object.position.y += object.position.y - center.y;
    object.position.z += object.position.z - center.z;
  
    camera.near = size / 100;
    camera.far = size * 100;
    camera.updateProjectionMatrix();
  
    camera.position.copy(center);
    camera.position.x += size / 1.0;
    camera.position.y += size / 2.5;
    camera.position.z += size / 1.0;
    camera.lookAt(center);
  }, []);

  return <>
  <primitive object={object} onClick={(e) => (e.stopPropagation(), (state.current = name))} onPointerMissed={(e) => e.type === 'click' && (state.current = null)} onContextMenu={(e) => snap.current === name && (e.stopPropagation(), (state.mode = (snap.mode + 1) % modes.length))} name={name} />
  {snap.current &&<TransformControls object={object}  mode={modes[snap.mode]}/>}
  </> 
}

function isIOS() {
  return (
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
  );
}
