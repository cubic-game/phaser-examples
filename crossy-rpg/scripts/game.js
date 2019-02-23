let gameOptions = {

}

window.onload = function () {
  let gameConfig = {
    type: Phaser.AUTO,
    parent: 'phaser-app',
    width: 640,
    height: 360,
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

  init() {
    this.playerSpeed = 1.5;
    this.enemySpeed = 2;
    this.enemyMaxY = 280;
    this.enemyMinY = 80;
    this.isPlayerAlive = true;
  }

  preload() {
    this.load.image('background', '/crossy-rpg/assets/background.png');
    this.load.image('player', '/crossy-rpg/assets/player.png');
    this.load.image('dragon', '/crossy-rpg/assets/dragon.png');
    this.load.image('treasure', '/crossy-rpg/assets/treasure.png');
  }

  create() {
    this.background = this.add.sprite(0, 0, 'background');
    this.background.setOrigin(0, 0);

    this.player = this.add.sprite(40, this.sys.game.config.height/2, 'player');
    this.player.setScale(0.5);

    this.treasure = this.add.sprite(this.sys.game.config.width - 80, this.sys.game.config.height/2, 'treasure');
    this.treasure.setScale(0.6);

    this.enemies = this.add.group({
      key: 'dragon',
      repeat: 5,
      setXY: {
        x: 110,
        y: 100,
        stepX: 80,
        stepY: 20,
      }
    });
    Phaser.Actions.ScaleXY(this.enemies.getChildren(), -0.5, -0.5);
    Phaser.Actions.Call(this.enemies.getChildren(), (enemy) => {
      enemy.speed = Math.random() * 2 + 1;
    }, this);

    this.cameras.main.resetFX();
  }

  update() {
    if (!this.isPlayerAlive) {
      return;
    }

    if (this.input.activePointer.isDown) {
      this.player.x += this.playerSpeed;
    }

    if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.treasure.getBounds())) {
      this.gameOver();
    }

    let enemies = this.enemies.getChildren();
    for (let i = 0; i < enemies.length; i++) {
      enemies[i].y += enemies[i].speed;
      if (enemies[i].y >= this.enemyMaxY && enemies[i].speed > 0) {
        enemies[i].speed *= -1;
      } else if (enemies[i].y <= this.enemyMinY && enemies[i].speed < 0) {
        enemies[i].speed *= -1;
      }

      if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), enemies[i].getBounds())) {
        this.gameOver();
        break;
      }
    }
  }

  gameOver() {
    this.isPlayerAlive = false;
    this.cameras.main.shake(500);
    this.time.delayedCall(250, () => this.cameras.main.fade(250), [], this);
    this.time.delayedCall(500, () => this.scene.restart(), [], this);
  }
}

function resize() {

}
