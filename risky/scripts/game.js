let gameOptions = {
  visibleTargets: 9,
  ballDistance: 120,
  rotationSpeed: 4,
  angleRange: [25, 155],
  localStorageName: "riskystepsgame"
}

window.onload = function () {
  let gameConfig = {
    type: Phaser.AUTO,
    parent: 'phaser-app',
    width: 750,
    height: 1334,
    backgroundColor: 0xff0000,
    scene: [BootScene, GameScene, PreloadScene, MenuScene],
  }
  game = new Phaser.Game(gameConfig);
  window.focus();
  resize();
  window.addEventListener("resize", resize, false);
}

class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene', active: true });
  }

  preload() {
    this.load.image("loading", "/risky/assets/sprites/loading.png");
  }

  create() {
    this.scene.start('PreloadScene');
  }
}

class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    this.createLoadingBar();
    this.load.image("title", "/risky/assets/sprites/title.png");
    this.load.image("playbutton", "/risky/assets/sprites/playbutton.png");
    this.load.image("ball", "/risky/assets/sprites/ball.png");
    this.load.image("target", "/risky/assets/sprites/target.png");
    this.load.image("arm", "/risky/assets/sprites/arm.png");
    this.load.image("homebutton", "/risky/assets/sprites/homebutton.png");
    this.load.image("tap", "/risky/assets/sprites/tap.png");
    this.load.image("fog", "/risky/assets/sprites/fog.png");
    this.load.bitmapFont("font", "/risky/assets/fonts/font.png", "/risky/assets/fonts/font.fnt");
    this.load.bitmapFont("whitefont", "/risky/assets/fonts/whitefont.png", "/risky/assets/fonts/whitefont.fnt");
    this.load.audio("failsound", ["/risky/assets/sounds/fail.mp3", "/risky/assets/sounds/fail.ogg"]);
    this.load.audio("hitsound", ["/risky/assets/sounds/hit.mp3", "/risky/assets/sounds/hit.mp3"]);
    this.load.audio("hit2sound", ["/risky/assets/sounds/hit2.mp3", "/risky/assets/sounds/hit2.ogg"]);
  }

  create() {
    this.scene.start('MenuScene');
  }

  createLoadingBar() {
    const centerX = this.sys.game.config.width / 2;
    const centerY = this.sys.game.config.height / 2;
    this.loadingBar = this.add.sprite(centerX, centerY, 'loading');
    this.loadingText = this.add.text(centerX, centerY + 50, 'loading');
    this.load.on('progress', this.onProgress, this);
  }

  onProgress(val) {
    let percent = Math.round(val * 100) + '%';
    this.loadingText.text = percent;
  }
}

class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    let savedData = localStorage.getItem(gameOptions.localStorageName) == null ? { score: 0 } : JSON.parse(localStorage.getItem(gameOptions.localStorageName));
    const centerX = this.sys.game.config.width / 2;
    const centerY = this.sys.game.config.height / 2;

    this.add.image(centerX, 50, 'title');
    let playButton = this.add.sprite(centerX, centerY, 'playbutton').setInteractive();
    playButton.on('pointerdown', this.playGame, this);
    this.tweens.add({
      targets: [playButton],
      scaleX: 0.8,
      scaleY: 0.8,
      duration: 500,
      yoyo: true,
      repeat: -1,
    })

    this.add.bitmapText(centerX, this.sys.game.config.height - 150, "whitefont", savedData.score.toString(), 60);
    let scoreLabel = this.add.bitmapText(centerX, this.sys.game.config.height - 200, "font", "BEST SCORE", 48);
  }

  playGame(pointer) {
    this.scene.start('GameScene');
  }
}

