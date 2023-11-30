import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';

const CameraBackground = (props) => {
  const { scene } = useThree();
  const videoRef = useRef();
  const [videoTexture, setVideoTexture] = useState();

  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const constraints = { video: { width: 1280, height: 720 } };
      navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
          const video = document.createElement('video');
          video.srcObject = stream;
          video.autoplay = true;
          video.muted = true;
          video.playsInline = true;
         
          video.onloadedmetadata = () => {
            video.play().then(() => {
              const texture = new THREE.VideoTexture(video);
              texture.minFilter = THREE.NearestFilter;
              texture.magFilter = THREE.NearestFilter;
              texture.format = THREE.RGBAFormat;
              texture.colorSpace = THREE.SRGBColorSpace;
              texture.wrapS = THREE.RepeatWrapping;
              texture.wrapT = THREE.RepeatWrapping;

              setVideoTexture(texture);
              videoRef.current = video;
            }).catch(error => {
              console.error("Video play error:", error);
            });
          };
        })
        .catch(error => {
          console.error("Webcam access error:", error);
        });
    }
  }, []);

  useFrame(() => {
    if (videoTexture) {
      videoTexture.needsUpdate = true;
    }
  });

  useEffect(() => {
    if (videoTexture) {
      scene.background = videoTexture;
      
    }
  }, [videoTexture, scene]);

  return null;
};

export default CameraBackground;
