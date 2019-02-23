let gameOptions = {
  gravity: 1,
  maxItemsPerLevel: 30,
  maxIterations: 10,
  minItemsDistance: 160
}

const HERO = 0;
const COIN = 1;
const SKULL = 2;

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
    this.colors = [ 'blue', 'green', 'grey', 'purple', 'red', 'yellow' ];
    this.load.atlas('flood', '/particle-tests/assets/atlas/blobs.png', '/particle-tests/assets/atlas/blobs.json');
  }

  create() {
    this.input.on('pointerdown', this.doEffect1, this);
    this.createParticle();
  }

  createParticle() {
    this.particles = this.add.particles('flood');
    this.createEmitter();
  }

  createEmitter() {
    this.emitters = [];
    for (let i = 0; i < this.colors.length; i++) {
      const color = this.colors[i];
      this.emitters[color] = this.particles.createEmitter({
        frame: color,
        lifespan: 1000,
        speed: {min: 300, max: 400},
        alpha: {start: 1, end: 0},
        scale: {start: 0.5, end: 0},
        rotate: {start: 0, end: 360, ease: 'Power2'},
        blendMode: 'ADD',
        on: false
      })
    }
  }

  doEffect1() {
    console.log('do effect1');
    let color = Phaser.Math.RND.pick(this.colors);
    this.emitters[color].explode(8, Phaser.Math.Between(128, 672), Phaser.Math.Between(28, 572));

    color = Phaser.Math.RND.pick(this.colors);
    this.emitters[color].explode(8, Phaser.Math.Between(128, 672), Phaser.Math.Between(28, 572));
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
