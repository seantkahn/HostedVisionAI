import * as vision from '@mediapipe/tasks-vision';
const { FaceLandmarker, FilesetResolver, DrawingUtils } = vision;
const demosSection = document.getElementById("demos");
const videoBlendShapes = document.getElementById("video-blend-shapes");

let faceLandmarker: { setOptions: (arg0: { runningMode: "VIDEO"; }) => any; detectForVideo: (arg0: HTMLVideoElement, arg1: number) => any; };
let runningMode: "IMAGE" | "VIDEO" = "VIDEO";
let enableWebcamButton: HTMLButtonElement;
let webcamRunning: Boolean = false;
const videoWidth = 480;

const knownDistanceInches = 12; // The known distance from the camera in inches
const knownDistanceMm = knownDistanceInches * 25.4; // Convert inches to mm
const knownWidthMm = 63;//mm
const focalLengthPixels = 0.78; // Your calculated focal length in pixels

export function calculateDistanceFromWebcam(focalLengthPixels: number, pixelDistanceBetweenEyes: number, knownWidthMm: number) {
  // Calculate the distance from the webcam to thsce face using the focal length
  return (focalLengthPixels * knownWidthMm) / pixelDistanceBetweenEyes;
}

//use function below to calibrate devices focal length, use that value to get distance from function above

// function calculateFocalLength(pixelDistance, knownDistanceMm, knownWidthMm) {
//   return (pixelDistance * knownDistanceMm) / knownWidthMm;
// }

// Before we can use FaceLandmarker class we must wait for it to finish
// loading. Machine Learning models can be large and take a moment to
// get everything needed to run.
export async function createFaceLandmarker() {
  const filesetResolver = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
  );
  faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
      delegate: "GPU"
    },
    outputFaceBlendshapes: true,
    runningMode,
    refineLandmarks: true,
    numFaces: 1
  });
  return faceLandmarker;

  demosSection.classList.remove("invisible");
  return faceLandmarker;
}
createFaceLandmarker();


// Demo 2: Continuously grab image from webcam stream and detect it.


const video = document.getElementById("webcam") as HTMLVideoElement;
const canvasElement = document.getElementById(
  "output_canvas"
) as HTMLCanvasElement;

const canvasCtx = canvasElement.getContext("2d");

// Check if webcam access is supported.
export function hasGetUserMedia() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

// If webcam supported, add event listener to button for when user
// wants to activate it.
if (hasGetUserMedia()) {
  enableWebcamButton = document.getElementById(
    "webcamButton"
  ) as HTMLButtonElement;
  enableWebcamButton.addEventListener("click", enableCam);
} else {
  console.warn("getUserMedia() is not supported by your browser");
}

// Enable the live webcam view and start detection.
export function enableCam(event: any) {
  if (!faceLandmarker) {
    console.log("Wait! faceLandmarker not loaded yet.");
    return;
  }
  if (webcamRunning === true) {
    webcamRunning = false;
    enableWebcamButton.innerText = "ENABLE Calculation";
  } else {
    webcamRunning = true;
    enableWebcamButton.innerText = "DISABLE Calculation";
  }
  // getUsermedia parameters.
  const constraints = {
    video: true
  };
  // Activate the webcam stream.
  navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    video.srcObject = stream;
    video.addEventListener("loadeddata", predictWebcam);
  });
}
let lastVideoTime = -1;
let results: { faceLandmarks: any; } | undefined = undefined;
const drawingUtils = new DrawingUtils(canvasCtx);


export function calculatePixelDistance(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// This function calculates the distance in mm based on the pixel distance and the known distance
export function calculateDistanceInMm(
  pixelDistance: number,
  knownDistanceInMm: number,
  referencePixelDistance: number
) {
  return (pixelDistance * knownDistanceInMm) / referencePixelDistance;
}
// This function calculates the distance of the eyes from the webcam
// It assumes that the knownDistanceInMm is the pupillary distance
export function calculateEyeDistanceFromWebcam(
  pixelDistanceBetweenEyes: number,
  knownDistanceInMm: number,
  videoWidth: number,
  FOV: number
) {
  // Calculate the number of pixels per millimeter
  const pixelsPerMm = pixelDistanceBetweenEyes / knownDistanceInMm;

  // Assuming the video width represents the full FOV, calculate the FOV in mm
  const fovWidthMm = videoWidth / pixelsPerMm;

  // Use trigonometry to estimate the distance from the camera to the face
  // This is a simplification and assumes a flat plane and central positioning
  const distanceFromCameraMm =
    fovWidthMm / 2 / Math.tan((FOV / 2) * (Math.PI / 180));

  return distanceFromCameraMm;
}

export async function predictWebcam() {
  const maxWidth = Math.min(window.innerWidth, 640);
  const ratio = video.videoHeight / video.videoWidth;
  
  // Set the video and canvas width based on the maximum width or the width of the screen
  video.style.width = `${maxWidth}px`;
  video.style.height = `${maxWidth * ratio}px`;
  canvasElement.style.width = `${maxWidth}px`;
  canvasElement.style.height = `${maxWidth * ratio}px`;
  
  // Set the actual width and height properties on the canvas element
  canvasElement.width = maxWidth;
  canvasElement.height = maxWidth * ratio;
  // Now let's start detecting the stream.
  if (runningMode === "IMAGE") {
    runningMode = "VIDEO";
    await faceLandmarker.setOptions({ runningMode: runningMode });
  }
  let startTimeMs = performance.now();
  if (lastVideoTime !== video.currentTime) {
    lastVideoTime = video.currentTime;
    results = await faceLandmarker.detectForVideo(video, startTimeMs);
  }
  if (results.faceLandmarks) {
    for (const landmarks of results.faceLandmarks) {
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_TESSELATION,
        { color: "#C0C0C070", lineWidth: 1 }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
        { color: "#E0E0E0" }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
        { color: "#FF3030" }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
        { color: "#30FF30" }
      );

      //       Approximate the FOV of the webcam. This value may need to be adjusted or measured for accuracy.
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

      } catch (error) {
        console.error("error calculating distance: ", error);
      }
    }
  }
let resizeTimer: string | number | NodeJS.Timeout | undefined;
window.addEventListener('resize', function() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(function() {
    // This code will only run after the user has finished resizing the window
    predictWebcam();
  }, 250);
});


  // Call this function again to keep predicting when the browser is ready.
  if (webcamRunning === true) {
    window.requestAnimationFrame(predictWebcam);
  }
}