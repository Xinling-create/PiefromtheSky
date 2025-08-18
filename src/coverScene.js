export default class CoverScene extends Phaser.Scene {
  constructor() {
    super("CoverScene");
  }

  preload() {
    // 背景和按钮
    this.load.image("coverImg", "assets/cover.png");
    this.load.image("startBtn", "assets/start.png");
    this.load.audio("bgm2", "assets/bgm2.m4a");
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    // 黑色背景填充
    this.add.rectangle(0, 0, width, height, 0x000000).setOrigin(0, 0);

    // 背景
    this.bg = this.add.image(0, 0, "coverImg").setOrigin(0, 0);
    
    // 按比例缩放背景
    this.resizeBackground();

    // 按钮（按背景比例缩放）
    this.startBtn = this.add.image(width / 2, height * 0.75, "startBtn");
    this.resizeButton();

    // 音乐
    this.bgm2 = this.sound.add("bgm2", { loop: true, volume: 0.5 });
    this.bgm2.play();

    // 点击按钮开始游戏
    this.startBtn.setInteractive({ cursor: 'pointer' }).on("pointerdown", () => {
      // 隐藏封面并切换场景
      this.bgm2.stop();
      this.scene.start("GameScene");
    });

    // 窗口大小变化时自动缩放背景和按钮
    this.scale.on('resize', (gameSize) => {
      this.bg.displayWidth = gameSize.width;
      this.bg.displayHeight = gameSize.height;
      this.resizeButton();
    });
  }

    // 保持长宽比缩放背景
    resizeBackground() {
    const canvasWidth = this.scale.width;
    const canvasHeight = this.scale.height;

    const bgWidth = this.bg.width;
    const bgHeight = this.bg.height;

    // 计算缩放比例
    const scale = Math.min(canvasWidth / bgWidth, canvasHeight / bgHeight);
    this.bg.setScale(scale);

    // 居中显示
    this.bg.x = (canvasWidth - bgWidth * scale) / 2;
    this.bg.y = (canvasHeight - bgHeight * scale) / 2;
    }

  resizeButton() {
    const canvasWidth = this.scale.width;
    const canvasHeight = this.scale.height;

    // 按背景宽度比例设置按钮宽度
    const targetWidth = canvasWidth * 0.2;  // 20% 背景宽度
    const scale = targetWidth / this.startBtn.width;
    this.startBtn.setScale(scale);

    // 按背景高度比例设置按钮位置
    this.startBtn.x = canvasWidth / 2;
    this.startBtn.y = canvasHeight * 0.75;
  }
}
