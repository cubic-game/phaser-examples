let gameOptions = {
  // score panel height / game height
  scorePanelHeight: 0.08,
  // launch panel height / game height
  launchPanelHeight: 0.18,
  // ball size / game width
  ballSize: 0.04,
  // ball speed, in pixels/second
  ballSpeed: 1000
}

window.onload = function () {
  let gameConfig = {
    type: Phaser.AUTO,
    parent: 'phaser-app',
    width: 750,
    height: 1334,
    backgroundColor: 0x202020,
    scene: GameScene,
    physics: {
      default: "arcade",
      arcade: {
        debug: true,
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
    this.load.image('ball', '/ballz/assets/ball.png');
    this.load.image('panel', '/ballz/assets/panel.png');
    this.load.image('trajectory', '/ballz/assets/trajectory.png');
  }

  create() {
    this.panelGroup = this.add.group();

    this.scorePanel = this.physics.add.sprite(0, 0, 'panel');
    this.scorePanel.displayWidth = this.sys.game.config.width;
    this.scorePanel.displayHeight = Math.round(this.sys.game.config.height * gameOptions.scorePanelHeight);
    this.scorePanel.setOrigin(0, 0);
    this.scorePanel.setImmovable(true);
    this.panelGroup.add(this.scorePanel);

    // place launch panel
    this.launchPanel = this.physics.add.sprite(0, this.sys.game.config.height, 'panel');
    this.launchPanel.displayWidth = this.sys.game.config.width;
    this.launchPanel.displayHeight = Math.round(this.sys.game.config.height * gameOptions.launchPanelHeight);
    this.launchPanel.setOrigin(0, 1);
    this.launchPanel.setImmovable(true);
    this.panelGroup.add(this.launchPanel);

    // place the ball
    const ballSize = this.sys.game.config.width * gameOptions.ballSize;
    this.ball = this.physics.add.sprite(this.sys.game.config.width / 2, this.sys.game.config.height - this.launchPanel.height - ballSize / 2, 'ball');
    this.ball.displayWidth = ballSize;
    this.ball.displayHeight = ballSize;
    this.ball.body.setBounce(1);
    this.ball.setOrigin(0.5);

    this.physics.add.collider(this.ball, this.panelGroup);

    this.trajectory = this.add.sprite(this.ball.x, this.ball.y, 'trajectory');
    this.trajectory.setOrigin(0.5, 1);

    this.input.on('pointerdown', this.animBall, this);
    this.input.on('pointerup', this.shootBall, this);
    this.input.addMoveCallback(this.adjustBall, this);
  }

  animBall() {
    // if the player is not shooting...
    if (!this.shooting) {
      // the player is aiming
      this.animing = true;
    }
  }

  shootBall() {
    if (this.trajectory.visible) {
      const angleOfFire = Phaser.Math.DegToRad(this.trajectory.angle - 90);
      this.ball.body.setVelocity(gameOptions.ballSpeed * Math.cos(angleOfFire), gameOptions.ballSpeed * Math.sin(angleOfFire));
      this.shooting = true;
    }

    this.animing = false;
    this.trajectory.visible = false;
  }

  adjustBall(e) {
    console.log('ok?>?');
    if (this.animing) {
      const distX = e.position.x - e.positionDown.x;
      const distY = e.position.y - e.positionDown.y;

      if (distY > 10) {
        this.trajectory.x = this.ball.x;
        this.trajectory.y = this.ball.y;
        this.trajectory.visible = true;

        this.direction = Phaser.Math.AngleBetween(e.position.x, e.position.y, e.positionDown.x, e.positionDown.y);
        this.trajectory.angle = Phaser.Math.RadToDeg(this.direction) + 90;
      } else {
        this.trajectory.visible = false;
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
