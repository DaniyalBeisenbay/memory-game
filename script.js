const app = document.createElement('div');
app.classList.add('app');

const header = document.createElement('header');
header.classList.add('header');

const title = document.createElement('h1');
title.classList.add('title');
title.textContent = 'Memory Game';

const controls = document.createElement('div');
controls.classList.add('controls');

const newGameButton = document.createElement('button');
newGameButton.classList.add('button');
newGameButton.textContent = 'New Game';

const leaderboardButton = document.createElement('button');
leaderboardButton.classList.add('button');
leaderboardButton.textContent = 'Leaderboard';

controls.append(newGameButton, leaderboardButton);
header.append(title, controls);

const stats = document.createElement('div');
stats.classList.add('stats');

const movesText = document.createElement('p');
movesText.textContent = 'Moves: 0';

const pairsText = document.createElement('p');
pairsText.textContent = 'Pairs: 0 / 8';

stats.append(movesText, pairsText);

const gameBoard = document.createElement('div');
gameBoard.classList.add('game-board');

const cardImages = [
 './assets/iron-man.png',
  './assets/captain-america.png',
  './assets/thor.png',
  './assets/hulk.png',
  './assets/spider-man.png',
  './assets/black-panther.png',
  './assets/doctor-strange.png',
  './assets/scarlet-witch.png',
];

const cards = [...cardImages, ...cardImages];

for (let i = cards.length - 1; i > 0; i--) {
  const randomIndex = Math.floor(Math.random() * (i + 1));

  [cards[i], cards[randomIndex]] = [cards[randomIndex], cards[i]];
}


let firstCard = null;
let secondCard = null;
let isLocked = false;
let isGameOver = false;

let moves = 0;
let matchedPairs = 0;

let flipTimeout = null;

cards.forEach((image) => {
  const card = document.createElement('button');

  card.classList.add('card');
  card.textContent = '?';
  card.dataset.image = image;

  card.addEventListener('click', () => {
    if (
  isGameOver ||
  isLocked ||
  card.classList.contains('flipped')
) {
  return;
}

    card.textContent = '';

const cardImage = document.createElement('img');
cardImage.src = card.dataset.image;
cardImage.alt = 'Car logo';
cardImage.classList.add('card-image');

card.append(cardImage);
card.classList.add('flipped');

    if (firstCard === null) {
      firstCard = card;
      return;
    }

    secondCard = card;
    isLocked = true;

    moves++;
    movesText.textContent = `Moves: ${moves}`;

    if (firstCard.dataset.image === secondCard.dataset.image) {
      matchedPairs++;
      pairsText.textContent = `Pairs: ${matchedPairs} / 8`;

      firstCard = null;
      secondCard = null;
      isLocked = false;

      if (matchedPairs === 8) {
        isGameOver = true;
        saveResult();
        showWinModal();
      }
    } else {
      flipTimeout = setTimeout(() => {
        firstCard.textContent = '?';
        secondCard.textContent = '?';

        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');

        firstCard = null;
        secondCard = null;
        isLocked = false;
      }, 1000);
    }
  });

  gameBoard.append(card);
});

function saveResult() {
  const savedResults = localStorage.getItem('memoryGameResults');

  let results = [];

  if (savedResults !== null) {
    results = JSON.parse(savedResults);
  }

  const today = new Date();

  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();

  const newResult = {
    moves: moves,
    date: `${day}.${month}.${year}`,
    timestamp: Date.now(),
  };

  results.push(newResult);

  results.sort((a, b) => {
    if (a.moves !== b.moves) {
      return a.moves - b.moves;
    }

    return a.timestamp - b.timestamp;
  });

  results = results.slice(0, 10);

  localStorage.setItem(
    'memoryGameResults',
    JSON.stringify(results)
  );
}


let activeModal = null;

