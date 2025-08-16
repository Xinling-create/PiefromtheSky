import Phaser from "phaser";
import GameScene from "./gameScene.js";
import { initCamera } from "./camera.js";
import { initFaceLandmarker, detectFace } from "./face.js";
import { initAudio } from "./audio.js";

// --------------------
// 创建 video 元素
// --------------------
const video = document.createElement('video');
video.autoplay = true;
video.playsInline = true;
video.style.position = "absolute";
video.style.top = "0px";
video.style.right = "0px";
video.style.width = "320px";


// --------------------
// 初始化摄像头、人脸检测、音频
// --------------------
await initCamera(video);
await initFaceLandmarker();

// 全局变量存储检测结果
export let faceData = {
  mouthOpen: false,
  mouthValue: 0,
  noseX: 0
};
// 人脸检测异步循环
async function faceLoop() {
  try {
    const results = detectFace(video);
    if (results != null) {
      faceData.mouthOpen = results.mouthOpen > 0.02; // 如果嘴巴开合大于2%则认为是张开状态
      faceData.noseX = results.noseX;
    } else {
      faceData.mouthOpen = false;
      faceData.mouthValue = 0;
      faceData.noseX = 0;
    }
  } catch (e) {
    console.error("Face detection error:", e);
  }
  requestAnimationFrame(faceLoop);
}
faceLoop();

// 音量检测
initAudio((volume) => {
  const percent = Math.min(volume * 200, 100);
  if (volume > 45) {
    console.log("🔥 喊声触发喷火！");
  } 
});

// --------------------
// Phaser 场景
// --------------------
class DebugScene extends Phaser.Scene {
  constructor() {
    super("DebugScene");
  }

  preload() {}

  create() {
    debugText.innerText = "等待检测中...";
  }

  update() {
    // 显示嘴巴开合状态
    debugText.innerText = `嘴巴开: ${faceData.mouthOpen} (${faceData.mouthValue.toFixed(2)}) | 鼻X: ${faceData.noseX.toFixed(3)}`;
  }
}

// --------------------
// Phaser 配置
// --------------------
const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  physics: { default: 'arcade' },
  scene: [GameScene],
  scale: {
    mode: Phaser.Scale.RESIZE,  // Phaser 会自动调整画布大小
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

new Phaser.Game(config);
