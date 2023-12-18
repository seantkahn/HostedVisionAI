import React, { SetStateAction } from 'react';
// Importing a default export
import * as vision from '@mediapipe/tasks-vision';
const { FaceLandmarker, FilesetResolver, DrawingUtils } = vision;
import { predictWebcam } from './app1';
import {calculateEyeDistanceFromWebcam} from './app1';
import {calculateDistanceInMm} from './app1';
import {calculatePixelDistance} from './app1';
import {enableCam} from './app1';
import {hasGetUserMedia} from './app1';
import {createFaceLandmarker} from './app1';
import {calculateDistanceFromWebcam} from './app1';
import  {useRef, useEffect, useState} from 'react';
import Webcam from "react-webcam";

function Export() {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const [faceLandmarker, setFaceLandmarker] = useState<vision.FaceLandmarker | null>(null);
    const [distance, setDistance] = useState(null);

    useEffect(() => {
        async function initFaceLandmarker() {
            const filesetResolver = await vision.FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
            );
            const flm = await vision.FaceLandmarker.createFromOptions(filesetResolver, {
                baseOptions: {
                    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
                    delegate: "GPU"
                },
                outputFaceBlendshapes: true,
                runningMode: "VIDEO",
                numFaces: 1
            });
            setFaceLandmarker(flm);
        }

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            initFaceLandmarker();
        }
    }, []);
    useEffect(() => {
        let animationFrameId;

        const predict = async () => {
            if (!webcamRef.current || !canvasRef.current || !faceLandmarker) return;
            const video = webcamRef.current.video;
            const canvas = canvasRef.current;
            const canvasCtx = canvas.getContext("2d");
            const processFrame = async () => {
                if (video.readyState === 4) {
                    // Set canvas size to match video
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
    
                    // Detect face landmarks
                    const results = await faceLandmarker.detectForVideo(video, performance.now());
    
                    // Clear canvas and draw detected landmarks
                    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
                    if (results.faceLandmarks) {
                        for (const landmarks of results.faceLandmarks) {
                            try {
                                const pointLeft = { x: landmarks[468].x, y: landmarks[468].y }; // Left eye keypoint
                                const pointRight = { x: landmarks[473].x, y: landmarks[473].y }; // Right eye keypoint
                            
                                    const webcamFOV = 60;
                                    const knownPupillaryDistanceMm = 63;
                                    const pixelDistanceBetweenEyes = calculatePixelDistance(
                                    pointLeft.x, pointLeft.y,
                                    pointRight.x, pointRight.y
                                    );
                                  //         const focalLength = calculateFocalLength(pixelDistanceBetweenEyes, knownDistanceMm, knownWidthMm);
                                  // console.log(`Focal Length: ${focalLength.toFixed(2)} pixels`);
                            
                                    const distanceFromWebcamMm = calculateDistanceFromWebcam(
                                      focalLengthPixels,
                                      pixelDistanceBetweenEyes,
                                      knownWidthMm
                                    );
                                            // Convert the distance to inches
                                    const distanceFromWebcamInches = distanceFromWebcamMm / 25.4;
                                    canvasCtx.font = '18px Arial';
                                    canvasCtx.fillStyle = 'yellow';
                                      canvasCtx.save(); // Save the current state
                              canvasCtx.scale(-1, 1); // Flip the context horizontally
                                          canvasCtx.translate(-canvasElement.width, 0); // Translate the canvas context
                            
                                    canvasCtx.clearRect(0, 0, 200, 50); // Adjust the rectangle size and position as needed
                                    canvasCtx.fillText(`Distance: ${distanceFromWebcamInches.toFixed(2)} inches`, 10, 30);
                              canvasCtx.restore();
                            
                                    // Log the distance to the console or display it on the page in inches
                                            console.log(
                                      `Distance from webcam: ${distanceFromWebcamInches.toFixed(2)} inches`
                                    );
                                    setDistance(distanceFromWebcamInches);
                                    animationFrameId = requestAnimationFrame(processFrame);

                                  } catch (error) {
                                    console.error("error calculating distance: ", error);
                                  }
                                }
                              };
    
            processFrame();
        };
    
        predict();
    
        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [faceLandmarker]);



    return (
        <div className="App">
          <header className="App-header">
            <Webcam
             ref={webcamRef}
             style={{
               position: "absolute",
               marginLeft: "auto",
               marginRight: "auto",
               top:100,
               left:0,
               right:80,
               textAlign: "center",
               zIndex:9,
               width:640,
               height:480,
            }}
             />
    
            <canvas
             ref={canvasRef}
             style={{
              position: "absolute",
              marginLeft: "auto",
              marginRight: "auto",
              top:100,
              left:0,
              right:80,
              textAlign: "center",
              zIndex:9,
              width:640,
              height:480,
           }}
            />
           {distance && <p>Distance: {distance.toFixed(2)} inches</p>}

          </header>
        </div>
      );
    
   }

export default Export;
