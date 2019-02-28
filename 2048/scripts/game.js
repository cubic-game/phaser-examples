let gameOptions = {
  tileSize: 200,
  tweenSpeed: 50,
  tileSpacing: 20
}

window.onload = function () {
  let gameConfig = {
    type: Phaser.AUTO,
    parent: 'phaser-app',
    width: gameOptions.tileSize * 4 + gameOptions.tileSpacing * 5,
    height: gameOptions.tileSize * 4 + gameOptions.tileSpacing * 5,
    backgroundColor: 0xecf0f1,
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
    // this.load.image("tile", "/2048/assets/tile.png");
    this.load.spritesheet("tiles", "/2048/assets/tiles.png", {
      frameWidth: gameOptions.tileSize,
      frameHeight: gameOptions.tileSize
    });
  }

  create() {
    this.initBoard();
    this.createListeners();
    this.canMove = false;
    this.addTwo();
    this.addTwo();
  }

  initBoard() {
    this.fieldArray = [];
    this.fieldGroup = this.add.group();

    for (let i = 0; i < 4; i++) {
      this.fieldArray[i] = [];
      for (let j = 0; j < 4; j++) {
        let two = this.add.sprite(this.tileDestination(j), this.tileDestination(i), "tiles");
        two.alpha = 0;
        two.visible = false;
        this.fieldGroup.add(two);
        this.fieldArray[i][j] = {
          tileValue: 0,
          tileSprite: two,
          canUpgrade: true
        }
      }
    }
  }

  createListeners() {
    this.input.keyboard.on('keydown', this.handleKey, this);
    this.input.on('pointerup', this.endSwipe, this);
  }

  handleKey() {

  }

  endSwipe(e) {
    const swipeTime = e.upTime - e.downTime;
    const swipe = new Phaser.Geom.Point(e.upX - e.downX, e.upY - e.downY);
    const swipeMagnitude = Phaser.Geom.Point.GetMagnitude(swipe);
    const swipeNormal = new Phaser.Geom.Point(swipe.x / swipeMagnitude, swipe.y / swipeMagnitude);
    if (swipeMagnitude > 20 && swipeTime < 1000 && (Math.abs(swipeNormal.y) > 0.8 || Math.abs(swipeNormal.x) > 0.8)) {
      let children = this.fieldGroup.getChildren();

      if (swipeNormal.x > 0.8) {
        for (let i = 0; i < children.length; i++) {
          children[i].depth = game.config.width - children[i].x;
        }
        this.handleMove(0, 1);
      }
      if (swipeNormal.x < -0.8) {
        for (let i = 0; i < children.length; i++) {
          children[i].depth = children[i].x;
        }
        this.handleMove(0, -1);
      }
      if (swipeNormal.y > 0.8) {
        for (let i = 0; i < children.length; i++) {
          children[i].depth = game.config.height - children[i].y;
        }
        this.handleMove(1, 0);
      }
      if (swipeNormal.y < -0.8) {
        for (let i = 0; i < children.length; i++) {
          children[i].depth = children[i].y;
        }
        this.handleMove(-1, 0);
      }
    }
  }

  handleMove(deltaRow, deltaCol) {
    this.canMove = false;
    let somethingMoved = false;
    this.movingTiles = 0;

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        let colToWatch = deltaCol == 1 ? (4 - 1) - j : j;
        let rowToWatch = deltaRow == 1 ? (4 - 1) - i : i;

        let tileValue = this.fieldArray[rowToWatch][colToWatch].tileValue;
        if (tileValue != 0) {
          let colSteps = deltaCol;
          let rowSteps = deltaRow;

          if (this.isInsideBoard(rowToWatch + rowSteps, colToWatch + colSteps) && this.fieldArray[rowToWatch + rowSteps][colToWatch + colSteps].tileValue == 0) {
            colSteps += deltaCol;
            rowSteps += deltaRow;
          }
          // can combine
          if (this.isInsideBoard(rowToWatch + rowSteps, colToWatch + colSteps) && (this.fieldArray[rowToWatch + rowSteps][colToWatch + colSteps].tileValue == tileValue) && this.fieldArray[rowToWatch + rowSteps][colToWatch + colSteps].canUpgrade && this.fieldArray[rowToWatch][colToWatch].canUpgrade) {
            this.fieldArray[rowToWatch + rowSteps][colToWatch + colSteps].tileValue++;
            this.fieldArray[rowToWatch + rowSteps][colToWatch + colSteps].canUpgrade = false;
            this.fieldArray[rowToWatch][colToWatch].tileValue = 0;
            this.moveTile(this.fieldArray[rowToWatch][colToWatch], rowToWatch + rowSteps, colToWatch + colSteps, Math.abs(rowSteps + colSteps), true);
            somethingMoved = true;
          } else {
            colSteps = colSteps - deltaCol;
            rowSteps = rowSteps - deltaRow;
            if (colSteps != 0 || rowSteps != 0) { // can't combine but moved
              this.fieldArray[rowToWatch + rowSteps][colToWatch + colSteps].tileValue = tileValue;
              this.fieldArray[rowToWatch][colToWatch].tileValue = 0;
              this.moveTile(this.fieldArray[rowToWatch][colToWatch], rowToWatch + rowSteps, colToWatch + colSteps, Math.abs(rowSteps + colSteps), false);
              somethingMoved = true;
            }
          }
        }
      }
    }

    if (!somethingMoved) {
      this.canMove = true;
    }
  }


  moveTile(tile, row, col, distance, changeNumber) {
    this.movingTiles++;
    this.tweens.add({
      targets: [tile.tileSprite],
      x: this.tileDestination(col),
      y: this.tileDestination(row),
      duration: gameOptions.tweenSpeed * distance,
      onComplete: function (tween) {
        tween.parent.scene.movingTiles--;
        if (changeNumber) {
          tween.parent.scene.transformTile(tile, row, col);
        }
        if (tween.parent.scene.movingTiles == 0) {
          tween.parent.scene.resetTiles();
          tween.parent.scene.addTwo();
        }
      }
    })
  }

  transformTile(tile, row, col) {
    this.movingTiles++;
    tile.tileSprite.setFrame(this.fieldArray[row][col].tileValue - 1);
    this.tweens.add({
      targets: [tile.tileSprite],
      scaleX: 1.1,
      scaleY: 1.1,
      duration: gameOptions.tweenSpeed,
      yoyo: true,
      repeat: 1,
      onComplete: function (tween) {
        tween.parent.scene.movingTiles--;
        if (tween.parent.scene.movingTiles == 0) {
          tween.parent.scene.resetTiles();
          tween.parent.scene.addTwo();
        }
      }
    })
  }

  resetTiles() {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        this.fieldArray[i][j].canUpgrade = true;
        this.fieldArray[i][j].tileSprite.x = this.tileDestination(j);
        this.fieldArray[i][j].tileSprite.y = this.tileDestination(i);
        if (this.fieldArray[i][j].tileValue > 0) {
          this.fieldArray[i][j].tileSprite.alpha = 1;
          this.fieldArray[i][j].tileSprite.visible = true;
          this.fieldArray[i][j].tileSprite.setFrame(this.fieldArray[i][j].tileValue - 1);
        }
        else {
          this.fieldArray[i][j].tileSprite.alpha = 0;
          this.fieldArray[i][j].tileSprite.visible = false;
        }
      }
    }
  }

  isInsideBoard(row, col) {
    return (row >= 0) && (col >= 0) && (row < 4) && (col < 4);
  }

  addTwo() {
    let emptyTiles = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (this.fieldArray[i][j].tileValue == 0) {
          emptyTiles.push({
            row: i,
            col: j
          })
        }
      }
    }

    let chosenTile = Phaser.Utils.Array.GetRandom(emptyTiles);
    this.fieldArray[chosenTile.row][chosenTile.col].tileValue = 1;
    this.fieldArray[chosenTile.row][chosenTile.col].tileSprite.visible = true;
    this.fieldArray[chosenTile.row][chosenTile.col].tileSprite.setFrame(0);

    this.tweens.add({
      targets: this.fieldArray[chosenTile.row][chosenTile.col].tileSprite,
      alpha: 1,
      duration: gameOptions.tweenSpeed,
      onComplete: function (tween) {
        tween.parent.scene.canMove = true;
      }
    })
  }

  tileDestination(pos) {
    return pos * (gameOptions.tileSize + gameOptions.tileSpacing) + gameOptions.tileSize / 2 + gameOptions.tileSpacing;
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
