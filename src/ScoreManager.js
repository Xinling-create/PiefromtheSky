export default class ScoreManager {
  constructor(scene, startScore = 10, targetScore = 50) {
    this.scene = scene;
    this.score = startScore;
    this.targetScore = targetScore;

    this.padding = 30; // 右上角边距
    // 创建总分文字
    this.scoreText = this.scene.add.text(0, 0, `Score: ${this.score}`, {
      fontSize: '32px',
      color: 'rgba(80, 159, 80, 1)', // 绿色
      backgroundColor: null
    }).setOrigin(0.5).setDepth(100);

    // 初始放置到右上角
    this.updateScoreTextPosition();

    this.onWinCallback = null;
    this.onLoseCallback = null;
  }

  /** 更新总分显示，并保持右上角对齐 */
  updateScoreTextPosition() {
    this.scoreText.setX(this.scene.sys.canvas.width - this.scoreText.width - this.padding);
    this.scoreText.setY(this.padding);
  }

  addScore(value, cat) {
    if (value === 0) return; // 不显示 0 分

    this.score += value;
    if (this.score < 0) this.score = 0;
    this.scoreText.setText(`Score: ${this.score}`);

    // 显示浮动文字
    if (cat) this.showFloatingText(cat, value);

    if (this.score >= this.targetScore) this.onWinCallback?.();
    if (this.score <= 0) this.onLoseCallback?.();
  }

  showFloatingText(cat, value) {
    const sign = value > 0 ? '+' : '';
    const color = value > 0 ? '#0f0' : '#f00';

    const text = this.scene.add.text(cat.x, cat.y - 50, `${sign}${value}`, {
      fontSize: '28px',
      color: color,
      fontStyle: 'bold'
    });

    text.setOrigin(0.5);

    this.scene.tweens.add({
      targets: text,
      y: cat.y - 100,
      alpha: 0,
      duration: 800,
      ease: 'Cubic.easeOut',
      onComplete: () => text.destroy()
    });
  }

  onWin(callback) { this.onWinCallback = callback; }
  onLose(callback) { this.onLoseCallback = callback; }
}
