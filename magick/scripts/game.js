let gameOptions = {
  playerSpeed: 120,
  playerJumpSpeed: {
    x: 30,
    y: -100
  },
  tileSize: 32,
  changeDirectionRange: 32,
  playerGravity: 400
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
      default: 'arcade',
      arcade: {
        gravity: {
          y: 0
        }
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

  init() {
    this.width = this.sys.game.config.width;
    this.height = this.sys.game.config.height;
  }

  preload() {
    this.load.tilemapTiledJSON('map', '/magick/assets/map.json');
    this.load.image('tiles', '/magick/assets/tiles.png');
    this.load.image('player', '/magick/assets/player.png');
  }

  create() {
    this.tilePoint = null;
    this.map = this.make.tilemap({
      key: 'map'
    });
    const tileSet = this.map.addTilesetImage('tileset01', 'tiles');
    this.levelLayer = this.map.createDynamicLayer('myLevel', tileSet);
    this.map.setCollisionBetween(1, 2);

    this.player = this.physics.add.sprite(48, 226, 'player');
    this.player.isJumping = false;
    this.player.direction = 1;
    this.player.body.gravity.y = gameOptions.playerGravity;

    this.input.on('pointerdown', this.addBlock, this);
  }

  addBlock(e) {
    const distanceX = e.x - this.player.x;
    const distanceY = e.y - this.player.y;

    if ((distanceX * distanceX + distanceY * distanceY) < gameOptions.changeDirectionRange * gameOptions.changeDirectionRange) {
      this.player.direction *= -1;
    } else {
      if (!this.map.getTileAtWorldXY(e.x, e.y)) {
        if (this.tilePoint) {
          this.map.removeTileAtWorldXY(this.tilePoint.x, this.tilePoint.y);
        }
        this.map.putTileAtWorldXY(2, e.x, e.y);
        this.tilePoint = new Phaser.Math.Vector2(e.x, e.y);
      }
    }
  }

  jump() {
    this.player.body.velocity.y = gameOptions.playerJumpSpeed.y;
    this.player.body.velocity.x = gameOptions.playerJumpSpeed.x * this.player.direction;
    this.player.isJumping = true;
  }

  update() {
    this.player.body.velocity.x = 0;
    this.physics.world.collide(this.player, this.levelLayer, this.movePlayer, null, this);
  }

  movePlayer() {
    if (this.player.body.blocked.down) {
      this.player.body.velocity.x = gameOptions.playerSpeed * this.player.direction;
      this.player.isJumping = false;
    }
    if (this.player.body.blocked.right && this.player.direction == 1) {
      if ((!this.map.getTileAtWorldXY(this.player.x + gameOptions.tileSize, this.player.y - gameOptions.tileSize)
        && !this.map.getTileAtWorldXY(this.player.x, this.player.y - gameOptions.tileSize)) || this.player.isJumping) {
          this.jump();
        } else {
          this.player.direction *= -1;
        }
    }
    if(this.player.body.blocked.left && this.player.direction == -1){
			if((!this.map.getTileAtWorldXY(this.player.x - gameOptions.tileSize, this.player.y - gameOptions.tileSize) && !this.map.getTileAtWorldXY(this.player.x, this.player.y - gameOptions.tileSize)) || this.player.isJumping){
				this.jump();
			}
			else{
				this.player.direction *= -1;
			}
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
