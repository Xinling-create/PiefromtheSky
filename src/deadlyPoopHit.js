// deadlyPoopHit.js
/**
 * 检查 deadlyPoop 是否砸中小猫
 * @param {Phaser.Scene} scene - 当前场景
 * @param {Phaser.GameObjects.Sprite} cat - 小猫精灵
 * @param {Phaser.GameObjects.Group} deadlyPoopGroup - 致死 poop 组
 */
export function checkDeadlyPoopHit(scene, cat, deadlyPoopGroup) {
  scene.physics.add.overlap(cat, deadlyPoopGroup, (catSprite, item) => {
    // 防止重复触发
    if (item.hasHitCat) return;
    item.hasHitCat = true;

    // 停止物理
    /** @type {Phaser.Physics.Arcade.Body} */
    const body = item.body;
    if (body) {
      body.setVelocity(0, 0);
      body.allowGravity = false;
    }

    // 立刻 Game Over
    scene.scoreManager.triggerLose?.();
    console.log("💩 Deadly poop hit cat! Game Over!");

    item.destroy();
  });
}
