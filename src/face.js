import { FilesetResolver, FaceLandmarker } from "@mediapipe/tasks-vision";

let faceLandmarker;

export async function initFaceLandmarker() {
  const fileset = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );
  faceLandmarker = await FaceLandmarker.createFromOptions(fileset, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-assets/face_landmarker.task`
    },
    runningMode: "VIDEO",
    numFaces: 1
  });
}

export function detectFace(video) {
  if (!faceLandmarker) return null;
  const results = faceLandmarker.detectForVideo(video, performance.now());
  if (results.faceLandmarks.length > 0) {
    const lm = results.faceLandmarks[0];
    const mouthOpen = lm[14].y - lm[13].y; // upper lip - lower lip
    const noseX = lm[1].x; // nose
    return { mouthOpen, noseX };
  }
  return null;
}
