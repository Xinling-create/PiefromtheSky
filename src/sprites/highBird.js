import Phaser from "phaser";

export default class HighBird extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "highbird");
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

    // 每只鸟有一定几率掉屎
    this.poopTimer = scene.time.addEvent({
      delay: 1000,
      callback: () => {
        if (Phaser.Math.Between(0, 100) < 20) { // % 概率掉屎
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
    
    // 使用 displayWidth / 原始纹理宽度来计算实际 scale
    const birdScaleX = this.displayWidth / this.width;
    const birdScaleY = this.displayHeight / this.height;
    poop.setScale(birdScaleX * 0.5, birdScaleY * 0.5); // poop 相对 bird 的比例


    poop.isBeingEaten = false;

    // if (!scene.specialGrossGroup) {
    //   scene.specialGrossGroup = scene.add.group();
    // }
    // scene.specialGrossGroup.add(poop);
    if (!scene.deadlyPoopGroup) {
       scene.deadlyPoopGroup = scene.add.group();
     }
     scene.deadlyPoopGroup.add(poop);
    

    // 延迟设置物理速度
    scene.time.addEvent({
      delay: 0,
      callback: () => {
        /** @type {Phaser.Physics.Arcade.Body} */
        const body = poop.body;
        if (body && 'setVelocityY' in body) {
          body.setVelocityY(200); // 向下掉
          body.allowGravity = false;
          body.setSize(poop.width*0.28, poop.height*0.3); // 设置碰撞体大小
          body.setOffset(poop.width*0.25, poop.height*0.28);
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
