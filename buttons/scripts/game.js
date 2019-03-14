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

  preload() {

  }

  create() {
    this.clickButton = this.add.text(100, 100, 'Hello Phaser3', {
      fill: '#0f0',
      fontSize: 30,
    });
    let clickCount = 0;
    this.clickCountText = this.add.text(100, 200, '', {
      fontSize: 33
    });

    this.clickButton.setInteractive({ useHandCursor: true })
    .on('pointerdown', () => this.enterButtonActiveState() )
    .on('pointerover', () => this.enterButtonHoverState() )
    .on('pointerout', () => this.enterButtonRestState() )
    .on('pointerup', () => {
      this.updateClickCountText(++clickCount);
      this.enterButtonHoverState();
    });

    this.updateClickCountText(clickCount);
  }

  updateClickCountText(clickCount) {
    this.clickCountText.setText(`Button has been clicked ${clickCount} times.`);
  }

  enterButtonHoverState() {
    this.clickButton.setStyle({ fill: '#ff0'});
  }

  enterButtonRestState() {
    this.clickButton.setStyle({ fill: '#0f0' });
  }

  enterButtonActiveState() {
    this.clickButton.setStyle({ fill: '#0ff' });
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
