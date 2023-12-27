import React, { useEffect, useState } from "react";
import { IonPage, IonButton, IonIcon, IonContent } from "@ionic/react";
import { FaceMesh } from "@mediapipe/face_mesh";

import { eyeOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom";

import "./Terms.css";
import PreTest from "../components/PreTest";
import "./Home.css";
import "./CameraPage.css";
import "../components//PreTest.css";

import Header from "../components/Header/Header";
import Button from "../components/Button/Button";
import { useLocation } from "react-router-dom";
const stopWebcam = () => {
  const streams = document.querySelectorAll('video').forEach((videoElement) => {
    if (videoElement.srcObject) {
      const tracks = (videoElement.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
    }
  });
};
interface LocationState {
  testMode?: string;
  // wearGlasses?: string;
  eyeToExamine?: string;
}

const CameraPage: React.FC = () => {
  const location = useLocation<LocationState>();
  const { testMode, eyeToExamine } = location.state || {};
  const history = useHistory();
useEffect(() => {
  // This will be called when the component unmounts
  return () => {
    stopWebcam();
  };
}, []);
  const continueToExam = () => {
    console.log("Test Mode:", testMode, "Eye to Examine:", eyeToExamine);
    stopWebcam();
    if (testMode === "Letters") {
      history.push("/LetterTest", { testMode, eyeToExamine });
    } else if (testMode === "Images") {
      history.push("/ShapeTest", { testMode, eyeToExamine });
    } else {
      console.error("Invalid test mode:", testMode);
    }
  };
  return (
    <IonPage>
      <Header headerText="Tap Video Output for Distance" />
      <IonContent fullscreen scrollY={false}>
        <PreTest />
        <div className="continue-button-div">
          <Button buttonText="Continue" onClickAction={continueToExam} />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default CameraPage;
