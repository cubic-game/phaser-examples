let gameOptions = {
}

window.onload = function () {
  let gameConfig = {
    type: Phaser.AUTO,
    parent: 'phaser-app',
    width: 750,
    height: 1334,
    backgroundColor: 0xecf0f1,
    scene: GameScene,
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

  init() {
    this.GW = this.sys.game.config.width;
    this.GH = this.sys.game.config.height;
  }

  preload() {
    this.load.image("gametitle", "/bounce-menu/assets/gametitle.png");
    this.load.image("gridedition", "/bounce-menu/assets/gridedition.png");
    this.load.image("playbutton", "/bounce-menu/assets/playbutton.png");
    this.load.image("menubutton", "/bounce-menu/assets/menubutton.png");
    this.load.image("resetgame", "/bounce-menu/assets/resetgame.png");
    this.load.image("thankyou", "/bounce-menu/assets/thankyou.png");
  }

  create() {
    this.title = this.add.sprite(this.GW / 2, 60, 'gametile');
    this.grip = this.add.sprite(this.GW / 2, 130, 'gridedition');
    this.playButton = this.add.sprite(this.GW / 2, this.GH/2 + 100, 'playButton');

    this.menuGroup = this.add.group();
    const menuButton = this.add.sprite(this.GW/2, this.GH - 30, 'menubutton')
      .setInteractive()
      .on('pointerdown', this.toggleMenu, this);
    this.menuGroup.add(menuButton);
    const resetGameButton = this.add.sprite(this.GW/2, this.GH - 30, 'resetgame')
      .setInteractive()
      .on('pointerdown', this.toggleMenu, this);
    this.menuGroup.add(resetGameButton);
    const thankyou = this.add.sprite(this.GW/2, this.GH - 30, 'thankyou')
      .setInteractive()
      .on('pointerdown', this.toggleMenu, this);
    this.menuGroup.add(thankyou);
  }

  toggleMenu() {
    if (this.menuGroup.y == 0) {
      this.tweens.add({
        y: -180,
        duration: 500,
        ease: 'Bounce.Out'
      })
    }
    if (this.menuGroup.y == -180) {
      this.tweens.add({
        y: 0,
        duration: 500,
        ease: 'Bounce.Out'
      })
    }
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
