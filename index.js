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

let ghost1XPosition = 5;
let ghost1YPosition = 4;
let ghost2XPosition = 2;
let ghost2YPosition = 3;
let ghost3XPosition = 7;
let ghost3YPosition = 5;

let ghost1XDirection = 0;
let ghost1YDirection = 1;
let ghost2XDirection = 1;
let ghost2YDirection = 1;
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
w..g.....w
w..1..s..w
w....g...w
w..1..w..w
wwwwwwwwww
`;

let maxSteps = 6;
let currentSteps = 0;
let isGameOver = false;
let ghost1Interval, ghost2XInterval, ghost2YInterval, ghost3Interval;

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
  startLevel1GhostMovement(); 
}

function gameOver(message) {
  isGameOver = true;
  clearInterval(ghost1Interval);
  clearInterval(ghost2XInterval);
  clearInterval(ghost2YInterval);
  clearInterval(ghost3Interval);
  addText(message, { x: 1, y: 8, color: color`0` });
  addText("Press W!", { x: 1, y: 9, color: color`0` });
}

function moveToLevel2() {
  clearInterval(ghost1Interval);
  clearInterval(ghost2XInterval);
  clearInterval(ghost2YInterval);
  clearInterval(ghost3Interval);
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

function startLevel1GhostMovement() {
  ghost1Interval = setInterval(() => {
    if (isGameOver) return;
    const g1 = getAll(ghost).find(g => g.x === ghost1XPosition && g.y === ghost1YPosition);
    if (g1) {
      let newY = ghost1YPosition + ghost1YDirection;
      if (newY < 1 || newY > 6) {
        ghost1YDirection *= -1;
        newY = ghost1YPosition + ghost1YDirection;
      }
      ghost1YPosition = newY;
      g1.y = newY;

      if (getTile(g1.x, g1.y).some(tile => tile.type === player)) {
        gameOver("You were caught!");
      }
    }
  }, 2000);
}

function startGhost2MovementLevel2() {
  ghost2XInterval = setInterval(() => {
    if (isGameOver) return;
    const g2 = getAll(ghost).find(g => g.x === ghost2XPosition && g.y === ghost2YPosition);
    if (g2) {
      let newX = ghost2XPosition + ghost2XDirection;
      if (newX < 1 || newX > 8) {
        ghost2XDirection *= -1;
        newX = ghost2XPosition + ghost2XDirection;
      }
      ghost2XPosition = newX;
      g2.x = newX;

      if (getTile(g2.x, g2.y).some(tile => tile.type === player)) {
        gameOver("You were caught!");
      }
    }
  }, 4000);

  ghost2YInterval = setInterval(() => {
    if (isGameOver) return;
    const g2 = getAll(ghost).find(g => g.x === ghost2XPosition && g.y === ghost2YPosition);
    if (g2) {
      let newY = ghost2YPosition + ghost2YDirection;
      if (newY < 1 || newY > 6) {
        ghost2YDirection *= -1;
        newY = ghost2YPosition + ghost2YDirection;
      }
      ghost2YPosition = newY;
      g2.y = newY;

      if (getTile(g2.x, g2.y).some(tile => tile.type === player)) {
        gameOver("You were caught!");
      }
    }
  }, 2000);
}

function startGhost3MovementLevel2() {
  ghost3Interval = setInterval(() => {
    if (isGameOver) return;
    const g3 = getAll(ghost).find(g => g.x === ghost3XPosition && g.y === ghost3YPosition);
    if (g3) {
      let newY = ghost3YPosition + ghost3Direction;
      if (newY < 1 || newY > 6) {
        ghost3Direction *= -1;
        newY = ghost3YPosition + ghost3Direction;
      }
      ghost3YPosition = newY;
      g3.y = newY;

      if (getTile(g3.x, g3.y).some(tile => tile.type === player)) {
        gameOver("You were caught!");
      }
    }
  }, 2000);
}

startLevel1GhostMovement();
