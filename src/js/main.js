import * as UI from './ui.js';
import * as utils from './utils.js';
import { words as wordsFunc } from '../../lib/random-words.js';

const DICT_API_KEY = 'dict.1.1.20191227T083344Z.fdaef15e9b404a2b.50fdfdd2ebca3b2e213b887173bf7563eeed6232';
const DICT_API_URL = 'https://dictionary.yandex.net/api/v1/dicservice.json/lookup';
const DICT_API_LANG = 'en-ru';

const gameState = {
  score: 0,
  scoreMultiplier: 1,
  rightAnswers: 0,
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

async function getWords() {
  const sourceWords = wordsFunc(25);

  const translationRequests = sourceWords.map(word => fetch(`${DICT_API_URL}?key=${DICT_API_KEY}&lang=${DICT_API_LANG}&text=${word}`));

  const translations = (
    await Promise.all(
      (await Promise.all(translationRequests)).map(response => {
        return response.json();
      })
    )
  )
    .filter(item => item.def.length)
    .slice(0, 20);
  const allAnswers = translations.map(item => item.def[0].tr[0].text);
  const words = translations.map(item => {
    return {
      word: item.def[0].text,
      answer: item.def[0].tr[0].text,
      answers: utils.shuffle(allAnswers.filter(ans => ans !== item.def[0].tr[0].text)).slice(0, 3)
    };
  });
  return words;
}

function init() {
  UI.init();
  registerListeners();
}

async function startGame() {
  // load words
  // reset score and lives
  gameState.lives = 5;
  gameState.score = 0;
  gameState.rightAnswers = 0;
  gameState.powerups.half = 1;
  gameState.powerups.full = 1;

  // schedule first word
  UI.setLives(gameState.lives);
  UI.setScore(gameState.score);
  UI.setPowerups(gameState.powerups.half, gameState.powerups.full);
  UI.setSpeedFactor(gameState.speed);

  // randomize words
  const words = await getWords();
  gameState.gameWords = utils.shuffle(words);
  gameState.index = 0;
  nextWord();
}

function nextWord() {
  if (gameState.index === gameState.gameWords.length) {
    UI.resetUI();
    gameOver();
    return;
  }
  gameState.currentWord = gameState.gameWords[gameState.index];
  UI.setAnswers(utils.shuffle([...gameState.currentWord.answers, gameState.currentWord.answer]));
  const isHalf = Math.random() > 0.5 ? getRandom() === 2 : false;
  const isFull = Math.random() > 0.5 ? getRandom() === 4 : false;
  UI.setWord(gameState.currentWord.word, isHalf, isFull);
  gameState.index++;
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

function getScore() {
  return UI.getPositionLeft() * gameState.scoreMultiplier;
}

function increaseScore() {
  gameState.score += getScore();
  gameState.rightAnswers++;
}

function checkAnswer(event) {
  // console.log('Got answer: ', event.detail.answer);
  const answer = event.detail.answer;
  const powerup = event.detail.powerup;
  if (answer.toLowerCase() === gameState.currentWord.answer.toLowerCase()) {
    increaseScore();
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
      increaseScore();
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
  UI.showGameOver(gameState.score, gameState.rightAnswers, gameState.gameWords.length);
}

window.addEventListener('load', init);