class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  preload() {
    this.centerX = this.sys.game.config.width / 2;
    this.centerY = this.sys.game.config.height / 2;
  }

  create() {
    this.failsSound = this.sound.add("failsound");
    this.hitSounds = [this.sound.add('hitsound'), this.sound.add('hit2sound')];
    this.destroy = false;
    this.targetArray = [];
    this.steps = 0;
    this.rotatingDirection = Phaser.Math.RND.between(0, 1);
    this.rotationAngle = 0;
    this.rotationSpeed = gameOptions.rotationSpeed;
    this.runUpdate = true;
    this.score = 0;

    this.gameContainer = this.add.container();
    this.targetGroup = this.add.group();
    this.ballGroup = this.add.group();
    // this.gameContainer.add(this.ballGroup);
    // this.gameContainer.add(this.ballGroup);

    this.arm = this.add.sprite(this.centerX, 900, 'arm');
    this.arm.angle = 90;
    this.arm.setOrigin(0, 0.5);
    this.ballGroup.add(this.arm);

    this.balls = [
      this.add.sprite(this.centerX, 900, "ball"),
      this.add.sprite(this.centerX, 900 + gameOptions.ballDistance, "ball")
    ]
    this.ballGroup.add(this.balls[0]);
    this.ballGroup.add(this.balls[1]);

    this.rotationAngle = 0;
    this.rotatingBall = 1;

    let target = this.add.sprite(0, 0, "target");
    target.x = this.balls[0].x;
    target.y = this.balls[0].y;
    this.targetGroup.add(target);
    this.targetArray.push(target);

    this.input.on('pointerdown', this.changeBall, this);

    for (let i = 0; i < gameOptions.visibleTargets; i++) {
      this.addTarget();
    }

    this.homeButton = this.add.sprite(this.centerX, this.sys.game.config.height - 100, 'homebutton').setInteractive()
      .on('pointerdown', (pointer) => this.scene.start('MenuScene'), this);

    this.tap = this.add.sprite(this.sys.game.config.width / 8, this.balls[0].y - 50, "tap");
    let fog = this.add.image(0, 0, 'fog');
    fog.setOrigin(0, 0);
    fog.displayWidth = this.sys.game.config.width;

    this.scoreText = this.add.bitmapText(20, 20, "whitefont", "0", 60);
  }

  changeBall(pointer) {
    if (this.tap != null) {
      this.tap.destroy();
      this.tap = null;
    }
    const homeButtonBounds = this.homeButton.getBounds();
    if (homeButtonBounds.contains(pointer.x, pointer.y)) {
      return;
    }

    this.hitSounds[this.rotatingBall].play();
    this.destroy = false;

    const curr = this.balls[this.rotatingBall];
    const target = this.targetArray[1];
    const dist = Phaser.Math.Distance.Between(curr.x, curr.y, target.x, target.y);
    if (dist < 20) {
      const points = Math.floor((20 - dist) / 2);
      this.score += points;
      this.scoreText.text = this.score.toString();

      this.rotatingDirection = Phaser.Math.RND.between(0, 1);
      let fallingTarget = this.targetArray.shift();
      this.tweens.add({
        targets: [fallingTarget],
        alpha: 0,
        width: 0,
        height: 0,
        duration: 2500,
        ease: '',
        onComplete: (tween) => {
          target.destroy();
        }
      })
      this.arm.x = this.balls[this.rotatingBall].x;
      this.arm.y = this.balls[this.rotatingBall].y;
      this.rotatingBall = 1 - this.rotatingBall;

      const staticBall =  this.balls[1 - this.rotatingBall];
      const rotatingBall = this.balls[this.rotatingBall];
      this.rotationAngle = Phaser.Math.Angle.Between(staticBall.x, staticBall.y, rotatingBall.x, rotatingBall.y) - 90;
      this.arm.angle = this.rotationAngle + 90;
      this.addTarget();
    } else {
      const ohnoText = this.add.bitmapText(0, 100, "whitefont", "MISSED!!", 48);
      ohnoText.x = this.targetArray[0].x;
      ohnoText.y = this.targetArray[0].y;
      this.gameOver();
    }
  }

  addTarget() {
    this.steps++;
    const startX = this.targetArray[this.targetArray.length - 1].x;
    const startY = this.targetArray[this.targetArray.length - 1].y;

    const target = this.add.sprite(0, 0, 'target');
    const randomAngle = Phaser.Math.RND.between(gameOptions.angleRange[0] + 90, gameOptions.angleRange[1] + 90);
    target.x = startX + gameOptions.ballDistance * Math.sin(Phaser.Math.DegToRad(randomAngle));
    target.y = startY + gameOptions.ballDistance * Math.cos(Phaser.Math.DegToRad(randomAngle));

    this.add.bitmapText(target.x - 4, target.y - 16, "whitefont", this.steps.toString(), 32);

    this.targetGroup.add(target);
    this.targetArray.push(target);
  }

  update() {
    if (this.runUpdate) {
      const curr = this.balls[this.rotatingBall];
      const target = this.targetArray[1];
      const dist = Phaser.Math.Distance.Between(curr.x, curr.y, target.x, target.y);

      if (dist > 90 && this.destroy && this.steps > gameOptions.visibleTargets) {
        let ohnoText = this.add.bitmapText(0, 100, "whitefont", "TOO LATE!!", 48);
        ohnoText.x = this.targetArray[0].x;
        ohnoText.y = this.targetArray[0].y;
        this.gameOver();
      }
      if (dist < 25 && !this.destroy) {
        this.destroy = true;
      }
      if (this.steps == gameOptions.visibleTargets) {
        if (this.tap != null) {
          if (dist < 20) {
            this.tap.alpha = 1;
          } else {
            this.tap.alpha = 0.2;
          }
        }
      }

      this.rotationAngle = (this.rotationAngle + this.rotationSpeed * (this.rotatingDirection * 2 - 1)) % 360;
      this.arm.angle = this.rotationAngle + 90;
      this.balls[this.rotatingBall].x = this.balls[1 - this.rotatingBall].x - gameOptions.ballDistance * Math.sin(Phaser.Math.DegToRad(this.rotationAngle));
      this.balls[this.rotatingBall].y = this.balls[1 - this.rotatingBall].y + gameOptions.ballDistance * Math.cos(Phaser.Math.DegToRad(this.rotationAngle));

      const distX = this.balls[1 - this.rotatingBall].x - this.sys.game.config.width / 2;
      const distY = this.balls[1 - this.rotatingBall].y - 900;

      this.cameras.main.x = Phaser.Math.Interpolation.Linear([this.cameras.main.x, this.cameras.main.x - distX], 0.05);
      this.cameras.main.y = Phaser.Math.Interpolation.Linear([this.cameras.main.y, this.cameras.main.y - distY], 0.05);
    }
  }

  gameOver() {

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
