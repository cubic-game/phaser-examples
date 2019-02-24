let gameOptions = {

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
    super("GameScene");
  }

  preload() {
    this.load.image("wall", "/dont-touch-spikes/assets/wall.png");
    this.load.image("ball", "/dont-touch-spikes/assets/ball.png");
    this.load.image("leftspike", "/dont-touch-spikes/assets/leftspike.png");
    this.load.image("rightspike", "/dont-touch-spikes/assets/rightspike.png");
  }

  create() {
    this.leftWall = this.matter.add.image(10, this.sys.game.config.height / 2, 'wall', null, {
      isStatic: true,
      label: 'leftwall'
    });
    this.leftWall.displayHeight = this.sys.game.config.height;
    this.leftWall.tint = 0x00ff00;
    this.leftWall.setDepth(1);

    this.rightWall = this.matter.add.image(this.sys.game.config.width - 10, this.sys.game.config.height / 2, 'wall', null, {
      isStatic: true,
      label: 'rightwall'
    });
    this.rightWall.tint = 0x00ff00;
    this.rightWall.displayHeight = this.sys.game.config.height;
    this.rightWall.setDepth(1);

    const wallWidth = this.leftWall.getBounds().width;
console.log('wallWidth', wallWidth);
    // Define the rigidbody shape (verts, three points)
    let leftSpikePath = this.matter.world.fromPath("-45 -35 45 0 -45 35");
    let rightSpikePath = this.matter.world.fromPath("-45 0 45 35 45 -35");

    this.leftSpike = this.matter.add.image(wallWidth + 10, Phaser.Math.Between(50, this.sys.game.config.height - 50), 'leftspike', null, {
      isStatic: true,
      shape: {
        type: "fromVerts",
        verts: leftSpikePath
      },
      label: "spike"
    });
    this.rightSpike = this.matter.add.image(this.sys.game.config.width - wallWidth - 10, Phaser.Math.Between(50, this.sys.game.config.height - 50), 'rightspike', null, {
      isStatic: true,
      shape: {
        type: "fromVerts",
        verts: rightSpikePath
      },
      label: "spike"
    });
    this.ball = this.matter.add.image(game.config.width / 2, game.config.height / 2, "ball");
        this.ball.setCircle();
        this.ball.setVelocity(7, 0);
        this.ball.setBounce(1);
        this.ball.setFriction(0);
  }

  placeCoin() {
    this.coin.x = Phaser.Math.Between(game.config.width * 0.2, game.config.width * 0.8);
    this.coin.y = Phaser.Math.Between(game.config.height * 0.2, game.config.height * 0.8);
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
    let dpi_w = Math.ceil(div.style.width) / canvas.width;
    let dpi_h = Math.ceil(div.style.height) / canvas.height;

    let height = window.innerHeight * (dpi_w / dpi_h);
    let width = height * game_ratio;

    // Scale canvas
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
}
