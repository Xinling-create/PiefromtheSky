export async function initCamera(videoElement) {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: 640, height: 480 }
  });
  videoElement.srcObject = stream;
  await videoElement.play();
}
