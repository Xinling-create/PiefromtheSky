export async function initCamera(videoElement) {
  // 1️⃣ 检查浏览器支持
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert("Your browser does not support camera access. This game requires a camera to play.");
    return false;
  }

  // 2️⃣ 尝试获取摄像头
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
    videoElement.srcObject = stream;
    await videoElement.play();
  } catch (err) {
    console.error("Camera initialization failed:", err);
    if (err.name === "NotAllowedError") {
      alert("Camera access was denied. This game requires a device with a camera to play.");
    } else if (err.name === "NotFoundError") {
      alert("No camera found. This game requires a device with a camera to play.");
    } else {
      alert("Camera error. This game requires a device with a camera to play.");
    }
    return false; // 失败
  }
}

