import Character from "./sprites/character.js";
import LowBird from "./sprites/lowBird.js";
import highBird from "./sprites/highBird.js";
import { checkMouthEat } from "./mouthEaten.js";
import { checkDeadlyPoopHit } from "./deadlyPoopHit.js";
import ScoreManager from './ScoreManager.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  preload() {
    // 加载图片资源
    this.load.image("bg", "assets/background.png");
    this.load.image("char_close", "assets/character_close.png");
    this.load.image("char_open", "assets/character_open.png");
    this.load.image("char_fire", "assets/fire.png");
    this.load.image("lowbird", "assets/rare.png");
    this.load.image("roastbird", "assets/cooked.png");
    this.load.image("highbird", "assets/rare.png");
    this.load.image("poop", "assets/shit.png");
    this.load.image("d1", "assets/Spanakopita.png");
    this.load.image("d2", "assets/Borek.png");
    this.load.image("d3", "assets/crepe.png");
    this.load.image("d4", "assets/Empanada.png");
    this.load.image("d5", "assets/Pirozhki.png");
    this.load.image("d6", "assets/Pizza.png");
    this.load.image("d7", "assets/Samosa.png");
    this.load.image("d8", "assets/Scallion.png");
    this.load.image("d9", "assets/Taco.png");
    this.load.image("d10", "assets/Teriyaki.png");
    this.load.image("g1", "assets/capsule.png");
  }

  create() {
    this.scoreManager = new ScoreManager(this, 10, 50);

    this.scoreManager.onWin(() => {
      console.log("You Win!");
      // 停止游戏、显示胜利界面
      this.scene.pause(); 
      this.showEndText('You Win!');
    });

    this.scoreManager.onLose(() => {
      console.log("You Lose!");
      // 停止游戏、显示失败界面
      this.scene.pause(); 
      this.showEndText('You Lose!');
    });

    // 背景
    this.bg = this.add.image(0, 0, "bg").setOrigin(0, 0); // 左上角对齐
    this.bg.displayWidth = this.sys.game.config.width;
    this.bg.displayHeight = this.sys.game.config.height;

    // 创建角色
    const width = this.sys.scale.width;
    const height = this.sys.scale.height;
    this.character = new Character(this, width/2, height*0.7);

    // 初始化缩放和位置
    this.resizeCharacter();
    this.add.existing(this.character);
    this.physics.add.existing(this.character);  // ✅ 添加 physics body
    this.character.body.setCollideWorldBounds(true);
    // 设置 body 大小和偏移为 sprite 自身尺寸
    this.character.body.setSize(this.character.width*0.28, this.character.height*0.4);
    this.character.body.setOffset(this.character.width*0.43, this.character.height*0.38);

    this.scale.on('resize', (gameSize) => {
      this.bg.displayWidth = gameSize.width;
      this.bg.displayHeight = gameSize.height;
    });

    this.grossGroup = this.add.group();
    this.specialGrossGroup = this.add.group();
    this.deliciousGroup = this.add.group();
    //被砸中就会死
    this.deadlyPoopGroup = this.add.group();

    // -------------------
    // 随机生成食物配置
    // -------------------
    this.spawnConfig = {
      baseDelay: 10000,      // 初始间隔
      minDelay: 5000,        // 最小间隔
      delayDecay: 0.05,     // 每轮递减
      grossRatio: 0.2,      // 初始不可吃比例
      grossRatioIncrease: 0.01,
      maxGrossRatio: 0.4,
      maxSpawnPerRound: 1
    };

    // -------------------
    // 随机生成初始食物
    // -------------------
    this.spawnRandomFood();


    //lowbird group
    this.lowBirds = this.physics.add.group();
    // 随机下次生成时间（5000~8000 ms）
    const nextDelay2 = Phaser.Math.Between(8000, 15000);
    this.time.addEvent({
      // 每隔一段时间生成一只低空飞过的鸟，具体时间待设置
      delay: nextDelay2,
      loop: true,
      callback: () => {
        const y = height * 0.55; // 低空飞过
        const bird = new LowBird(this, width, y);
        this.resize(0.6, 1, 0.55, bird);
        if (bird.body) {
          bird.body.setSize(bird.width, bird.height);
          bird.body.setOffset(0, 0);
      }
        this.lowBirds.add(bird);
      }
    });

    // 监听“玩家喷火”事件
    this._onShout = () => this.triggerFire();
    window.addEventListener("player:shout", this._onShout);

    // 场景卸载时移除监听，防止内存泄漏
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener("player:shout", this._onShout);
    });
    this.events.once(Phaser.Scenes.Events.DESTROY, () => {
      window.removeEventListener("player:shout", this._onShout);
    });

    //highbird group
    this.highBirds = this.physics.add.group();
     // 随机下次生成时间（3000~5000 ms）
    const nextDelay1 = Phaser.Math.Between(6000, 10000);
    // 每隔 3 秒生成一只高空鸟
    this.time.addEvent({
      delay: nextDelay1,
      callback: () => {
        const y = height * 0.2; // 低空飞过
        const bird = new highBird(this, width, y);
        this.resize(0.5, 1, 0.2, bird);
        if (bird.body) {
          bird.body.setSize(bird.width, bird.height);
          bird.body.setOffset(0, 0);
      }
        this.highBirds.add(bird);
      },
      loop: true
    });

        // 监听窗口变化
    window.addEventListener('resize', () => {
      this.resizeCharacter();
      this.scoreManager.updateScoreTextPosition();
    });
  }

  resize(sizeRate, xRate, yRate, item) {
    let canvasWidth = this.sys.canvas.width;
    let canvasHeight = this.sys.canvas.height;

    let targetHeight = canvasHeight * sizeRate;
    let scale = targetHeight / item.height;
    if (scale > 1) scale = 1; // 最大缩放比例为 1
    item.setScale(scale);
    item.x = canvasWidth * xRate;   
    item.y = canvasHeight * yRate;      // 底部贴合
  }

  resizeCharacter() {
    this.resize(0.6, 0.5, 0.7, this.character);
  }
  
  // 喷火时调用：只烤“靠近小猫”的低空鸟
  triggerFire() {
    const cat = this.character;
    if (!cat) return;

    const rangeX = cat.displayWidth * 0.6;   // 横向判定范围（可调）
    const rangeY = cat.displayHeight * 0.6;  // 纵向判定范围（可调）

    this.lowBirds.children.iterate(bird => {
      if (!bird || bird.destroyed || bird.isRoasted) return;

      const dx = Math.abs(bird.x - cat.x);
      const dy = Math.abs(bird.y - cat.y);

      if (dx <= rangeX && dy <= rangeY) {
        bird.roast(() => {
          this.scoreManager.addScore(+5, this.character)// 成功吃到烤鸟的回调（可选）：加分/粒子特效/音效等
          // 这里可以添加一些特效或音效
        });
      }
    });
  }

  // -------------------
  // 随机生成食物
  // -------------------
   spawnRandomFood() {
      const cfg = this.spawnConfig;
      const canvasWidth = this.sys.canvas.width;
      const canvasHeight = this.sys.canvas.height;

      const existingItems = [...this.deliciousGroup.getChildren(), ...this.grossGroup.getChildren(), ...this.specialGrossGroup.getChildren()];
      const existingXRates = existingItems.map(item => item.x / canvasWidth);

      const minSpacingRate = 0.05; // 最小水平间隔比例
      const newItems = [];
      const count = Phaser.Math.Between(1, cfg.maxSpawnPerRound);

      for (let i = 0; i < count; i++) {
        let xRate, yRate;
        let tries = 0;

        do {
          xRate = Phaser.Math.FloatBetween(0.05, 0.95); // x 在 0~1 之间，留边距
          yRate = Phaser.Math.FloatBetween(-0.05, 0.05); // 初始在画布上方稍微偏出屏幕
          tries++;
          if (tries > 100) break;
        } while (
          existingXRates.concat(newItems.map(i => i.xRate))
            .some(rate => Math.abs(rate - xRate) < minSpacingRate)
        );

        newItems.push({ xRate, yRate });

        const isGross = Math.random() < cfg.grossRatio;
        const texture = isGross
          ? Phaser.Utils.Array.GetRandom(["g1"])
          : Phaser.Utils.Array.GetRandom([
              "d1","d2","d3","d4","d5","d6","d7","d8","d9","d10"
            ]);

        // 传比例给 resize
        const item = isGross
          ? this.spawnGrossItem(xRate, yRate, texture)
          : this.spawnDeliciousItem(xRate, yRate, texture);
      }

      // 更新生成间隔和 gross 比例
      cfg.baseDelay = Math.max(cfg.minDelay, cfg.baseDelay * cfg.delayDecay);
      cfg.grossRatio = Math.min(cfg.maxGrossRatio, cfg.grossRatio + cfg.grossRatioIncrease);

      // 下一轮生成
      this.time.addEvent({
        delay: cfg.baseDelay,
        callback: () => this.spawnRandomFood()
      });
    }



  spawnGrossItem(x, y, texture) {
    const item = this.physics.add.sprite(x, y, texture);
    this.resize(0.3, x, y, item); 
    item.isBeingEaten = false;
    this.grossGroup.add(item);

    // 延迟设置物理速度
    this.time.addEvent({
      delay: 0,
      callback: () => {
        /** @type {Phaser.Physics.Arcade.Body} */
        const body = item.body;
        if (body && 'setVelocityY' in body) {
          body.setVelocityY(200);
          body.allowGravity = false;
        }
      }
    });

    return item;
  }

  spawnDeliciousItem(x, y, texture) {
    const item = this.physics.add.sprite(x, y, texture);
    this.resize(0.3, x, y, item); 
    item.isBeingEaten = false;
    this.deliciousGroup.add(item);

    // 延迟设置物理速度
    this.time.addEvent({
      delay: 0,
      callback: () => {
        /** @type {Phaser.Physics.Arcade.Body} */
        const body = item.body;
        if (body && 'setVelocityY' in body) {
          body.setVelocityY(200);
          body.allowGravity = false;
        }
      }
    });

    // 在 preUpdate 中检查是否落地
    item.preUpdate = function(time, delta) {
      if (this.isBeingEaten) return;

      if (this.y > this.scene.sys.canvas.height) {
        this.isBeingEaten = true; // 标记为已被吃
        this.body.setVelocity(0, 0); // 停止物理运动
        this.body.allowGravity = false; // 禁止重力

        // 通过 scene 访问 scoreManager，并传入小猫实例显示浮动文字
        if (this.scene.scoreManager && this.scene.character) {
          this.scene.scoreManager.addScore(-1, this);
        }

        this.destroy();
        return; // 直接返回，避免后续逻辑
      }
    };

    return item;
  }

  // 辅助方法
  showEndText(textString) {
    const text = this.add.text(
      this.cameras.main.width / 2, 
      this.cameras.main.height / 2, 
      textString, 
      { 
        fontSize: '64px', 
        color: '#ffffff', 
        fontStyle: 'bold',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: { x: 20, y: 10 },
        align: 'center'
      }
    );
    text.setOrigin(0.5);
    text.setScrollFactor(0);
    text.setDepth(100);
  }

  
  update() {
    this.character.update();
    this.lowBirds.children.iterate(bird => {
      if (bird && !bird.destroyed) {
        bird.preUpdate(this.time.now, this.time.delta);
      }
    });
    checkMouthEat(this, this.character, this.grossGroup, this.deliciousGroup, this.specialGrossGroup, 100);
    // 检查 deadly poop 砸中
    checkDeadlyPoopHit(this, this.character, this.deadlyPoopGroup);

  }
}
