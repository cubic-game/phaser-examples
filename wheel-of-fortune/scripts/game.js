let gameOptions = {
  // slices configuration
  slices: [
    {
      degrees: 40,
      startColor: 0xff0000,
      endColor: 0xff8800,
      rings: 3,
      iconFrame: 1,
      iconScale: 0.4,
      text: "BANANA"
    },
    {
      degrees: 60,
      startColor: 0x00ff00,
      endColor: 0x004400,
      rings: 200,
      iconFrame: 0,
      iconScale: 0.4,
      text: "PEAR"
    },
    {
      degrees: 125,
      startColor: 0xff00ff,
      endColor: 0x0000ff,
      rings: 10,
      iconFrame: 2,
      iconScale: 0.4,
      text: "ORANGE"
    },
    {
      degrees: 45,
      startColor: 0x666666,
      endColor: 0x999999,
      rings: 200,
      iconFrame: 3,
      iconScale: 0.4,
      text: "STRAWBERRY"
    },
    {
      degrees: 90,
      startColor: 0x000000,
      endColor: 0xffff00,
      rings: 1,
      iconFrame: 4,
      iconScale: 0.4,
      text: "CHERRY"
    }
  ],
  // wheel rotation duration range, in milliseconds
  rotationTimeRange: {
    min: 3000,
    max: 4500
  },
  // wheel rounds before it stops
  wheelRounds: {
    min: 2,
    max: 11
  },
  // degrees the wheel will rotate in the opposite direction before it stops
  backSpin: {
    min: 1,
    max: 4
  },
  // wheel radius, in pixels
  wheelRadius: 240,
  // color of stroke lines
  strokeColor: 0xffffff,
  // width of stroke lines
  strokeWidth: 5
}

window.onload = function () {
  let gameConfig = {
    type: Phaser.AUTO,
    parent: 'phaser-app',
    width: 750,
    height: 1334,
    backgroundColor: 0x000000,
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
    this.load.image('pin', '/wheel-of-fortune/assets/pin.png');
    // loading icons spritesheet
    this.load.spritesheet("icons", "/wheel-of-fortune/assets/icons.png", {
      frameWidth: 256,
      frameHeight: 256
    });
  }

  create() {
    let startDegrees = -90;
    // making a graphic object without adding it to the game
    var graphics = this.make.graphics({
      x: 0,
      y: 0,
      add: false
    });

    // adding a container to group wheel and icons
    this.wheelContainer = this.add.container(this.sys.game.config.width / 2, this.sys.game.config.height / 2);
    // array which will contain all icons
    let iconArray = [];
    // looping through each slice
    for (let i = 0; i < gameOptions.slices.length; i++) {
      let startColor = Phaser.Display.Color.ValueToColor(gameOptions.slices[i].startColor);
      let endColor = Phaser.Display.Color.ValueToColor(gameOptions.slices[i].endColor)

      for (let j = gameOptions.slices[i].rings; j > 0; j--) {
        // interpolate colors
        let ringColor = Phaser.Display.Color.Interpolate.ColorWithColor(startColor, endColor, gameOptions.slices[i].rings, j);
        // converting the interpolated color to 0xRRGGBB format
        let ringColorString = Phaser.Display.Color.RGBToString(Math.round(ringColor.r), Math.round(ringColor.g), Math.round(ringColor.b), 0, "0x");
        // setting fill style
        graphics.fillStyle(ringColorString, 1);
        // drawing the slice
        graphics.slice(gameOptions.wheelRadius + gameOptions.strokeWidth, gameOptions.wheelRadius + gameOptions.strokeWidth, j * gameOptions.wheelRadius / gameOptions.slices[i].rings, Phaser.Math.DegToRad(startDegrees), Phaser.Math.DegToRad(startDegrees + gameOptions.slices[i].degrees), false);
        // filling the slice
        graphics.fillPath();
      }
      // setting line style
      graphics.lineStyle(gameOptions.strokeWidth, gameOptions.strokeColor, 1);
      // drawing the biggest slice
      graphics.slice(gameOptions.wheelRadius + gameOptions.strokeWidth, gameOptions.wheelRadius + gameOptions.strokeWidth, gameOptions.wheelRadius, Phaser.Math.DegToRad(startDegrees), Phaser.Math.DegToRad(startDegrees + gameOptions.slices[i].degrees), false);
      graphics.strokePath();

      // adding the icon
      let icon = this.add.image(gameOptions.wheelRadius * 0.75 * Math.cos(Phaser.Math.DegToRad(startDegrees + gameOptions.slices[i].degrees / 2)), gameOptions.wheelRadius * 0.75 * Math.sin(Phaser.Math.DegToRad(startDegrees + gameOptions.slices[i].degrees / 2)), "icons", gameOptions.slices[i].iconFrame);

      // scaling the icon according to game preferences
      icon.scaleX = gameOptions.slices[i].iconScale;
      icon.scaleY = gameOptions.slices[i].iconScale;

      // rotating the icon
      icon.angle = startDegrees + gameOptions.slices[i].degrees / 2 + 90;

      // adding the icon to icon array
      iconArray.push(icon);

      startDegrees += gameOptions.slices[i].degrees;
    }
    // generate a texture called "wheel" from graphics data
    graphics.generateTexture("wheel", (gameOptions.wheelRadius + gameOptions.strokeWidth) * 2, (gameOptions.wheelRadius + gameOptions.strokeWidth) * 2);

    // creating a sprite with wheel image as if it was a preloaded image
    let wheel = this.add.sprite(0, 0, "wheel");
    // adding the wheel to the container
    this.wheelContainer.add(wheel);
    // adding all iconArray items to the container
    this.wheelContainer.add(iconArray);
    // adding the pin in the middle of the canvas
    this.pin = this.add.sprite(game.config.width / 2, game.config.height / 2, "pin");

    // adding the text field
    this.prizeText = this.add.text(game.config.width / 2, game.config.height - 20, "Spin the wheel", {
      font: "bold 32px Arial",
      align: "center",
      color: "white"
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
