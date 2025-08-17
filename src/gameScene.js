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
    this.grossGroup = this.add.group();
    this.deliciousGroup = this.add.group();

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
    this.poops = this.physics.add.group();
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
    // 碰撞检测：小猫和屎
    this.physics.add.overlap(this.character, this.poops, (cat, poop) => {
      poop.destroy();
      this.loseHp();
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
