let gameOptions = {
}

window.onload = function () {
  let gameConfig = {
    type: Phaser.AUTO,
    parent: 'phaser-app',
    width: 750,
    height: 1334,
    backgroundColor: 0x000000,
    scene: GameScene,
    physics: {
      default: "matter",
      matter: {
        gravity: {
          y: gameOptions.gravity
        },
        debug: true
      }
    }
  }
  game = new Phaser.Game(gameConfig);
  window.focus();
  resize();
  window.addEventListener("resize", resize, false);
}

class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  preload() {
    this.W = this.sys.game.config.width;
    this.H = this.sys.game.config.height;

    this.load.image('water1', '/water-effect/assets/water1.png');
    this.load.image('water2', '/water-effect/assets/water2.png');
    this.load.image('background', '/water-effect/assets/bg_apple.png');
    this.load.image('foreground', '/water-effect/assets/bg_lianxu.png');
    this.load.image('waterForeground', '/water-effect/assets/applewater_qian.png');
    this.load.image('waterBackground', '/water-effect/assets/applewater_hou.png');
  }

  create() {
    this.initBackground();
    this.initWaterEffect();
  }

  initBackground() {
    this.background = this.add.sprite(0, 0, 'background');
    this.background.tint = 15000000;
    this.background.setOrigin(0, 0);
    this.background.displayWidth = this.W;
    this.background.displayHeight = this.H;

    this.foreground = this.add.sprite(0, this.H, 'foreground');
    this.foreground.setScale(2, 2);
    this.foreground.alpha = 1;
  }

  initWaterEffect() {
    this.waterBackground = this.add.tileSprite(0, this.H - 140, 1024, 128, 'waterBackground');
    this.waterBackground.setScale(2, 2);
    this.tweens.add({
      targets: [this.waterBackground],
      x: this.waterBackground.x - 1024,
      duration: 3000,
      yoyo: true,
      repeat: -1
    });

    this.waterForebackground = this.add.tileSprite(0, this.H - 128, 1024, 128, 'waterForeground');
    this.waterForebackground.setScale(2, 2);
    this.tweens.add({
      targets: [this.waterForebackground],
      x: this.waterForebackground.x + 1024,
      duration: 3000,
      yoyo: true,
      repeat: -1
    });

    let water1 = this.add.sprite(0, this.H - 180, 'water1');
    water1.setScale(0.7, 0.7);
    let water2 = this.add.sprite(0, this.H - 150, 'water2');
    water2.setScale(0.7, 0.7);

    let tweenWater1 = this.tweens.add({
      targets: [water1],
      y: this.H - 150,
      duration: 2000,
      ease: 'Linear',
      yoyo: true,
      repeat: -1
    });
    let tweenWater2 = this.tweens.add({
      targets: [water2],
      y: this.H - 180,
      duration: 2000,
      ease: 'Linear',
      yoyo: true,
      repeat: -1
    });
  }
}

function resize() {
  let game_ratio = game.config.width / game.config.height;
  // Make div full height of browser and keep the ratio of game resolution
  let div = document.getElementById('phaser-app');
  div.style.width = (window.innerHeight * game_ratio) + 'px';
  div.style.height = window.innerHeight + 'px';

  // Check if device DPI messes up the width-height-ratio
  let canvas = document.getElementsByTagName('canvas')[0];
  let dpi_w = parseInt(div.style.width) / canvas.width;
  let dpi_h = parseInt(div.style.height) / canvas.height;

  let height = window.innerHeight * (dpi_w / dpi_h);
  let width = height * game_ratio;

  // Scale canvas
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
}
