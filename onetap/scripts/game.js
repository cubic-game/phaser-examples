let gameOptions = {
  gravity: 1,
  maxItemsPerLevel: 30,
  maxIterations: 10,
  minItemsDistance: 160
}

const HERO = 0;
const COIN = 1;
const SKULL = 2;

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
    this.load.spritesheet("items", "/onetap/assets/items.png", {
      frameWidth: 128,
      frameHeight: 128
    });
  }

  create() {
    this.canSummonHero = true;
    this.matter.world.update30Hz();
    this.matter.world.setBounds(0, -400, game.config.width, game.config.height + 800);

    this.createLevel();
    this.matter.world.on("collisionstart", function (e, b1, b2) {
      switch (b1.label) {
        case COIN:
          b1.gameObject.visible = false;
          this.matter.world.remove(b1);
          break;
        case SKULL:
          if (b1.gameObject.y > b2.gameObject.y) {
            b1.gameObject.visible = false;
            this.matter.world.remove(b1);
          }
          else {
            this.cameras.main.flash(50, 255, 0, 0);
          }
          break;
        default:
          if (b2.gameObject.y > game.config.height) {
            this.scene.start("GameScene");
          }
          else {
            if (b2.gameObject.y > 0) {
              this.cameras.main.flash(50, 255, 0, 0);
            }
          }
      }
    }, this);

    this.input.on("pointerdown", this.releaseHero, this);
  }

  createLevel() {
    this.gameItems = this.add.group();
    let spawnRectangle = new Phaser.Geom.Rectangle(80, 250, game.config.width - 160, game.config.height - 350);
    for (let i = 0; i < gameOptions.maxItemsPerLevel; i++) {
      let iterations = 0;
      let point;

      do {
        point = Phaser.Geom.Rectangle.Random(spawnRectangle);
        iterations++;
      } while (iterations < gameOptions.maxIterations && this.itemOverlap(point));
      if (iterations == gameOptions.maxIterations) {
        break;
      } else {
        let item = this.matter.add.image(point.x, point.y, "items");
        item.setCircle();
        item.setStatic(true);
        this.gameItems.add(item);

        if (Phaser.Math.Between(0, 99) > 50) {
          item.setFrame(1);
          item.body.label = COIN;
        } else {
          item.setFrame(2);
          item.body.label = SKULL;
        }
      }
    }
  }

  itemOverlap(point) {
    let overlap = false;
    this.gameItems.getChildren().forEach(function (item) {
      if (item.getCenter().distance(point) < gameOptions.minItemsDistance) {
        overlap = true
      }
    });
    return overlap;
  }

  releaseHero(e) {
    console.log('release point: ', e.x, e.y);
    if (this.canSummonHero) {
      this.canSummonHero = false;
      let item = this.matter.add.image(e.x, -200, "items");
      item.setCircle();
      item.setBounce(1);
      item.body.label = HERO;
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
