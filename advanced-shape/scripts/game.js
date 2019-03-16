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
    physics: {
      default: 'matter',
      matter: {
        gravity: 0,
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
    this.load.image('arc', '/advanced-shape/assets/arc.png');
    this.load.json('shapes', '/advanced-shape/assets/shapes.json');

    this.load.atlas('fruits', '/advanced-shape/assets/fruit-sprites.png', '/advanced-shape/assets/fruit-sprites.json');
    this.load.json('fruitShapes', '/advanced-shape/assets/fruit-shapes.json');
  }

  create() {
    const shapes = this.cache.json.get('shapes');
    const fruitShapes = this.cache.json.get('fruitShapes');
    const ground = this.matter.add.sprite(0, 0, 'fruits', 'ground', {shape: fruitShapes.ground});
    ground.setPosition(0 + ground.centerOfMass.x, 280 + ground.centerOfMass.y);
    const arc = this.matter.add.sprite(this.sys.game.config.width/2, this.sys.game.config.height/2, 'arc', 'arc', {shape: shapes.arc});
    arc.setOrigin(0.5);
    this.matter.add.sprite(200, 50, 'fruits', 'banana', {shape: fruitShapes.banana});
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
