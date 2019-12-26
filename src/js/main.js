import * as UI from './ui.js';
import * as utils from './utils.js';

const gameState = {
  score: 0,
  lives: 5,
  speed: 1,
  powerups: {
    half: 0,
    full: 0
  },
  index: 0,
  gameWords: [],
  currentWord: {
    word: null,
    answer: null,
    answers: []
  }
};

const words = [
  {
    word: 'current',
    answer: 'текущий',
    answers: ['следующий', 'неправильный', 'электростанция']
  },
  {
    word: 'house',
    answer: 'дом',
    answers: ['следующий', 'неправильный', 'текущий']
  },
  {
    word: 'next',
    answer: 'следующий',
    answers: ['текущий', 'дом', 'электростанция']
  }
];

function startGame() {
  // load words
  // reset score and lives
  gameState.lives = 5;
  gameState.score = 0;
  gameState.powerups.half = 1;
  gameState.powerups.full = 1;
  // randomize words
  gameState.gameWords = utils.shuffle(words);
  gameState.index = 0;
  // schedule first word
  UI.init();
  UI.setLives(gameState.lives);
  UI.setScore(gameState.score);
  UI.setPowerups(gameState.powerups.half, gameState.powerups.full);
  UI.setSpeedFactor(gameState.speed);
  registerListeners();
  nextWord();
}

function nextWord() {
  gameState.currentWord = gameState.gameWords[gameState.index];
  UI.setAnswers(utils.shuffle([...gameState.currentWord.answers, gameState.currentWord.answer]));
  const isHalf = Math.random() > 0.5 ? getRandom() === 2 : false;
  const isFull = Math.random() > 0.5 ? getRandom() === 4 : false;
  UI.setWord(gameState.currentWord.word, isHalf, isFull);
  gameState.index < gameState.gameWords.length - 1 ? gameState.index++ : (gameState.index = 0);
}

function getRandom() {
  var num = Math.random();
  if (num < 0.3) return 1;
  //probability 0.3
  else if (num < 0.6) return 2;
  // probability 0.3
  else if (num < 0.9) return 3;
  //probability 0.3
  else return 4; //probability 0.1
}

function checkAnswer(event) {
  console.log('Got answer: ', event.detail.answer);
  const answer = event.detail.answer;
  const powerup = event.detail.powerup;
  if (answer.toLowerCase() === gameState.currentWord.answer.toLowerCase()) {
    gameState.score++;
    UI.setScore(gameState.score);
    if (powerup) {
      if (powerup === 'half') {
        gameState.powerups.half++;
      }
      if (powerup === 'full') {
        gameState.powerups.full++;
      }
      UI.setPowerups(gameState.powerups.half, gameState.powerups.full);
    }

    nextWord();
  } else {
    failure();
  }
}

function failure() {
  console.log('failure!');
  if (gameState.lives > 1) {
    gameState.lives--;
    UI.setLives(gameState.lives);
    nextWord();
  } else {
    gameState.lives--;
    UI.setLives(gameState.lives);
    UI.clearAnswers();
    gameOver();
  }
}

function applyPowerup(event) {
  const powerup = event.detail;
  if (powerup.type === 'half') {
    if (gameState.powerups.half > 0) {
      gameState.powerups.half--;
      UI.disableAnswer(gameState.currentWord.answers[0]);
      UI.disableAnswer(gameState.currentWord.answers[1]);
    }
  }
  if (powerup.type === 'full') {
    if (gameState.powerups.full > 0) {
      gameState.powerups.full--;
      gameState.score++;
      UI.setScore(gameState.score);
      nextWord();
    }
  }

  UI.setPowerups(gameState.powerups.half, gameState.powerups.full);
}

function registerListeners() {
  window.addEventListener('failure', failure);
  window.addEventListener('answer', checkAnswer);
  window.addEventListener('powerup', applyPowerup);
  window.addEventListener('restart', startGame);
}

function gameOver() {
  console.log('Game over!');
  console.log('Your score: ' + gameState.score);
  UI.showGameOver(gameState.score);
}

window.addEventListener('load', startGame);
