import Phaser from "phaser";
import GameScene from "./gameScene.js";
import CoverScene from "./coverScene.js";
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
initAudio(() => {
  // 发出一个“玩家喷火”的全局事件，让游戏场景来处理逻辑
  window.dispatchEvent(new CustomEvent("player:shout"));
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
    
  }

  update() {
    
  }
}

// --------------------
// Phaser 配置
// --------------------
const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: 'gameContainer',  // <--- 指定容器
  physics: {
    default: 'arcade',
  },
  scene: [CoverScene, GameScene],
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

new Phaser.Game(config);
