let gameOptions = {
  gameWidth: 800,    // game width, in pixels
  gameHeight: 1300,   // game height, in pixels
  tileSize: 100,     // tile size, in pixels
  fieldSize: 8, // field size, field should be a square to allow a smooth gameplay
  colors: [0xff0000, 0x00ff00, 0x0000ff, 0xffff00] // tile colors
}

window.onload = function () {
  let gameConfig = {
    type: Phaser.SHOW_ALL,
    parent: 'phaser-app',
    width: gameOptions.gameWidth,
    height: gameOptions.gameHeight,
    backgroundColor: 0x222222,
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

  preload() {
    this.load.image('tile', '/knight/assets/tile.png');
    this.load.image('rotate', '/knight/assets/rotate.png');
  }

  create() {
    this.createLevel();
    this.input.on('pointerdown', this.pickTile, this);
  }

  pickTile() {

  }

  createLevel() {
    // canPick tells if we can pick a tile, we start with "true" has at the moment a tile can be picked
    this.canPick = true;

    // tiles are saved in an array called tilesArray
    this.tilesArray = [];

    // this group will contain all tiles
    this.tileGroup = this.add.container();

    // two loops to create a grid made by "gameOptions.fieldSize" x "gameOptions.fieldSize" columns
    for (var i = 0; i < gameOptions.fieldSize; i++) {
      this.tilesArray[i] = [];
      for (var j = 0; j < gameOptions.fieldSize; j++) {
        // this function adds a tile at row "i" and column "j"
        this.addTile(i, j);
      }
    }
    // we are centering the group, both horizontally and vertically, in the canvas
    var fieldWidth = gameOptions.tileSize * gameOptions.fieldSize;
    // placing the group in the middle of the canvas
    this.tileGroup.x = (this.sys.game.config.width - fieldWidth) / 2;
    this.tileGroup.y = (this.sys.game.config.height - fieldWidth) / 2;

    // we will draw a mask to hide blocks falling from above. Mask needs to have the same size and position as the group
    // this.tileMask = this.add.graphics(this.tileGroup.x, this.tileGroup.y);
    // this.tileMask.fillStyle(0xffff00, 1.0);
    // this.tileMask.fillRect(0, 0, fieldWidth, fieldWidth);
    // this.tileGroup.mask = this.tileMask;
    // this.tileMask.visible = false;

    // button to rotate the game field to the left
    this.rotateLeft = this.add.sprite(this.sys.game.config.width / 4, this.tileGroup.y + fieldWidth + gameOptions.tileSize, "rotate").setInteractive();
    this.rotateLeft.on('pointerdown', (pointer) => {
      this.rotateBoard(-90);
    }, this);
    this.rotateRight = this.add.sprite(3 * this.sys.game.config.width / 4, this.tileGroup.y + fieldWidth + gameOptions.tileSize, "rotate").setInteractive();
    this.rotateRight.on('pointerdown', (pointer) => {
      this.rotateBoard(90);
    }, this)
    this.tilePool = [];
  }

  addTile(row, col) {
    // determining x and y tile position according to tile size
    let tileXPos = col * gameOptions.tileSize + gameOptions.tileSize / 2;
    let tileYPos = row * gameOptions.tileSize + gameOptions.tileSize / 2;

    // tile is added as an image
    let theTile = this.add.sprite(tileXPos, tileYPos, "tile");
    // setting tile registration point to its center
    theTile.setOrigin(0.5);

    // adjusting tile width and height according to tile size
    theTile.width = gameOptions.tileSize;
    theTile.height = gameOptions.tileSize;

    // time to assign the tile a random value, which is also a random color
    let tileValue = Phaser.Math.RND.integerInRange(0, gameOptions.colors.length - 1);

    // tinting the tile
    theTile.tint = gameOptions.colors[tileValue];

    // adding the image to "tilesArray" array, creating an object
    this.tilesArray[row][col] = {
      tileSprite: theTile, // tile image
      isEmpty: false, // is it an empty tile? not at the moment
      coordinate: new Phaser.Geom.Point(col, row), // storing tile coordinate, useful during flood fill
      value: tileValue // the value (color) of the tile
    };

    // also adding it to "tileGroup" group
    this.tileGroup.add(theTile);
  }

  rotateBoard(angle) {
    this.tileGroup.setAngle(45);
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
