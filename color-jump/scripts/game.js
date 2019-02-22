let gameOptions = {
  ballSpeed: 4,
  jumpForce: 30,
  bars: 4,
  barColors: [0x1abc9c, 0x2980b9, 0x9b59b6, 0xf1c40f, 0xc0392b, 0xecf0f1]
}

const LEFT = 0;
const RIGHT = 1;

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
          x: 0,
          y: 4
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
    super("PlayGame");
  }

  preload() {
    this.load.image("wall", "/color-jump/assets/wall.png");
    this.load.image("ball", "/color-jump/assets/ball.png");
  }

  create() {
    this.leftWalls = [];
    this.rightWalls = [];

    for (let i = 0; i < gameOptions.bars; i++) {
      this.leftWalls[i] = this.addWall(i, LEFT);
      this.rightWalls[i] = this.addWall(i, RIGHT);
    }

    this.ball = this.matter.add.image(game.config.width / 4, game.config.height / 2, "ball");
    this.ball.setBody({
      type: "circle"
    });
    let randomWall = Phaser.Math.RND.pick(this.rightWalls);
    this.ball.setTint(randomWall.body.color);
    this.ball.setVelocity(gameOptions.ballSpeed, 0);

    this.input.on("pointerdown", this.jump, this);

    this.matter.world.on("collisionstart", function (e, b1, b2) {
      if (b1.label == "leftwall" || b2.label == "leftwall") {
        this.handleWallCollision(LEFT, b1, b2);
      }
      if (b1.label == "rightwall" || b2.label == "rightwall") {
        this.handleWallCollision(RIGHT, b1, b2);
      }
    }, this);
  }

  handleWallCollision(side, bodyA, bodyB) {
    if (bodyA.color != bodyB.color) {
      // this.scene.start("GameScene");
    }
    this.paintWalls((side == LEFT) ? this.rightWalls : this.leftWalls);
    this.ball.setVelocity(gameOptions.ballSpeed, this.ball.body.velocity.y);
  }

  paintWalls(walls) {
    walls.forEach(function (wall) {
      let color = Phaser.Math.RND.pick(gameOptions.barColors);
      wall.setTint(color);
      wall.body.color = color;
    });
    let randomWall = Phaser.Math.RND.pick(walls);
    this.ball.setTint(randomWall.body.color);
    this.ball.body.color = randomWall.body.color;
  }

  jump() {
    this.ball.setVelocity((this.ball.body.velocity.x > 0) ? gameOptions.ballSpeed : -gameOptions.ballSpeed, -gameOptions.jumpForce);
  }

  addWall(wallNumber, side) {
    let wallTexture = this.textures.get("wall");
    let wallHeight = game.config.height / gameOptions.bars;

    let wallX = side * game.config.width + wallTexture.source[0].width / 2 - wallTexture.source[0].width * side;
    let wallY = wallHeight * wallNumber + wallHeight / 2;
    let wall = this.matter.add.image(wallX, wallY, "wall", null, {
      isStatic: true,
      label: (side == RIGHT) ? "rightwall" : "leftwall"
    });
    wall.displayHeight = wallHeight;
    return wall;
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
