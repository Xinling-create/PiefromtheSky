import Phaser from "phaser";

export default class HighBird extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "highbird");
    this.setScale(0.1); // 

    scene.add.existing(this);
    scene.physics.add.existing(this, false); // false 保证动态体

    // 延迟设置速度，确保 body 已初始化
    this.scene.time.addEvent({
      delay: 0,
      callback: () => {
        /** @type {Phaser.Physics.Arcade.Body} */
        const body = this.body;
        if (body && 'setVelocityX' in body) {
          body.setVelocityX(-200); // 向左飞
          body.allowGravity = false;
        }
      }
    });

    this.setScale(0.5);

    // 每只鸟有一定几率掉屎
    this.poopTimer = scene.time.addEvent({
      delay: 1000,
      callback: () => {
        if (Phaser.Math.Between(0, 100) < 30) { // 30% 概率掉屎
          this.dropPoop();
        }
      },
      loop: true
    });
  }

  dropPoop() {
    const scene = this.scene;
    if (!scene || !scene.physics) return;
    const poop = scene.physics.add.sprite(this.x, this.y, "poop");
    poop.setScale(0.3);
    poop.isBeingEaten = false;

    if (!scene.grossGroup) {
      scene.grossGroup = scene.add.group();
    }
    scene.grossGroup.add(poop);

    // 延迟设置物理速度
    scene.time.addEvent({
      delay: 0,
      callback: () => {
        /** @type {Phaser.Physics.Arcade.Body} */
        const body = poop.body;
        if (body && 'setVelocityY' in body) {
          body.setVelocityY(200); // 向下掉
          body.allowGravity = false;
        }
      }
    });
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    if (this.x < 0) {
      this.destroy();
    }
  }
}
