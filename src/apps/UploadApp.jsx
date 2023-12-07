import {
	AmbientLight,
	AnimationMixer,
	Box3,
	Cache,
	Color,
	DirectionalLight,
	HemisphereLight,
	LoaderUtils,
	LoadingManager,
	PMREMGenerator,
	PerspectiveCamera,
	PointsMaterial,
	REVISION,
	Vector3,
	WebGLRenderer,
	LinearToneMapping,
	ACESFilmicToneMapping,
  SRGBColorSpace
} from 'three';
import React, { useEffect, useState, useRef,useMemo } from 'react';
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

  const {defaultCamera} = useRef(new PerspectiveCamera(fov, aspect, 0.01, 1000));
  const {activeCamera} = useRef(defaultCamera);

  const {renderer} = useRef(new WebGLRenderer({ antialias: true }));
  return (
   <>
     <Canvas
        concurrent="true"
        gl={renderer}
        camera={defaultCamera}
        onCreated={({ gl }) => {
          gl.setPixelRatio(window.devicePixelRatio);
          gl.toneMapping = LinearToneMapping;
          gl.outputColorSpace = SRGBColorSpace;
        }}
      > <Viewer setting={settings} state={state} />
      <CameraBackground />
    </Canvas>
    </>
  )
}

function Viewer({ setting,state }) {
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
          castShadow
        /> 
        {setting.rootFile && <Load url={setting.rootFile} rootPath={setting.rootPath} assetMap={setting.fileMap} />}
       
    </>
  )
}

function Load({url,rootPath, assetMap}) {
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
  {object !== null &&<SetContent object={object} clip={clips} />}
 </>
}

function SetContent({object,clip}){
  console.log(object);

  return <>
  <primitive object={object} />
  </>
  
}



function isIOS() {
  return (
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.userAgent.includes('Mac') && 'ontouchend' in document)

  );
}
