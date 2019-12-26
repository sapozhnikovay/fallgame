let wordArea;
let answersArea;
let livesArea;
let powerupHalfButton;
let powerupFullButton;
let scoreLabel;
let powerupHalfLabel;
let powerupFullLabel;

let wordElement;
let position = 0;
let speed = 1;
const TIMEOUT = 20;
let timeoutHandle;
const MAX_LIVES = 5;
let powerupOnWord = null;

export function init() {
  wordArea = document.getElementById('word-area');
  answersArea = document.getElementById('answers-area');
  livesArea = document.getElementById('lives');
  scoreLabel = document.getElementById('score');
  powerupHalfButton = document.getElementById('powerup-button-half');
  powerupFullButton = document.getElementById('powerup-button-full');
  powerupHalfLabel = document.getElementById('powerups-count-50');
  powerupFullLabel = document.getElementById('powerups-count-answers');

  powerupHalfButton.addEventListener('click', () => {
    window.dispatchEvent(
      new CustomEvent('powerup', {
        detail: { type: 'half' }
      })
    );
  });

  powerupFullButton.addEventListener('click', () => {
    clearTimeout(timeoutHandle);
    clearWord();
    window.dispatchEvent(
      new CustomEvent('powerup', {
        detail: { type: 'full' }
      })
    );
  });
}

export function setWord(word, isHalf = false, isFull = false) {
  let cssClass = 'word';
  cssClass += isHalf ? ' word-powerup_50' : '';
  cssClass += isFull ? ' word-powerup_answer' : '';
  wordArea.innerHTML = `<div id="current-word" class="${cssClass}">${word}</div>`;
  wordElement = document.getElementById('current-word');
  position = 0;
  powerupOnWord = null;
  if (isHalf) powerupOnWord = 'half';
  if (isFull) powerupOnWord = 'full';
  timeoutHandle = setTimeout(moveWord, TIMEOUT);
}

export function clearWord() {
  wordElement.remove();
}

export function showGameOver(score) {
  wordArea.innerHTML = `<div id="gameover" class="gameover">Game over!<br/> Your score is: ${score}</div>`;
  const restartButton = document.createElement('button');
  restartButton.className = 'restart-button';
  restartButton.innerText = 'RESTART';
  restartButton.addEventListener('click', () => window.dispatchEvent(new CustomEvent('restart')));
  wordArea.append(restartButton);
}

function moveWord() {
  position += speed;
  if (position > 300) {
    clearWord();
    window.dispatchEvent(new CustomEvent('failure'));
  } else {
    wordElement.style.top = `${position}px`;
    timeoutHandle = setTimeout(moveWord, TIMEOUT);
  }
}

export function setAnswers(answers) {
  const answerElements = [];
  for (let i = 0; i < answers.length; i++) {
    const element = document.createElement('button');
    element.id = 'answer-' + answers[i];
    element.innerText = answers[i];
    element.addEventListener('click', () => {
      clearTimeout(timeoutHandle);
      clearWord();
      window.dispatchEvent(
        new CustomEvent('answer', {
          detail: { answer: answers[i], powerup: powerupOnWord }
        })
      );
    });
    answerElements.push(element);
  }
  answersArea.innerHTML = '';
  answersArea.append(...answerElements);
}

export function clearAnswers() {
  answersArea.innerHTML = '';
}

export function disableAnswer(answer) {
  const element = document.getElementById('answer-' + answer);
  element.setAttribute('disabled', 'disabled');
}

export function setSpeedFactor(factor) {
  speed *= factor;
}

export function setScore(score) {
  scoreLabel.innerHTML = score;
}
export function setPowerups(half, full) {
  powerupHalfLabel.innerHTML = half;
  powerupFullLabel.innerHTML = full;
  if (half === 0) {
    powerupHalfButton.setAttribute('disabled', 'disabled');
  } else {
    powerupHalfButton.removeAttribute('disabled');
  }
  if (full === 0) {
    powerupFullButton.setAttribute('disabled', 'disabled');
  } else {
    powerupFullButton.removeAttribute('disabled');
  }
}
export function setLives(lives) {
  const livesElements = [];
  for (let i = 1; i <= MAX_LIVES; i++) {
    const element = document.createElement('div');
    element.className = 'live';
    if (i > lives) {
      element.className += ' live_empty';
    }
    livesElements.push(element);
  }
  livesArea.innerHTML = '';
  livesArea.append(...livesElements);
}
