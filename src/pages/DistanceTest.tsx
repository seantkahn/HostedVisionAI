import React, { useEffect, useState, useRef } from 'react';
import vision from "@mediapipe/tasks-vision";
import { useHistory } from "react-router-dom";
import Webcam from "react-webcam";
import * as tf from "@tensorflow/tfjs";

const DistanceTest: React.FC = () => {
  const [faceLandmarker, setFaceLandmarker] = useState<any>(null);
  const [webcamRunning, setWebcamRunning] = useState<boolean>(false);
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runningMode: "IMAGE" | "VIDEO" = "VIDEO";
  const videoWidth = 480;
  const knownDistanceInches = 12; // The known distance from the camera in inches
  const knownDistanceMm = knownDistanceInches * 25.4; // Convert inches to mm
  const knownWidthMm = 63;//mm
  const focalLengthPixels = 0.78; // Your calculated focal length in pixels
  

  // Load the FaceLandmarker
  useEffect(() => {
    const loadFaceLandmarker = async () => {
      const { FaceLandmarker, FilesetResolver } = vision;
      const filesetResolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
      );
      const newFaceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
          delegate: "GPU"
        },
        outputFaceBlendshapes: true,
        runningMode,
        numFaces: 1
      });
      setFaceLandmarker(newFaceLandmarker);
    };

    loadFaceLandmarker();
  }, []);
  const onWebcamStart = () => {
    if (webcamRunning) {
        console.log('Trying to call predictwebcam from onwebcamstart');

      predictWebcam();
    }
  };
  // Enable webcam
  const enableCam = () => {
    predictWebcam();

    if (!faceLandmarker) {
      console.log("Wait! FaceLandmarker not loaded yet.");
      return;
    }

    setWebcamRunning(!webcamRunning);

    // if (!webcamRunning) {
    //   const constraints = { video: true };
    //   navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    //     if (webcamRef.current) {
    //       webcamRef.current.srcObject = stream;
    //       webcamRef.current.addEventListener('loadeddata', predictWebcam);
    //     }
    //   });
    // }
  };

  const predictWebcam = async () => {
    console.log('predictWebcam called');

    if (!faceLandmarker || !webcamRef.current || !canvasRef.current) {
      return;
    }
  
    const videoElement = webcamRef.current.video;
    if (!videoElement) return;
  
    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext("2d");
  
    if (!canvasCtx) {
      return;
    }
  
    const maxWidth = Math.min(window.innerWidth, 640);
    const ratio = videoElement.videoHeight / videoElement.videoWidth;
  
    canvas.style.width = `${maxWidth}px`;
    canvas.style.height = `${maxWidth * ratio}px`;
  
    canvas.width = maxWidth;
    canvas.height = maxWidth * ratio;
  
    try {
        console.log('Trying face landmark detection');

      const results = await faceLandmarker.detectForVideo(videoElement, performance.now());
      console.log('Detection results:', results);
      console.log('Face landmarks:', results.faceLandmarks[0]);
      console.log('Detection results:', results);

      if (results.faceLandmarks) {
        let landmarks = results.faceLandmarks;
        for (landmarks in results.faceLandmarks) {

        console.log('Face landmarks:', results.faceLandmarks[0]);
        console.log('Specific landmarks:', results.faceLandmarks[0][468], results.faceLandmarks[0][473]);
        console.log('Landmarks length:', landmarks.length);
        console.log('Landmark 468:', results.faceLandmarks[0][468]);
        console.log('Landmark 473:', results.faceLandmarks[0][473]);
        let pointLeft = { x: results.faceLandmarks[0][468].x, y: results.faceLandmarks[0][468].y }; // Left eye keypoint
        let pointRight = { x: results.faceLandmarks[0][473].x, y: results.faceLandmarks[0][473].y }; // Right eye keypoint
  
        const webcamFOV = 60; // Approximate field of view of the webcam
        const knownPupillaryDistanceMm = 63; // Average pupillary distance in millimeters
        const pixelDistanceBetweenEyes = calculatePixelDistance(
          pointLeft.x, pointLeft.y,
          pointRight.x, pointRight.y
        );
  
        const focalLengthPixels = 0.78;
        let distanceFromWebcamMm = (focalLengthPixels * knownPupillaryDistanceMm) / pixelDistanceBetweenEyes;
        let distanceFromWebcamInches = distanceFromWebcamMm / 25.4;
        console.log(`Distance from webcam: ${distanceFromWebcamInches.toFixed(2)} inches`);

        canvasCtx.font = '18px Arial';
        canvasCtx.fillStyle = 'black';
        canvasCtx.save(); // Save the current state

  
        canvasCtx.clearRect(0, 0, 200, 50); // Clear a rectangle for the text
        canvasCtx.fillText(`Distance: ${distanceFromWebcamInches.toFixed(2)} inches`, 10, 30);
        canvasCtx.restore(); // Restore the original state
  
        console.log(`Distance from webcam: ${distanceFromWebcamInches.toFixed(2)} inches`);
      }
    }
    } catch (error) {
      console.error("error calculating distance: ", error);
      console.error("error in predictWebcam: ", error);

    }
  
    if (webcamRunning) {
      window.requestAnimationFrame(predictWebcam);
    }
  };
  
  const calculatePixelDistance = (x1: number, y1: number, x2: number, y2: number) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  };


  // Render the component
  return (
    <div>
      <Webcam
        ref={webcamRef}
        id="webcam"
        style={{ width: videoWidth }}
        onUserMedia={onWebcamStart}
        audio={false}  // Disable audio to prevent feedback issues
      />
      <canvas ref={canvasRef} id="output_canvas" />
      <button onClick={enableCam}>
        {webcamRunning ? 'DISABLE PREDICTIONS' : 'ENABLE PREDICTIONS'}
      </button>
    </div>
  );
};

export default DistanceTest;