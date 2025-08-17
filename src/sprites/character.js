import { faceData } from "../main.js";
import { isFireCooldown } from "../audio.js";

export default class Character extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "char_close"); 
    // ✅ 给角色加物理体（Arcade Physics）
    scene.physics.add.existing(this);

    // ✅ 限制在世界范围内
    this.body.setCollideWorldBounds(true);

  }

  update() {
    // 根据嘴巴状态切换贴图
    if (isFireCooldown() && faceData.mouthOpen) {
      this.setTexture("char_fire"); // 喷火状态
    } else if (faceData.mouthOpen) {
      this.setTexture("char_open");
    } else {
      this.setTexture("char_close");
    }

    // 根据鼻子位置移动角色
    if (faceData.noseX > 0) {
      const targetX = (1-faceData.noseX) * this.scene.sys.game.config.width;
      this.x = targetX;
    }


  }
}
