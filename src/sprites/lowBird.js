import Phaser from "phaser";

export default class LowBird extends Phaser.Physics.Arcade.Sprite {
  isRoasted = false;
  destroyed = false;

  constructor(scene, x, y) {
    super(scene, x, y, "lowbird");

    scene.add.existing(this);
    scene.physics.add.existing(this, false); // false 保证动态体

    // 强制类型为动态体
    /** @type {Phaser.Physics.Arcade.Body} */
    this.scene.time.addEvent({
        delay: 0,
        callback: () => {
            const body = this.body;
            if (body && 'setVelocityX' in body) {
            body.setVelocityX(-160);
            body.allowGravity = false;
            }
        }
    });

    this.setDepth(5);
  }

  roast(onEaten) {
    if (this.isRoasted || this.destroyed) return;
    this.isRoasted = true;

    this.setTexture("roastbird");
    this.setScale(0.5);

    /** @type {Phaser.Physics.Arcade.Body} */
    const body = this.body;
    body.setVelocity(0, 0);
    body.setVelocity(0, 0);

    const cat = this.scene.character;
    if (!cat) return;

    this.scene.tweens.add({
      targets: this,
      x: cat.x,
      y: cat.y,
      duration: 500,
      ease: "Quad.easeIn",
      onComplete: () => {
        this.destroyed = true;
        this.destroy();
        if (typeof onEaten === "function") onEaten();
      }
    });
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (this.isRoasted || this.destroyed) return;

    if (this.x < 0) {
      this.destroyed = true;
      this.destroy();
    }
  }
}