function closeModal() {
  if (activeModal === null) {
    return;
  }

  activeModal.remove();
  activeModal = null;

  document.body.classList.remove('modal-open');
  app.inert = false;
}

function openModal(content) {
  const overlay = document.createElement('div');
  overlay.classList.add('modal-overlay');

  const modal = document.createElement('div');
  modal.classList.add('modal');

  modal.append(content);
  overlay.append(modal);
  document.body.append(overlay);

  activeModal = overlay;

  document.body.classList.add('modal-open');
  app.inert = true;

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      closeModal();
    }
  });
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && activeModal !== null) {
    closeModal();
  }
});



function showWinModal() {
  const content = document.createElement('div');

  const modalTitle = document.createElement('h2');
  modalTitle.textContent = '🎉 You Win!';

  const result = document.createElement('p');
  result.textContent = `You completed the game in ${moves} moves.`;

  const modalButtons = document.createElement('div');
  modalButtons.classList.add('modal-buttons');

  const playAgainButton = document.createElement('button');
  playAgainButton.classList.add('button');
  playAgainButton.textContent = 'New Game';

  const closeButton = document.createElement('button');
  closeButton.classList.add('button');
  closeButton.textContent = 'Close';

  playAgainButton.addEventListener('click', () => {
    closeModal();
    startNewGame();
  });

  closeButton.addEventListener('click', closeModal);

  modalButtons.append(playAgainButton, closeButton);
  content.append(modalTitle, result, modalButtons);

  openModal(content);
}

function showLeaderboard() {
  const savedResults = localStorage.getItem('memoryGameResults');

  let results = [];

  if (savedResults !== null) {
    results = JSON.parse(savedResults);
  }

  const content = document.createElement('div');

  const modalTitle = document.createElement('h2');
  modalTitle.textContent = '🏆 Leaderboard';

  content.append(modalTitle);

  if (results.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.textContent = 'No results yet';

    content.append(emptyMessage);
  } else {
    const table = document.createElement('div');
    table.classList.add('leaderboard-table');

    const headerRow = document.createElement('div');
    headerRow.classList.add('leaderboard-row');

    const placeHeader = document.createElement('span');
    placeHeader.textContent = '#';

    const movesHeader = document.createElement('span');
    movesHeader.textContent = 'Moves';

    const dateHeader = document.createElement('span');
    dateHeader.textContent = 'Date';

    headerRow.append(placeHeader, movesHeader, dateHeader);
    table.append(headerRow);

    results.forEach((result, index) => {
      const row = document.createElement('div');
      row.classList.add('leaderboard-row');

      const place = document.createElement('span');
      place.textContent = index + 1;

      const movesResult = document.createElement('span');
      movesResult.textContent = result.moves;

      const dateResult = document.createElement('span');
      dateResult.textContent = result.date;

      row.append(place, movesResult, dateResult);
      table.append(row);
    });

    content.append(table);
  }

  const closeButton = document.createElement('button');
  closeButton.classList.add('button');
  closeButton.textContent = 'Close';

  closeButton.addEventListener('click', closeModal);

  content.append(closeButton);

  openModal(content);
}

function startNewGame() {
  clearTimeout(flipTimeout);

  firstCard = null;
  secondCard = null;
  isLocked = false;
  isGameOver = false;

  moves = 0;
  matchedPairs = 0;

  movesText.textContent = 'Moves: 0';
  pairsText.textContent = 'Pairs: 0 / 8';

  const allCards = Array.from(gameBoard.children);

  for (let i = allCards.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));

    [allCards[i], allCards[randomIndex]] = [
      allCards[randomIndex],
      allCards[i],
    ];
  }

  allCards.forEach((card) => {
    card.textContent = '?';
    card.classList.remove('flipped');
    gameBoard.append(card);
  });
}

app.append(header, stats, gameBoard);
document.body.append(app);

newGameButton.addEventListener('click', startNewGame);
leaderboardButton.addEventListener('click', showLeaderboard);