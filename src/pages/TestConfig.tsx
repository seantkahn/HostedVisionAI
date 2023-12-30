import React, { useState } from "react";
import {
  IonPage,
  IonContent,
  IonDatetime,
  IonItem,
  IonLabel,
  IonInput,
  IonModal,
  IonButton,
  IonToggle,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonSelect,
  IonSelectOption,
  IonAlert,
} from "@ionic/react";
import { eyeOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import Header from "../components/Header/Header";
import Button from "../components/Button/Button";
import Results from "./Results";
import "./TestConfig.css";
import CardSelection from '../components/CardSelection/CardSelection'; 
const TestConfig: React.FC = () => {
  const history = useHistory();
  const [showDatePicker, setShowDatePicker] = useState(false); 
  const [testMode, setTestMode] = useState("");
  // const [wearGlasses, setWearGlasses] = useState<string>("");
  const [eyeToExamine, setEyeToExamine] = useState<string>("");
  const [showAlert, setShowAlert] = useState(false);

  const continueToPreTest = () => {
    if (!testMode || !eyeToExamine) {
      setShowAlert(true);
    } else {
      history.push("/Test", { testMode, eyeToExamine });
    }
  };

  return (
    //fix CSS by giving ionPage a class name.  Like the commented out line below
    // <IonPage id="container">

    <IonPage>
      <Header headerText="Personal Configuration"/>
      <IonContent scrollY={false}>


        <div className="selection-section">
        <h1 className="question">Letters or Images?</h1>
        <div className="selection-card-container">
          <CardSelection title="Letters" selected={testMode === "Letters"} onSelect={setTestMode} />
          <CardSelection title="Images" selected={testMode === "Images"} onSelect={setTestMode} />
        </div>
      </div>

      <div className="selection-section">
        <h1 className="question">Which eye will you be testing?</h1>
        <div className="selection-card-container">
          <CardSelection title="Left Eye" selected={eyeToExamine === "Left Eye"} onSelect={setEyeToExamine} />
          <CardSelection title="Right Eye" selected={eyeToExamine === "Right Eye"} onSelect={setEyeToExamine} />
          <CardSelection title="Both" selected={eyeToExamine === "Both"} onSelect={setEyeToExamine} />
        </div>
      </div>
      <div className="padding"></div>
        <Button buttonText="Continue" onClickAction={continueToPreTest} />
        {/* <IonModal
          isOpen={showDatePicker}
          onDidDismiss={() => setShowDatePicker(false)}
        >
          <IonDatetime
            presentation="year"
            onIonChange={handleBirthYearChange}
          />
          <IonButton onClick={() => setShowDatePicker(false)}>Done</IonButton>
        </IonModal> */}
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Incomplete Information"
          message="Please fill in all the fields before continuing."
          buttons={["OK"]}
        />
      </IonContent>
      
    </IonPage>
  );
};

export default TestConfig;
