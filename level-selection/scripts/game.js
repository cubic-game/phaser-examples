const gameOptions = {
  colors: ["0xffffff", "0xff0000", "0x00ff00", "0x0000ff", "0xffff00"],
  columns: 3,
  rows: 4,
  thumbWidth: 60,
  thumbHeight: 60,
  spacing: 20,
  storageKey: 'level-selection'
}

window.onload = function () {
  let gameConfig = {
    type: Phaser.AUTO,
    parent: 'phaser-app',
    width: 320,
    height: 480,
    backgroundColor: 0x222222,
    scene: [GameScene, PlayLevel],
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
    this.load.spritesheet('levelthumb', '/level-selection/assets/levelthumb.png', {
      frameWidth: 60,
      frameHeight: 60
    });

    this.load.image('levelpages', '/level-selection/assets/levelpages.png');
    this.load.image('transp', '/level-selection/assets/transp.png');
  }

  create() {
    this.stars = [];
    this.stars[0] = 0;
    this.canMove = true;
    this.itemGroup = this.add.group();

    for (let i = 0; i < gameOptions.columns * gameOptions.rows * gameOptions.colors.length; i++) {
      this.stars[i] = -1;
    }

    this.savedData = localStorage.getItem(gameOptions.storageKey)
      == null ? this.stars.toString() : localStorage.getItem(gameOptions.storageKey);

    this.pageText = this.add.text(this.width / 2, 16, "Swipe to select level page (1/" + gameOptions.colors.length + ")", {
      font: '18px Arial',
      fill: '#ffffff',
      align: 'center'
    });
    this.pageText.setOrigin(0.5);
    this.scrollingMap = this.add.tileSprite(0, 0, gameOptions.colors.length * this.width, this.height, "transp");
    this.scrollingMap.setOrigin(0);
    this.scrollingMap.setInteractive();
    this.input.setDraggable(this.scrollingMap);

    this.currentPage = 0;
    this.pageSelectors = [];

    const rowLen = gameOptions.thumbWidth * gameOptions.columns + gameOptions.spacing * (gameOptions.columns - 1);
    const lefMargin = (this.width - rowLen) / 2 + gameOptions.thumbWidth / 2;
    const colHeight = gameOptions.thumbHeight * gameOptions.rows + gameOptions.spacing * (gameOptions.rows - 1);
    const topMargin = (this.height - colHeight) / 2 + gameOptions.thumbHeight / 2;

    for (let i = 0; i < gameOptions.colors.length; i++) {
      for (let j = 0; j < gameOptions.columns; j++) {
        for (let k = 0; k < gameOptions.rows; k++) {
          const x = i * this.width + lefMargin + j * (gameOptions.thumbWidth + gameOptions.spacing);
          const y = topMargin + k * (gameOptions.thumbHeight + gameOptions.spacing);
          const thumb = this.add.image(x, y, 'levelthumb');
          thumb.setTint(gameOptions.colors[i]);
          thumb.levelNumber = i * (gameOptions.rows * gameOptions.columns) + k * gameOptions.columns + j;
          thumb.setFrame(parseInt(this.stars[thumb.levelNumber]) + 1);
          this.itemGroup.add(thumb);

          const levelText = this.add.text(thumb.x, thumb.y - 12, thumb.levelNumber, {
            font: '24px Arial',
            fill: '#000000'
          });
          levelText.setOrigin(0.5);
          this.itemGroup.add(levelText);
        }
      }
      const x = this.width / 2 + (i - Math.floor(gameOptions.colors.length / 2) + 0.5 * (1 - gameOptions.colors.length % 2)) * 40;
      const y = this.height - 40;
      this.pageSelectors[i] = this.add.sprite(x, y, 'levelpages');
      this.pageSelectors[i].setInteractive();
      this.pageSelectors[i].on('pointerdown', (p) => {
        if (this.canMove) {
          const diff = this.pageIndex - this.currentPage;
          this.changePage(diff);
          this.canMove = false;
        }
      });
      this.pageSelectors[i].pageIndex = i;
      this.pageSelectors[i].tint = gameOptions.colors[i];
      if (i == this.currentPage) {
        this.pageSelectors[i].scaleY = 1;
      } else {
        this.pageSelectors[i].scaleY = 0.5;
      }
    }

    this.input.on('dragstart', (pointer, gameObject) => {
      gameObject.startPosition = gameObject.x;
      gameObject.currentPosition = gameObject.x;
    });

    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      if (dragX <= 10 && dragX >= -gameObject.width + this.width - 10) {
        gameObject.x = dragX;
        const dt = gameObject.x - gameObject.currentPosition;
        gameObject.currentPosition = dragX;
        this.itemGroup.children.iterate((item) => {
          item.x += dt;
        });
      }
    });

    this.input.on('dragend', (pointer, gameObject) => {
      this.canMove = false;
      const dt = gameObject.startPosition - gameObject.x;
      if (dt === 0) {
        this.canMove = true;
        this.itemGroup.children.iterate((item) => {
          if (item.texture.key == "levelthumb") {
            const boundingBox = item.getBounds();
            if (Phaser.Geom.Rectangle.Contains(boundingBox, pointer.x, pointer.y) && item.frame.name > 0) {
              this.scene.start("PlayLevel", {
                level: item.levelNumber,
                stars: this.stars
              });
            }
          }
        });
      }
      if (dt > this.width / 8) {
        this.changePage(1);
      } else {
        if (dt > this.width / 8) {
          this.changePage(-1);
        } else {
          this.changePage(0);
        }
      }
    });
  }

  changePage(page) {
    this.currentPage += page;
    for (let i = 0; i < gameOptions.colors.length; i++) {
      if (i === this.currentPage) {
        this.pageSelectors[i].scaleY = 1;
      } else {
        this.pageSelectors[i].scaleY = 0.5;
      }
    }
    this.pageText.text = "Swipe to select level page (" + (this.currentPage + 1).toString() + " / " + gameOptions.colors.length + ")";
    let currentPosition = this.scrollingMap.x;
    this.tweens.add({
      targets: this.scrollingMap,
      x: this.currentPage * -this.width,
      duration: 300,
      ease: 'Cubic.easeOut',
      onUpdate: (t, target) => {
        const dt = target.x - currentPosition;
        currentPosition = target.x;
        this.itemGroup.children.iterate((item) => {
          item.x += dt;
        })
      },
      onComplete: (t) => {
        this.canMove = true;
      }
    });
  }
}

