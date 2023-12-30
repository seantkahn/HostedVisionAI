import React, { useState, useEffect, useRef } from "react";
import { IonPage, IonContent, IonButton, IonIcon } from "@ionic/react";
import { eyeOutline } from "ionicons/icons";
import { Category, DrawingUtils, FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

import { Camera } from "@mediapipe/camera_utils";

import * as vision from "@mediapipe/tasks-vision";
import SampleTest from "../components/PreTest";
import { useHistory } from "react-router-dom";
import Header from "../components/Header/Header";
import Button from "../components/Button/Button";
import { useLocation } from "react-router-dom";
import "./Test.css"

interface LocationState {
  testMode?: string;
  // wearGlasses?: string;
  eyeToExamine?: string;
}

const Test: React.FC = () => {
  const location = useLocation<LocationState>();
  const { testMode, eyeToExamine } = location.state || {};
  const history = useHistory();

  const goToSampleTest = () => {
    history.push("/CameraPage", { testMode, eyeToExamine });
  };

  const webcamRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [faceLandmarker, setFaceLandmarker] = useState<any>(null);
  const [webcamRunning, setWebcamRunning] = useState(false);
  const knownDistanceInches = 12; // The known distance from the camera in inches
  const knownDistanceMm = knownDistanceInches * 25.4; // Convert inches to mm
  const knownWidthMm = 63; //mm
  const focalLengthPixels = 0.78;
  // Your calculated focal length in pixels
  // let lastVideoTime = -1;
  // let results = undefined;

  const video = webcamRef.current;
  const canvas = canvasRef.current;

  // Calculate the distance from the webcam to the face using the focal length
  function calculateDistanceFromWebcam(
    focalLengthPixels: number,
    pixelDistanceBetweenEyes: number,
    knownWidthMm: number
  ) {
    // Calculate the distance from the webcam to thsce face using the focal length
    return (focalLengthPixels * knownWidthMm) / pixelDistanceBetweenEyes;
  }

  // useEffect(() => {
  //   createFaceLandmarker();

  //   // The cleanup function will handle unmounting
  //   return () => {
  //     if (webcamRef.current && webcamRef.current.srcObject) {
  //       const mediaStream = webcamRef.current.srcObject as MediaStream;
  //       const tracks = mediaStream.getTracks();
  //       tracks.forEach((track) => track.stop());
  //     }
  //   };
  // }, []);

  const createFaceLandmarker = async () => {
    const filesetResolver = await vision.FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
    );
    const newFaceLandmarker = await vision.FaceLandmarker.createFromOptions(
      filesetResolver,
      {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "GPU",
        },
        // outputFaceBlendshapes: true,
        runningMode: "VIDEO",
        numFaces: 1,
      }
    );
    setFaceLandmarker(newFaceLandmarker);
  };

  const enableCam = () => {
    if (!faceLandmarker) {
      console.log("Wait! faceLandmarker not loaded yet.");
      return;
    }
    setWebcamRunning(!webcamRunning);

    if (!webcamRunning) {
      const constraints = { video: true };
      navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        const video = webcamRef.current;
        if (video) {
          video.srcObject = stream;
          video.addEventListener("loadeddata", predictWebcam);
        }
      });
    } else {
      // Stop the webcam stream
      if (
        webcamRef.current &&
        webcamRef.current.srcObject instanceof MediaStream
      ) {
        const mediaStream = webcamRef.current.srcObject;
        const tracks = mediaStream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    }
  };


  const predictWebcam = async () => {
    const video = webcamRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      console.error("Video or canvas element is not available");
      return;
    }

    const canvasCtx = canvas.getContext("2d");
    if (!canvasCtx) {
      console.error("Unable to get canvas context");
      return;
    }

    if (webcamRunning) {
      requestAnimationFrame(predictWebcam);
    }
  };

  return (
    //fix CSS by giving ionPage a class name.  Like the commented out line below
    // <IonPage id="container">

    <IonPage>
      <Header headerText="Instructions"/>
      
      <IonContent fullscreen className="ion-padding" scrollY={false}>
        <div className="instructions-container">
          <p className="instructions-text">
            To begin the test, position your face in front of your webcam. For accurate distance measurements, tap or click the screen once, or twice for active calculations. 
            <br />
            Maintain a distance of approximately 14 inches from the camera to ensure the test conditions are correct.
            <br />
            Please grant camera access when requested. Ensure your face is level with the camera and the room is well-lit. 
            <br />
            If you're testing a single eye, cover the other. If you normally wear glasses, please keep them on to check if your prescription needs updating.
            <br />
            During the test, you'll see groups of five letters or symbols. Read each out loud and wait for it to turn green. 
            <br />
            Conclude the test if the letters or images become unclear, or if you cannot identify at least three out of five consistently.
          </p>
        </div>
        <Button buttonText="Continue" onClickAction={goToSampleTest}/>
       
        <div id="liveView" className="videoView">
          {/* <IonButton id="webcamButton" onClick={enableCam}>
            {webcamRunning ? "DISABLE WEBCAM" : "ENABLE WEBCAM"}
          </IonButton> */}
          <div style={{ position: "relative" }}>
            <video
              ref={webcamRef}
              style={{ position: "absolute" }}
              autoPlay
              playsInline
            ></video>
            <canvas
              ref={canvasRef}
              className="output_canvas"
              style={{ position: "absolute", left: 0, top: 0 }}
            ></canvas>
          </div>
        </div>
        
      </IonContent>
    </IonPage>
  );
};

export default Test;
