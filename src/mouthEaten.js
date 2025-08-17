// mouthEat.js
import { faceData } from "./main.js";

/**
 * 小猫吃食物的统一处理函数
 * @param {Phaser.Scene} scene - 当前场景
 * @param {Phaser.GameObjects.Sprite} cat - 小猫精灵
 * @param {Phaser.GameObjects.Group} grossGroup - 恶心食物组
 * @param {Phaser.GameObjects.Group} specialGrossGroup - 极恶心食物组
 * @param {Phaser.GameObjects.Group} deliciousGroup - 美味食物组
 * @param {number} range - 吃东西的触发范围（像素）
 */
export function checkMouthEat(scene, cat, grossGroup, deliciousGroup, specialGrossGroup, range = 100) {
  // 只在嘴巴张开的情况下触发
  if (!faceData.mouthOpen) return;

  const allItems = [...grossGroup.getChildren(), ...deliciousGroup.getChildren(), ...specialGrossGroup.getChildren()];

  allItems.forEach((item) => {
    // 已经在 Tween 中的物体不重复触发
    if (item.isBeingEaten) return;

    // 限定范围触发：以猫为中心的范围
    const dx = item.x - cat.x;
    const dy = item.y - cat.y;
    if (dx < 0) return;
    if (Math.sqrt(dx * dx + dy * dy) > range) return;

    item.isBeingEaten = true;

    // 停止物理运动
    /** @type {Phaser.Physics.Arcade.Body} */
    const body = item.body;
    if (body) {
      body.setVelocity(0, 0);
      body.allowGravity = false;
    }

    // Tween 飞进猫嘴
    scene.tweens.add({
      targets: item,
      x: cat.x,
      y: cat.y,
      duration: 500,
      ease: "Quad.easeIn",
      onComplete: () => {

        // 根据 group 判断加分或扣分
        if (grossGroup.contains(item)) {
          scene.scoreManager.addScore(-1, cat)
          
        } else if (specialGrossGroup.contains(item)) {
          scene.scoreManager.addScore(-5, cat)
        } else if (deliciousGroup.contains(item)) {
          scene.scoreManager.addScore(+3, cat)
        } 

        item.destroy();
      }
    });
  });
}
