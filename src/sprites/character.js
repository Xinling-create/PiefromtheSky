import { faceData } from "../main.js";

export default class Character extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "char_close"); // 初始贴图
    const { width, height } = scene.sys.game.config;
    const targetHeight = height * 0.5; // 人物占屏幕高度的 20%
    const scale = targetHeight / this.height;
    this.setScale(scale); // 
  }

  update() {
    // 根据嘴巴状态切换贴图
    if (faceData.mouthOpen) {
      this.setTexture("char_open"); // 嘴巴张开
    } else {
      this.setTexture("char_close"); // 嘴巴闭上
    }

    // 根据鼻子位置移动角色
    if (faceData.noseX > 0) {
      const targetX = (1-faceData.noseX) * this.scene.sys.game.config.width;
      this.x = targetX;
    }
  }
}
