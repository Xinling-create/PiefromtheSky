import Character from "./sprites/character.js";
import LowBird from "./sprites/lowBird.js";
import highBird from "./sprites/highBird.js";
import { checkMouthEat } from "./sprites/mouthEaten.js";

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
    // 背景
    this.bg = this.add.image(0, 0, "bg").setOrigin(0, 0); // 左上角对齐
    this.bg.displayWidth = this.sys.game.config.width;
    this.bg.displayHeight = this.sys.game.config.height;

    // 创建角色
    const width = this.sys.scale.width;
    const height = this.sys.scale.height;
    this.character = new Character(this, width/2, height*0.7);
    this.add.existing(this.character);
    this.grossGroup = this.add.group();
    this.deliciousGroup = this.add.group();

    this.scale.on('resize', (gameSize) => {
      this.bg.displayWidth = gameSize.width;
      this.bg.displayHeight = gameSize.height;
    });

    

    // -------------------
    // 随机生成食物配置
    // -------------------
    this.spawnConfig = {
      baseDelay: 2000,      // 初始间隔
      minDelay: 500,        // 最小间隔
      delayDecay: 0.95,     // 每轮递减
      grossRatio: 0.2,      // 初始不可吃比例
      grossRatioIncrease: 0.01,
      maxGrossRatio: 0.8,
      maxSpawnPerRound: 3
    };

    // -------------------
    // 随机生成初始食物
    // -------------------
    this.spawnRandomFood();


    //lowbird group
    this.lowBirds = this.physics.add.group();
    this.time.addEvent({
      // 每隔一段时间生成一只低空飞过的鸟，具体时间待设置
      delay: 1000,
      loop: true,
      callback: () => {
        const y = height * 0.55; // 低空飞过
        const bird = new LowBird(this, width, y);
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
    // 每隔 3 秒生成一只高空鸟
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        const y = height * 0.2; // 低空飞过
        const bird = new highBird(this, width, y);
        this.highBirds.add(bird);
      },
      loop: true
    });
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
          // 成功吃到烤鸟的回调（可选）：加分/粒子特效/音效等
          // this.addScore?.(100);
        });
      }
    });
  }

  // -------------------
  // 随机生成食物
  // -------------------
  spawnRandomFood() {
  const cfg = this.spawnConfig;
  const existingItems = [...this.deliciousGroup.getChildren(), ...this.grossGroup.getChildren()];
  const minSpacing = 50; // 最小水平间隔 px
  const newItems = []; 

  const count = Phaser.Math.Between(1, cfg.maxSpawnPerRound);

  for (let i = 0; i < count; i++) {
    let x, y;
    let tries = 0;

    do {
      x = Phaser.Math.Between(50, this.sys.canvas.width - 50);
      y = -50;
      tries++;
      // 避免无限循环
      if (tries > 100) break;
    } while (existingItems.concat(newItems).some(item => Math.abs(item.x - x) < minSpacing));

    newItems.push({ x, y });

    const isGross = Math.random() < cfg.grossRatio;
    if (isGross) {
      const texture = Phaser.Utils.Array.GetRandom(["g1"]);
      this.spawnGrossItem(x, y, texture);
    } else {
      const texture = Phaser.Utils.Array.GetRandom(["d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8", "d9", "d10"]);
      this.spawnDeliciousItem(x, y, texture);
    }
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
    item.setScale(0.3); 
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
    item.setScale(0.3);
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
        this.destroy();

        // 扣分逻辑
        // 例如：
        // if (this.scene.addScore) this.scene.addScore(-1);
      }
    };

    return item;
  }

  
  update() {
    this.character.update();
    this.lowBirds.children.iterate(bird => {
      if (bird && !bird.destroyed) {
        bird.preUpdate(this.time.now, this.time.delta);
      }
    });
    checkMouthEat(this, this.character, this.grossGroup, this.deliciousGroup, 100);

  }
}
