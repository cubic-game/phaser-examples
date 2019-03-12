let gameOptions = {
  bgColors: [0x62bd18, 0xff5300, 0xd21034, 0xff475c, 0x8f16b2, 0x588c7e, 0x8c4646],
  holeWidthRange: [80, 260],
  wallRange: [10, 50],
  growTime: 1500,
  localStorageName: "squaregamephaser3"
}
let saveData;
const IDLE = 0;
const WAITING = 1;
const GROWING = 2;

window.onload = function () {
  let gameConfig = {
    type: Phaser.AUTO,
    parent: 'phaser-app',
    width: 750,
    height: 1334,
    backgroundColor: 0x444444,
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

  init() {
    this.GW = this.sys.game.config.width;
    this.GH = this.sys.game.config.height;
  }

  preload() {
    this.load.image("base", "/perfect-square/assets/base.png");
    this.load.image("square", "/perfect-square/assets/square.png");
    this.load.image("top", "/perfect-square/assets/top.png");
    this.load.bitmapFont("font", "/perfect-square/assets/font.png", "/perfect-square/assets/font.fnt");
  }

  create() {
    saveData = localStorage.getItem(gameOptions.localStorageName) == null ? {
      level: 1
    } : JSON.parse(localStorage.getItem(gameOptions.localStorageName));

    let tintColor = Phaser.Utils.Array.GetRandom(gameOptions.bgColors);
    this.cameras.main.setBackgroundColor(tintColor);

    this.leftSquare = this.add.sprite(0, this.GH, "base");
    this.leftSquare.setOrigin(1, 1);
    this.rightSquare = this.add.sprite(this.GW, this.GH, "base");
    this.rightSquare.setOrigin(0, 1);

    this.leftWall = this.add.sprite(0, this.GH - this.leftSquare.height, "top");
    this.leftWall.setOrigin(1, 1);
    this.rightWall = this.add.sprite(this.GW, this.GH - this.rightSquare.height, "top");
    this.rightWall.setOrigin(0, 1);

    this.square = this.add.sprite(this.GW / 2, -400, "square");
    this.square.successful = 0;
    this.square.setScale(0.2);

    this.squareText = this.add.bitmapText(game.config.width / 2, -400, "font", (saveData.level - this.square.successful).toString(), 120);
    this.squareText = this.add.bitmapText(game.config.width / 2, -400, "font", (saveData.level - this.square.successful).toString(), 120);
    this.squareText.setOrigin(0.5);
    this.squareText.setScale(0.4);
    this.squareText.setTint(tintColor);

    this.levelText = this.add.bitmapText(game.config.width / 2, 0, "font", "level " + saveData.level, 60);
    this.levelText.setOrigin(0.5, 0);
    this.updateLevel();
    this.input.on("pointerdown", this.grow, this);
    this.input.on("pointerup", this.stop, this);
    this.gameMode = IDLE;
  }

  updateLevel() {
    let holeWidth = Phaser.Math.Between(gameOptions.holeWidthRange[0], gameOptions.holeWidthRange[1]);
    let wallWidth = Phaser.Math.Between(gameOptions.wallRange[0], gameOptions.wallRange[1]);

    this.placeWall(this.leftSquare, (game.config.width - holeWidth) / 2);
    this.placeWall(this.rightSquare, (game.config.width + holeWidth) / 2);
    this.placeWall(this.leftWall, (game.config.width - holeWidth) / 2 - wallWidth);
    this.placeWall(this.rightWall, (game.config.width + holeWidth) / 2 + wallWidth);

    let squareTween = this.tweens.add({
      targets: [this.square, this.squareText],
      y: 150,
      scaleX: 0.2,
      scaleY: 0.2,
      angle: 50,
      duration: 50,
      ease: "Cubic.easeOut",
      callbackScope: this,
      onComplete: (tween) => {
        this.rotateTween = this.tweens.add({
          targets: [this.square, this.squareText],
          angle: 40,
          duration: 300,
          yoyo: true,
          repeat: -1
        });
        if (this.square.successful == 0) {
          this.addInfo(holeWidth, wallWidth);
        }
        this.gameMode = WAITING;
      }
    });
  }

  addInfo(holeWidth, wallWidth) {
    this.infoGroup = this.add.group();
    let targetSquare = this.add.sprite(game.config.width / 2, game.config.height - this.leftSquare.displayHeight, "square");
    targetSquare.displayWidth = holeWidth + wallWidth;
    targetSquare.displayHeight = holeWidth + wallWidth;
    targetSquare.alpha = 0.3;
    targetSquare.setOrigin(0.5, 1);
    this.infoGroup.add(targetSquare);

    let targetText = this.add.bitmapText(game.config.width / 2, targetSquare.y - targetSquare.displayHeight - 20, "font", "land here", 48);
    targetText.setOrigin(0.5, 1);
    this.infoGroup.add(targetText);

    let holdText = this.add.bitmapText(game.config.width / 2, 250, "font", "tap and hold to grow", 40);
    holdText.setOrigin(0.5, 0);
    this.infoGroup.add(holdText);
    let releaseText = this.add.bitmapText(game.config.width / 2, 300, "font", "release to drop", 40);
    releaseText.setOrigin(0.5, 0);
    this.infoGroup.add(releaseText);
  }

  placeWall(target, posX) {
    this.tweens.add({
      targets: target,
      x: posX,
      duration: 500,
      ease: "Cubic.easeOut"
    });
  }

  grow(pointer) {
    if (this.gameMode == WAITING) {
      this.gameMode = GROWING;
      if (this.square.successful == 0) {
        this.infoGroup.toggleVisible();
      }
      this.growTween = this.tweens.add({
        targets: [this.square, this.squareText],
        scaleX: 1,
        scaleY: 1,
        duration: gameOptions.growTime
      });
    }
  }

  stop(pointer) {
    if (this.gameMode == GROWING) {
      this.gameMode = IDLE;
      this.growTween.stop();
      this.rotateTween.stop();
      this.rotateTween = this.tweens.add({
        targets: [this.square, this.squareText],
        angle: 0,
        duration: 300,
        ease: "Cubic.easeOut",
        callbackScope: this,
        onComplete: function () {
          if (this.square.displayWidth <= this.rightSquare.x - this.leftSquare.x) {
            this.tweens.add({
              targets: [this.square, this.squareText],
              y: game.config.height + this.square.displayWidth,
              duration: 600,
              ease: "Cubic.easeIn",
              callbackScope: this,
              onComplete: function () {
                this.levelText.text = "Oh no!!!";
                this.gameOver();
              }
            })
          } else {
            if (this.square.displayWidth <= this.rightWall.x - this.leftWall.x) {
              this.fallAndBounce(true);
            } else {
              this.fallAndBounce(false);
            }
          }
        }
      });
    }
  }

  fallAndBounce(success) {
    let destY = game.config.height - this.leftSquare.displayHeight - this.square.displayHeight / 2;
    let message = "Yeah!!!!";

    if (success) {
      this.square.successful++;
    } else {
      destY = game.config.height - this.leftSquare.displayHeight - this.leftWall.displayHeight - this.square.displayHeight / 2;
      message = "Oh no!!!!";
    }

    this.tweens.add({
      targets: [this.square, this.squareText],
      y: destY,
      duration: 600,
      ease: "Bounce.easeOut",
      callbackScope: this,
      onComplete: function () {
        this.levelText.text = message;
        if (!success) {
          this.gameOver();
        } else {
          this.time.addEvent({
            delay: 1000,
            callback: function () {
              if (this.square.successful == saveData.level) {
                saveData.level++;
                localStorage.setItem(gameOptions.localStorageName, JSON.stringify({
                  level: saveData.level
                }));
                this.scene.start("GameScene");
              } else {
                this.squareText.text = saveData.level - this.square.successful;
                this.squareText.setOrigin(1, 1)
                this.levelText.text = "level " + saveData.level;
                this.updateLevel();
              }
            },
            callbackScope: this
          });
        }
      }
    })
  }

  gameOver() {
    this.time.addEvent({
      delay: 1000,
      callback: function () {
        this.scene.start("GameScene");
      },
      callbackScope: this
    });
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
