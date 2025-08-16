import Character from "./sprites/character.js";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  preload() {
    // 加载图片资源
    this.load.image("bg", "assets/background.png");
    this.load.image("char_close", "assets/character_close.png");
    this.load.image("char_open", "assets/character_open.png");
  }

  create() {
    // 背景
    this.bg = this.add.image(0, 0, "bg").setOrigin(0, 0); // 左上角对齐
    this.bg.displayWidth = this.sys.game.config.width;
    this.bg.displayHeight = this.sys.game.config.height;

    this.scale.on('resize', (gameSize) => {
      const targetHeight = height * 0.5;
      const scale = targetHeight / this.character.height;
      this.character.setScale(scale);
      this.bg.displayWidth = gameSize.width;
      this.bg.displayHeight = gameSize.height;
    });
    // 创建角色

    const { width, height } = this.sys.game.config;
    this.character = new Character(this, width/2, height*0.7);
    this.add.existing(this.character);
  }

  update() {
    this.character.update();
  }
}
