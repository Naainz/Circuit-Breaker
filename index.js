/*
First time? Check out the tutorial game:
https://sprig.hackclub.com/gallery/getting_started
@title: Circuit Breaker
@author: Stefan D
@tags: []
@addedOn: 2024-10-08
*/

const player = "p";
const wall = "w";
const wire = "1";
const wireActive = "2";
const switchOff = "s";
const switchOn = "S";
const ghost = "g";

let ghostStartX = 5;
let ghost1YPosition = 4;
let ghost1Direction = 1;

let ghost2StartX = 7;
let ghost2YPosition = 3;
let ghost2Direction = 1;

let ghost3StartX = 2;
let ghost3YPosition = 5;
let ghost3Direction = 1;

setLegend(
  [player, bitmap`
  . . . . . . . .
  . . 5 5 5 5 . .
  . 5 . . . . 5 .
  . 5 . 5 5 . 5 .
  . 5 . 5 5 . 5 .
  . 5 . . . . 5 .
  . . 5 5 5 5 . .
  . . . . . . . .
  `],
  [wall, bitmap`
  . . . . . . . .
  . 3 3 3 3 3 3 .
  . 3 3 3 3 3 3 .
  . 3 3 3 3 3 3 .
  . 3 3 3 3 3 3 .
  . 3 3 3 3 3 3 .
  . 3 3 3 3 3 3 .
  . . . . . . . .
  `],
  [wire, bitmap`
  . . . . . . . .
  . . . . . . . .
  . . . 2 2 . . .
  . . . 2 2 . . .
  . . . 2 2 . . .
  . . . 2 2 . . .
  . . . . . . . .
  . . . . . . . .
  `],
  [wireActive, bitmap`
  . . . . . . . .
  . . . . . . . .
  . . . 6 6 . . .
  . . . 6 6 . . .
  . . . 6 6 . . .
  . . . 6 6 . . .
  . . . . . . . .
  . . . . . . . .
  `],
  [switchOff, bitmap`
  . . . . . . . .
  . . 4 4 4 4 . .
  . 4 . . . . 4 .
  . 4 . 4 4 . 4 .
  . 4 . 4 4 . 4 .
  . 4 . . . . 4 .
  . . 4 4 4 4 . .
  . . . . . . . .
  `],
  [switchOn, bitmap`
  . . . . . . . .
  . . 8 8 8 8 . .
  . 8 . . . . 8 .
  . 8 . 8 8 . 8 .
  . 8 . 8 8 . 8 .
  . 8 . . . . 8 .
  . . 8 8 8 8 . .
  . . . . . . . .
  `],
  [ghost, bitmap`
  . . . . . . . .
  . . . 8 8 . . .
  . . 8 8 8 8 . .
  . 8 8 . . 8 8 .
  . 8 8 8 8 8 8 .
  . 8 8 8 8 8 8 .
  . . 8 8 8 8 . .
  . . . 8 8 . . .
  `]
);

const level1 = map`
wwwwwwwwww
w........w
w.p......w
w..1..s..w
w..1..g..w
w..1..w..w
w..1..w..w
wwwwwwwwww
`;

const level2 = map`
wwwwwwwwww
w........w
w.p......w
w........w
w..1..s..w
w....g...w
w..1..w..w
wwwwwwwwww
`;

let maxSteps = 6;
let currentSteps = 0;
let isGameOver = false;
let ghost1Interval, ghost2Interval;

function updateStepCounter() {
  clearText();
  addText(`${maxSteps - currentSteps}`, { x: 14, y: 1, color: color`0` });
}

function resetGame() {
  setMap(level1);
  maxSteps = 6;
  currentSteps = 0;
  isGameOver = false;
  updateStepCounter();
  clearText();
  startGhost1Movement();
}

function gameOver(message) {
  isGameOver = true;
  clearInterval(ghost1Interval);
  clearInterval(ghost2Interval);
  addText(message, { x: 1, y: 8, color: color`0` });
  addText("Press W!", { x: 1, y: 9, color: color`0` });
}

function moveToLevel2() {
  clearInterval(ghost1Interval);
  clearInterval(ghost2Interval);
  addText("Circuit Achieved!", { x: 1, y: 8, color: color`0` });
  setTimeout(() => {
    setMap(level2);
    maxSteps = 7;
    currentSteps = 0;
    isGameOver = false;
    clearText();
    startGhost2MovementLevel2();
    startGhost3MovementLevel2();
    updateStepCounter();
  }, 1000);
}

setMap(level1);
setSolids([player, wall]);
updateStepCounter();

onInput("w", () => {
  if (isGameOver) {
    resetGame();
  } else {
    movePlayer(0, -1);
  }
});

onInput("a", () => {
  movePlayer(-1, 0);
});

onInput("s", () => {
  movePlayer(0, 1);
});

onInput("d", () => {
  movePlayer(1, 0);
});

function movePlayer(dx, dy) {
  if (isGameOver) return;
  const p = getFirst(player);
  if (p && currentSteps < maxSteps) {
    const newX = p.x + dx;
    const newY = p.y + dy;
    const destinationTile = getTile(newX, newY);

    if (destinationTile.some(tile => tile.type === wall)) {
      gameOver("You hit a wall!");
      return;
    }

    if (destinationTile.some(tile => tile.type === ghost)) {
      gameOver("You were caught!");
      return;
    }

    p.x = newX;
    p.y = newY;
    currentSteps++;
    updateStepCounter();
    checkGameOver();
  }
}

function checkGameOver() {
  const p = getFirst(player);
  if (currentSteps >= maxSteps) {
    gameOver("Level failed!");
    return;
  }

  const playerTile = getTile(p.x, p.y);
  if (playerTile.some(tile => tile.type === switchOff)) {
    clearTile(p.x, p.y);
    addSprite(p.x, p.y, switchOn);
    getAll(wire).forEach(wireTile => {
      clearTile(wireTile.x, wireTile.y);
      addSprite(wireTile.x, wireTile.y, wireActive);
    });
    moveToLevel2();
  }
}

function startGhost1Movement() {
  addSprite(ghostStartX, ghost1YPosition, ghost);

  ghost1Interval = setInterval(() => {
    const g = getFirst(ghost);
    if (g) {
      const newY = g.y + ghost1Direction;

      if (newY < 2 || newY > 6) {
        ghost1Direction *= -1;
      }

      g.y = newY;

      const playerTile = getTile(g.x, g.y);
      if (playerTile.some(tile => tile.type === player)) {
        gameOver("You were caught!");
      }
    }
  }, 200);
}

function startGhost2MovementLevel2() {
  addSprite(ghost2StartX, ghost2YPosition, ghost);

  ghost2Interval = setInterval(() => {
    const g = getFirst(ghost);
    if (g) {
      const newY = g.y + ghost2Direction;

      if (newY < 2 || newY > 6) {
        ghost2Direction *= -1;
      }

      g.y = newY;

      const playerTile = getTile(g.x, g.y);
      if (playerTile.some(tile => tile.type === player)) {
        gameOver("You were caught!");
      }
    }
  }, 200);
}

function startGhost3MovementLevel2() {
  addSprite(ghost3StartX, ghost3YPosition, ghost);

  ghost2Interval = setInterval(() => {
    const g = getFirst(ghost);
    if (g) {
      const newX = g.x + ghost3Direction;

      if (newX < 1 || newX > 8) {
        ghost3Direction *= -1;
      }

      g.x = newX;

      const playerTile = getTile(g.x, g.y);
      if (playerTile.some(tile => tile.type === player)) {
        gameOver("You were caught!");
      }
    }
  }, 400);
}

startGhost1Movement();
