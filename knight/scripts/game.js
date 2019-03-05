let gameOptions = {
  gameWidth: 800,    // game width, in pixels
  gameHeight: 1300,   // game height, in pixels
  tileSize: 100,     // tile size, in pixels
  fieldSize: 8, // field size, field should be a square to allow a smooth gameplay
  colors: [0xff0000, 0x00ff00, 0x0000ff, 0xffff00] // tile colors
}

const _HERO = 1;
const _KEY = 2;
const _LOCKEDDOOR = 3;
const _UNLOCKEDDOOR = 4;

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
    this.load.spritesheet('tiles', '/knight/assets/tiles.png', {
      frameWidth: gameOptions.tileSize,
      frameHeight: gameOptions.tileSize
    });
    this.load.image('rotate', '/knight/assets/rotate.png');
  }

  create() {
    this.tileStartX = -gameOptions.tileSize * gameOptions.fieldSize / 2;
    this.tileStartY = -gameOptions.tileSize * gameOptions.fieldSize / 2;
    this.createLevel();

    var graphics = this.add.graphics({
      x: 0,
      y: 0,
    });
    graphics.lineStyle(5, 0xFF00FF, 1.0);
    graphics.beginPath();
    this.boardTop = this.tileGroup.y - (gameOptions.fieldSize / 2) * gameOptions.tileSize;
    console.log('boardTop', this.boardTop);
    graphics.moveTo(0, this.boardTop);
    graphics.lineTo(gameOptions.gameWidth, this.boardTop);
    graphics.closePath();
    graphics.strokePath();


    this.input.on('pointerdown', this.pickTile, this);
  }

  pickTile(pointer) {
    if (this.canPick) {
      // determining x and y position of the input inside tileGroup
      let posX = pointer.x - this.tileGroup.x + gameOptions.tileSize * gameOptions.fieldSize / 2;
      let posY = pointer.y - this.tileGroup.y + gameOptions.tileSize * gameOptions.fieldSize / 2;

      // transforming coordinates into actual rows and columns
      let pickedRow = Math.floor(posY / gameOptions.tileSize);
      let pickedCol = Math.floor(posX / gameOptions.tileSize);

      if (pickedRow >= 0 && pickedCol >= 0 && pickedRow < gameOptions.fieldSize && pickedCol < gameOptions.fieldSize) {
        let pickedTile = this.tilesArray[pickedRow][pickedCol];

        // the most secure way to have a clean and empty array
        this.filled = [];
        this.filled.length = 0;
        // performing a flood fill on the selected tile
        // this will populate "filled" array
        this.floodFill(pickedTile.coordinate, pickedTile.value);

        // do we have more than one tile in the array?
        if (this.filled.length > 1) {
          // ok, this is a valid move and player won't be able to pick another tile until all animations have been played
          this.canPick = false;
          this.destoryTiles();
        }
      }
    }
  }

  floodFill(p, n) {
    if (p.x < 0 || p.y < 0 || p.x >= gameOptions.fieldSize || p.y >= gameOptions.fieldSize) {
      return;
    }
    if (!this.tilesArray[p.y][p.x].isEmpty && this.tilesArray[p.y][p.x].value == n && !this.pointInArray(p)) {
      this.filled.push(p);
      this.floodFill(new Phaser.Geom.Point(p.x + 1, p.y), n);
      this.floodFill(new Phaser.Geom.Point(p.x - 1, p.y), n);
      this.floodFill(new Phaser.Geom.Point(p.x, p.y + 1), n);
      this.floodFill(new Phaser.Geom.Point(p.x, p.y - 1), n);
    }
  }

  pointInArray(p) {
    for (let i = 0; i < this.filled.length; i++) {
      if (this.filled[i].x == p.x && this.filled[i].y == p.y) {
        return true;
      }
    }
    return false;
  }

  // this function will destroy all tiles we can find in "filled" array
  destoryTiles() {

    // looping through the array
    let totalTweens = this.filled.length;
    for (let i = 0; i < this.filled.length; i++) {
      // fading tile out with a tween
      this.tweens.add({
        targets: [this.tilesArray[this.filled[i].y][this.filled[i].x].tileSprite],
        alpha: 0,
        duration: 300,
        onComplete: (tween) => {
          totalTweens--;
          // we don't know how many tiles we have already removed, so counting the tweens
          // currently in use is a good way, at the moment
          // if this was the last tween (we only have one tween running, this one)
          if (totalTweens === 1) {
            this.fillVerticleHoles();
          }
        }
      })
      // placing the sprite in the array of sprites to be recycled
      this.tilePool.push(this.tilesArray[this.filled[i].y][this.filled[i].x].tileSprite);
      // now the tile is empty
      this.tilesArray[this.filled[i].y][this.filled[i].x].isEmpty = true;
    }
  }

  // this function will make tiles fall down
  fillVerticleHoles() {
    // filled is a variable which tells us if we filled a hole
    let filled = false;

    // looping through the entire gamefield
    for (let i = gameOptions.fieldSize - 2; i >= 0; i--) {
      for (let j = 0; j < gameOptions.fieldSize; j++) {
        // if we have a tile...
        if (!this.tilesArray[i][j].isEmpty) {
          // let's count how many holes we can find below this tile
          let holesBelow = this.countSpacesBelow(i, j);
          // if holesBelow is greater than zero...
          if (holesBelow) {
            // we filled a hole, or at least we are about to do it
            filled = true;
            // function to move down a tile at column "j" from "i" to "i + holesBelow" row
            this.moveDownTile(i, j, i + holesBelow, false);
          }
        }
      }
    }

    // if we looped trough all tiles but did not fill anything...
    if (!filled) {
      // let's see if there are horizontal holes to fill
      this.canPick = true;
    }
    this.printEmptyTiles();
    this.printTilePool();

    // now it's time to reuse tiles saved in the pool (tilePool array),
    // let's start with a loop through each column
    for (let i = 0; i < gameOptions.fieldSize; i++) {
      // counting how many empty spaces we have in each column
      let topHoles = this.countSpacesBelow(-1, i);
      // then for each empty space...
      for (let j = topHoles - 1; j >= 0; j--) {
        // get the tile to be reused from the pool
        let reusedTile = this.tilePool.shift();
        let offsetY = (j - topHoles) * gameOptions.tileSize + gameOptions.tileSize / 2;
        let offsetX = (i * gameOptions.tileSize + gameOptions.tileSize / 2);
        // y position is above the field, to make tile "fall down"
        reusedTile.y = this.tileStartY + offsetY;
        // x position is just the column
        reusedTile.x = this.tileStartX + offsetX;
        // setting a new tile value
        var tileValue = Phaser.Math.RND.integerInRange(0, gameOptions.colors.length - 1);
        // tinting the tile with the new color
        reusedTile.tint = gameOptions.colors[tileValue];
        // setting alpha back to 1
        reusedTile.alpha = 1;

        // setting the item with the new values
        this.tilesArray[j][i] = {
          tileSprite: reusedTile,
          isEmpty: false,
          coordinate: new Phaser.Geom.Point(i, j),
          value: tileValue
        }
        // and finally make the tile fall down
        this.moveDownTile(0, i, j, true);
      }
    }
  }

  countSpacesBelow(row, col) {
    let result = 0;
    for (let i = row + 1; i < gameOptions.fieldSize; i++) {
      if (this.tilesArray[i][col].isEmpty) {
        result++;
      }
    }
    return result;
  }

  moveDownTile(fromRow, fromCol, toRow, justMove) {
    // a tile can be just moved (when it's a "new" tile falling from above) or
    // must be moved updating the game field (when it's an "old" tile falling down from its previous position)
    // "justMove" flag handles this operation
    if (!justMove) {
      // saving the tile itself and its value in temporary variables
      let tileToMove = this.tilesArray[fromRow][fromCol].tileSprite;
      let tileValue = this.tilesArray[fromRow][fromCol].value;

      // adjusting tilesArray items actually creating the tile in the new position...
      this.tilesArray[toRow][fromCol] = {
        tileSprite: tileToMove,
        isEmpty: false,
        coordinate: new Phaser.Geom.Point(fromCol, toRow),
        value: tileValue
      }
      // the old place now is set to null
      this.tilesArray[fromRow][fromCol].isEmpty = true;
    }
    // distance to travel, in pixels, by the tile
    let distanceToTravel = (toRow * gameOptions.tileSize - gameOptions.tileSize / 2) - this.tilesArray[toRow][fromCol].tileSprite.y
    // a tween manages the movement
    const toY = this.tileStartY + toRow * gameOptions.tileSize + gameOptions.tileSize / 2;
    this.tweens.add({
      targets: [this.tilesArray[toRow][fromCol].tileSprite],
      y: toY,
      duration: distanceToTravel / 2,
      onComplete: (tween) => {
        this.canPick = true;
      }
    })
  }

  createLevel() {
    // canPick tells if we can pick a tile, we start with "true" has at the moment a tile can be picked
    this.canPick = true;

    // tiles are saved in an array called tilesArray
    this.tilesArray = [];
    this.specialItemCandidates = [];

    // this group will contain all tiles
    this.tileGroup = this.add.container();
    this.tileGroup.x = this.sys.game.config.width / 2;
    this.tileGroup.y = this.sys.game.config.height / 2;
    // two loops to create a grid made by "gameOptions.fieldSize" x "gameOptions.fieldSize" columns
    for (var i = 0; i < gameOptions.fieldSize; i++) {
      this.tilesArray[i] = [];
      for (var j = 0; j < gameOptions.fieldSize; j++) {
        // this function adds a tile at row "i" and column "j"
        this.addTile(i, j);
        this.specialItemCandidates.push(new Phaser.Geom.Point(i, j));
      }
    }
    // choosing a random location for the hero
    let heroLocation = Phaser.Utils.Array.RemoveRandomElement(this.specialItemCandidates);
    // adjusting tile frame
    this.tilesArray[heroLocation.y][heroLocation.x].tileSprite.setFrame(_HERO);
    this.tilesArray[heroLocation.y][heroLocation.x].tileSprite.tint = 0xffffff;
    // same thing with the key, we just don't want it to be too close to the hero
    do {
      var keyLocation = Phaser.Utils.Array.RemoveRandomElement(this.specialItemCandidates);
    } while (this.isAdjacent(heroLocation, keyLocation));
    this.tilesArray[keyLocation.y][keyLocation.x].tileSprite.setFrame(_KEY);
    this.tilesArray[keyLocation.y][keyLocation.x].value = 10 + _KEY;
    this.tilesArray[keyLocation.y][keyLocation.x].tileSprite.tint = 0xffffff;

    // same thing with the locked door
    do {
      var lockedDoorLocation = Phaser.Utils.Array.RemoveRandomElement(this.specialItemCandidates);
    } while (this.isAdjacent(heroLocation, lockedDoorLocation));
    this.tilesArray[lockedDoorLocation.y][lockedDoorLocation.x].tileSprite.setFrame(_LOCKEDDOOR);
    this.tilesArray[lockedDoorLocation.y][lockedDoorLocation.x].value = 10 + _LOCKEDDOOR;
    this.tilesArray[lockedDoorLocation.y][lockedDoorLocation.x].tileSprite.tint = 0xffffff;

    // we are centering the group, both horizontally and vertically, in the canvas
    let fieldWidth = gameOptions.tileSize * gameOptions.fieldSize;
    // placing the group in the middle of the canvas


    // we will draw a mask to hide blocks falling from above. Mask needs to have the same size and position as the group
    // this.tileMask = this.add.graphics(this.tileGroup.x, this.tileGroup.y);
    // this.tileMask.fillStyle(0xffff00, 1.0);
    // this.tileMask.fillRect(0, 0, fieldWidth, fieldWidth);
    // this.tileGroup.mask = this.tileMask;
    // this.tileMask.visible = false;

    // button to rotate the game field to the left
    this.rotateLeft = this.add.sprite(this.sys.game.config.width / 4, this.tileGroup.y + fieldWidth / 2 + gameOptions.tileSize, "rotate").setInteractive();
    this.rotateLeft.on('pointerdown', (pointer) => {
      this.rotateBoard(-90);
    }, this);
    this.rotateRight = this.add.sprite(3 * this.sys.game.config.width / 4, this.tileGroup.y + fieldWidth / 2 + gameOptions.tileSize, "rotate").setInteractive();
    this.rotateRight.on('pointerdown', (pointer) => {
      this.rotateBoard(90);
    }, this);
    this.rotateRight.scaleX *= -1;

    this.tilePool = [];
  }

  isAdjacent(p1, p2) {
    return (Math.abs(p1.x - p2.x) < 2) && (Math.abs(p1.y - p2.y) < 2);
  }

  printTilePool() {
    console.log('tilePool', this.tilePool.length);
  }

  printEmptyTiles() {
    let totalEmpty = 0;
    for (let i = 0; i < gameOptions.fieldSize; i++) {
      for (let j = 0; j < gameOptions.fieldSize; j++) {
        if (this.tilesArray[i][j].isEmpty) {
          totalEmpty += 1;
        }
      }
    }
    console.log('totalEmpty', totalEmpty);
  }

  addTile(row, col) {
    // determining x and y tile position according to tile size
    let tileXPos = this.tileStartX + col * gameOptions.tileSize + gameOptions.tileSize / 2;
    let tileYPos = this.tileStartY + row * gameOptions.tileSize + gameOptions.tileSize / 2;

    // tile is added as an image
    let theTile = this.add.sprite(tileXPos, tileYPos, "tiles", 0);
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
    if (this.canPick) {
      this.canPick = false;
      // removing tileGroup mask to show all tiles while rotating
      this.tileGroup.mask = null;

      this.tweens.add({
        targets: [this.tileGroup],
        angle: angle,
        duration: 1000,
        ease: 'Bounce.easeOut',
        onComplete: (tween) => {
          // rotate the array by -a degrees
          this.tilesArray = Phaser.Utils.Array.Matrix.RotateMatrix(this.tilesArray, -angle);
          // this loop will reposition all tiles and set their "coordinate" property
          for (let i = 0; i < gameOptions.fieldSize; i++) {
            for (let j = 0; j < gameOptions.fieldSize; j++) {
              this.tilesArray[i][j].tileSprite.angle += 90;
              this.tilesArray[i][j].tileSprite.x = this.tileStartX + j * gameOptions.tileSize + gameOptions.tileSize / 2;
              this.tilesArray[i][j].tileSprite.y = this.tileStartY + i * gameOptions.tileSize + gameOptions.tileSize / 2;
              this.tilesArray[i][j].coordinate = new Phaser.Geom.Point(j, i);
            }
          }

          // resettig group angle
          this.tileGroup.angle = 0;
          this.canPick = true;
        }
      })
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
