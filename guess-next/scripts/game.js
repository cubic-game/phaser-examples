let gameOptions = {
  cardSheetWidth: 334,
  cardSheetHeight: 440,
  cardScale: 0.8
}

window.onload = function () {
  let gameConfig = {
    type: Phaser.AUTO,
    parent: 'phaser-app',
    width: 750,
    height: 1334,
    backgroundColor: 0xecf0f1,
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
    for (let i = 0; i < 10; i++) {
      this.load.spritesheet("cards" + i, "/guess-next/assets/cards" + i + ".png", {
        frameWidth: gameOptions.cardSheetWidth,
        frameHeight: gameOptions.cardSheetHeight
      });
    }
    this.load.spritesheet('info', '/guess-next/assets/info.png', {
      frameWidth: 500,
      frameHeight: 184
    });
    this.load.spritesheet('swipe', '/guess-next/assets/swipe.png', {
      frameWidth: 80,
      frameHeight: 130
    });
  }

  create() {
    this.infoGroup = this.add.group();
    this.infoGroup.visible = false;

    this.deck = Phaser.Utils.Array.NumberArray(0, 51);
    Phaser.Utils.Array.Shuffle(this.deck);
    // create card
    this.cardsInGame = [this.makeCard(0), this.makeCard(1)];
    this.nextCardIndex = 2;
    this.tweens.add({
      targets: this.cardsInGame[0],
      x: this.sys.game.config.width / 2,
      duration: 500,
      ease: 'Cubic.easeOut',
      onComplete: (t) => {
        this.infoGroup.visible = true;
      }
    });

    // add info
    const infoUp = this.add.sprite(this.sys.game.config.width / 2, this.sys.game.config.height / 6, 'info');
    const infoDown = this.add.sprite(this.sys.game.config.width / 2, this.sys.game.config.height * 5 / 6, 'info');
    infoDown.setFrame(1);
    this.infoGroup.add(infoUp);
    this.infoGroup.add(infoDown);

    const swipeUp = this.add.sprite(this.sys.game.config.width / 2, this.sys.game.config.height / 2 - gameOptions.cardSheetHeight / 2 - 20, "swipe");
    this.tweens.add({
      targets: swipeUp,
      y: swipeUp.y - 60,
      duration: 1000,
      repeat: -1
    });
    const swipeDown = this.add.sprite(this.sys.game.config.width / 2, this.sys.game.config.height / 2 + gameOptions.cardSheetHeight / 2 + 20, "swipe");
    this.tweens.add({
      targets: swipeDown,
      y: swipeDown.y + 60,
      duration: 1000,
      repeat: -1
    });
    swipeDown.setFrame(1);
    this.infoGroup.add(swipeUp);
    this.infoGroup.add(swipeDown);

    this.input.on('pointerdown', this.beginSwipe, this);
  }

  beginSwipe(e) {
    this.infoGroup.visible = false;
    this.input.removeListener('pointerdown', this.beginSwipe, this);
    this.input.on('pointerup', this.endSwipe, this);
  }

  endSwipe(e) {
    this.input.removeListener('pointerup', this.endSwipe, this);
    const swipeTime = e.timeUp - e.timeDown;
    const swipeVector = ;
    // const swipeMagnitude = Phaser.Geom.Point.
    const swipeNormal = ;

    if (swipeMagnitude > 20 && swipeTime < 1000 && Math.abs(swipeNormal.y) > 0.8) {
      if (swipeNormal.y > 0.8) {
        this.handleSwipe(1);
      }
      if (swipeNormal.y < -0.8) {
        this.handleSwipe(-1);
      }
    } else {
      this.input.on('pointerdown', this.beginSwipe, this);
    }
  }

  handleSwipe(dir) {
    const cardToMove = (this.nextCardIndex + 1) % 2;
    this.cardsInGame[cardToMove].y += dir * gameOptions.cardSheetHeight * gameOptions.cardScale * 1.1;

    this.tweens.add({
      targets: this.cardsInGame[cardToMove],
      x: this.sys.game.config.width / 2,
      duration: 500,
      ease: 'Cubic.easeOut',
      onComplete: (t) => {
        const newCard = this.deck[this.nextCardIndex - 1];
        const oldCard = this.deck[this.nextCardIndex - 2];

        if (((dir == -1) && ((newCard % 13 > oldCard % 13) || ((newCard % 13 == oldCard % 13) && (newCard > oldCard)))) || ((dir == 1) && ((newCard % 13 < oldCard % 13) || ((newCard % 13 == oldCard % 13) && (newCard < oldCard))))) {
          this.time.addEvent({
            delay: 1000,
            callback: this.moveCards(),
            callbackScope: this
          });
        } else {
          this.time.addEvent({
            delay: 1000,
            callback: this.fadeCards(),
            callbackScope: this
          });
        }
      }
    })
  }

  moveCards() {
    let cardToMove = this.nextCardIndex % 2;
    this.tweens.add({
      targets: this.cardsInGame[cardToMove],
      x: this.sys.game.width + gameOptions.cardSheetWidth * gameOptions.cardScale,
      duration: 500,
      ease: 'Cubic.easeOut',
    })
    cardToMove = (this.nextCardIndex + 1) % 2
  }

  fadeCards() {

  }

  makeCard(cardIndex) {
    const x = gameOptions.cardSheetWidth * gameOptions.cardScale / -2;
    const y = this.sys.game.config.height / 2;
    const card = this.add.sprite(x, y, "cards" + this.getCardTexture(this.deck[cardIndex]));
    card.setScale(gameOptions.cardScale);
    card.setFrame(this.getCardFrame(this.deck[cardIndex]));
    return card;
  }

  getCardTexture(cardValue) {
    return Math.floor((cardValue % 13) / 3) + 5 * Math.floor(cardValue / 26);
  }

  getCardFrame(cardValue) {
    return (cardValue % 13) % 3 + 3 * (Math.floor(cardValue / 13) % 2);
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
