let gameOptions = {
  // flipping speed in milliseconds
  flipSpeed: 200,
  // flipping zoom ratio. Simulates the card to be raised when flipping
  flipZoom: 1.2
}

window.onload = function () {
  let gameConfig = {
    type: Phaser.AUTO,
    parent: 'phaser-app',
    width: 750,
    height: 1334,
    backgroundColor: 0x448844,
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

  preload() {
    this.load.spritesheet('cards', "/flip-card/assets/cards.png", {
      frameWidth: 167,
      frameHeight: 243
    });
    this.W = this.sys.game.config.width;
    this.H = this.sys.game.config.height;
  }

  create() {
    this.card = this.add.sprite(this.W / 2, this.H / 2, 'cards', 0);
    this.card.isFlipping = false;
    this.initFlipAnimation();
    this.input.on('pointerdown', this.doFlip, this);
  }

  initFlipAnimation() {
    this.flipTween = this.tweens.create({
      targets: [this.card],
      scaleX: 0,
      scaleY: gameOptions.flipZoom,
      duration: gameOptions.flipSpeed / 2,
      onComplete: (tween) => {
        console.log('name', this.card.frame.name);
        this.card.setFrame(1 - this.card.frame.name);
        this.backFlipTween.play();
      }
    });
    this.backFlipTween = this.tweens.create({
      targets: [this.card],
      scaleX: 1,
      scaleY: 1,
      duration: gameOptions.flipSpeed / 2,
      onComplete: (tween) => {
        this.card.isFlipping = false;
      }
    });
  }

  doFlip(pointer) {
    if(!this.card.isFlipping) {
      this.card.isFlipping = true;
      this.flipTween.play();
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