class PlayLevel extends Phaser.Scene {
  constructor() {
    super("PlayLevel");
  }
  init(data) {
    this.level = data.level;
    this.stars = data.stars;
  }
  create() {
    this.add.text(game.config.width / 2, 20, "Play level " + this.level.toString(), {
      font: "32px Arial",
      color: "#ffffff"
    }).setOrigin(0.5);
    var failLevel = this.add.text(20, 60, "Fail level", {
      font: "48px Arial",
      color: "#ff0000"
    });
    failLevel.setInteractive();
    failLevel.on("pointerdown", function () {
      this.scene.start("PlayGame");
    }, this);
    var oneStarLevel = this.add.text(20, 160, "Get 1 star", {
      font: "48px Arial",
      color: "#ff8800"
    });
    oneStarLevel.setInteractive();
    oneStarLevel.on("pointerdown", function () {
      this.stars[this.level] = Math.max(this.stars[this.level], 1);
      if (this.stars[this.level + 1] != undefined && this.stars[this.level + 1] == -1) {
        this.stars[this.level + 1] = 0;
      }
      localStorage.setItem(gameOptions.localStorageName, this.stars.toString());
      this.scene.start("PlayGame");
    }, this);
    var twoStarsLevel = this.add.text(20, 260, "Get 2 stars", {
      font: "48px Arial",
      color: "#ffff00"
    });
    twoStarsLevel.setInteractive();
    twoStarsLevel.on("pointerdown", function () {
      this.stars[this.level] = Math.max(this.stars[this.level], 2);
      if (this.stars[this.level + 1] != undefined && this.stars[this.level + 1] == -1) {
        this.stars[this.level + 1] = 0;
      }
      localStorage.setItem(gameOptions.localStorageName, this.stars.toString());
      this.scene.start("PlayGame");
    }, this);
    var threeStarsLevel = this.add.text(20, 360, "Get 3 stars", {
      font: "48px Arial",
      color: "#00ff00"
    });
    threeStarsLevel.setInteractive();
    threeStarsLevel.on("pointerdown", function () {
      this.stars[this.level] = 3;
      if (this.stars[this.level + 1] != undefined && this.stars[this.level + 1] == -1) {
        this.stars[this.level + 1] = 0;
      }
      localStorage.setItem(gameOptions.localStorageName, this.stars.toString());
      this.scene.start("PlayGame");
    }, this);
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
