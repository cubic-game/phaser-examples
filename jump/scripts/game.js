let gameOptions = {
}

const captionStyle = {
  fill: '#7fdbff',
  fontFamily: 'monospace',
  lineSpacing: 4
};

const captionTextFormat = (
  'Total:    %1\n' +
  'Max:      %2\n' +
  'Active:   %3\n' +
  'Inactive: %4\n' +
  'Used:     %5\n' +
  'Free:     %6\n' +
  'Full:     %7\n'
);

window.onload = function () {
  let gameConfig = {
    type: Phaser.AUTO,
    parent: 'phaser-app',
    width: 300,
    height: 500,
    backgroundColor: 0x7ec0ee,
    scene: GameScene,
    physics: {
      default: 'arcade',
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

  init() {
    this.width = this.sys.game.config.width;
    this.height = this.sys.game.config.height;
  }

  preload() {
    this.load.image('hero', '/jump/assets/dude.png' );
    this.load.image('pixel', '/jump/assets/pixel_1.png' );
  }

  create() {
    this.createPlatforms();
    this.createHero();

    // information
    this.caption = this.add.text(16, 16, '');
    // input
    this.cursors = this.input.keyboard.createCursorKeys();

    // collision detection
    this.physics.add.collider(this.platforms, this.hero);
  }

  createPlatforms() {
    this.platforms = this.physics.add.staticGroup({defaultKey: 'pixel', maxSize: 10});

    const basePlatform = this.spawPlatform(0, this.height - 16, this.width);
    basePlatform.setOrigin(0);
    basePlatform.refreshBody();

    for (let i = 0; i < 9; i++) {
      const posX = Phaser.Math.RND.integerInRange(50, this.width - 60);
      const posY = this.height - 100 - 100 * i;

      const platform = this.spawPlatform(posX, posY, 60);
      platform.refreshBody();
    }
  }

  spawPlatform(x, y, w) {
    const platform = this.platforms.get(x, y);
    platform.scaleX = w;
    platform.scaleY = 16;
    platform.setOrigin(0);

    platform
      .setActive(true)
      .setVisible(true)
    return platform;
  }

  createHero() {
    this.hero = this.physics.add.sprite(this.width / 2, this.height - 50, 'hero');
    this.hero.prevY = this.hero.y;
    this.hero.changeY = 0;
    this.hero.setGravityY(500);
    this.hero.setBounce(0.2);
    this.hero.setCollideWorldBounds(true);
  }

  update() {
    this.caption.setText(Phaser.Utils.String.Format(captionTextFormat, [
      this.platforms.getLength(),
      this.platforms.maxSize,
      this.platforms.countActive(true),
      this.platforms.countActive(false),
      this.platforms.getTotalUsed(),
      this.platforms.getTotalFree(),
      this.platforms.isFull()
    ]));

    if (this.cursors.left.isDown) {
      this.hero.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.hero.setVelocityX(160);
    } else {
      this.hero.setVelocityX(0);
    }

    if (this.cursors.up.isDown && this.hero.body.touching.down) {
      this.hero.setVelocityY(-330);
    }

    if (this.hero.prevY != this.hero.y) {
      this.hero.changeY = this.hero.y - this.hero.prevY;
      this.hero.prevY = this.hero.y;
      this.cameras.main.scrollY += this.hero.changeY;
      this.caption.y += this.hero.changeY;

      this.printMainCamreaInfo();
    }

    // check plaforms

  }

  printMainCamreaInfo() {
    const camera = this.cameras.main;
    console.log('camera.x: ' + camera.x);
    console.log('camera.y: ' + camera.y);
    console.log('camera.scrollX: ' + camera.scrollX);
    console.log('camera.scrollY: ' + camera.scrollY);
    console.log('camera.width: ' + camera.width);
    console.log('camera.height: ' + camera.height);
    console.log('camera.worldView', this.cameras.main.worldView);
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
