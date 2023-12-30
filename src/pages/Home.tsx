import {
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";

import React from "react";
import IonIcon from "@reacticons/ionicons";
import "./Home.css";
import WelcomePage from "../components/Welcome/WelcomePage";
import Header from "../components/Header/Header";
import { useHistory } from "react-router";
import Button from "../components/Button/Button";
import Frame from "../components/Frame";

const Home: React.FC = () => {
  const history = useHistory();

  const goToTermsPage = () => {
    history.push("./Terms");
  };

  return (
    <IonPage>
      {/* <Header headerText="Vision Test" /> */}
      <IonContent className="ion-padding" scrollY={false}>

        <h1 className="welcome-title">Welcome to the Vision AI App</h1>

        <p className="app-description">
          An Artificial Intelligence Based Near Vision Tester. <br/> 
          Providing accurate and reliable at home vision testing.<br/>
          <br/> 
          Camera and microphone access required for testing.<br/> 
          Personal data is never collected nor stored.
        </p>
        <Button buttonText="Continue" onClickAction={goToTermsPage} />
      </IonContent>
    </IonPage>
  );
};

export default Home;
