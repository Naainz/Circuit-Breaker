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

const level = map`
wwwwwwwwww
w........w
w.p......w
w..1..s..w
w..1.g.w.w
w..1..w..w
w..1..w..w
wwwwwwwwww
`;

const maxSteps = 6;
let currentSteps = 0;

function updateStepCounter() {
  clearText();
  addText(`${maxSteps - currentSteps}`, { x: 14, y: 1, color: color`0` });
}

function resetGame() {
  setMap(level);
  currentSteps = 0;
  updateStepCounter();
  clearText();
}

setMap(level);
setSolids([player, wall]);
updateStepCounter();

onInput("w", () => {
  movePlayer(0, -1);
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
  const p = getFirst(player);
  if (p && currentSteps < maxSteps) {
    const newX = p.x + dx;
    const newY = p.y + dy;
    const destinationTile = getTile(newX, newY);

    if (destinationTile.some(tile => tile.type === wall)) {
      addText("You hit a wall!", { x: 1, y: 8, color: color`0` });
      addText("Press W!", { x: 1, y: 9, color: color`0` });
      return;
    }

    if (destinationTile.some(tile => tile.type === ghost)) {
      addText("You were caught!", { x: 1, y: 8, color: color`0` });
      addText("Press W!", { x: 1, y: 9, color: color`0` });
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
    addText("Level failed!", { x: 1, y: 8, color: color`0` });
    addText("Press W!", { x: 1, y: 9, color: color`0` });
    return;
  }
  
  if (p) {
    const playerTile = getTile(p.x, p.y);
    
    if (playerTile.find(tile => tile.type === switchOff)) {
      clearTile(p.x, p.y);
      addSprite(p.x, p.y, switchOn);
      
      getAll(wire).forEach(wireTile => {
        clearTile(wireTile.x, wireTile.y);
        addSprite(wireTile.x, wireTile.y, wireActive);
      });

      addText("Circuit Activated!", { x: 1, y: 1, color: color`5` });
    }
  }
}

let ghostDirection = 1;

function moveGhost() {
  const g = getFirst(ghost);
  if (g) {
    const newY = g.y + ghostDirection;

    if (newY < 2 || newY > 6) { 
      ghostDirection *= -1;
    }

    g.y = newY;

    const playerTile = getTile(g.x, g.y);
    if (playerTile.some(tile => tile.type === player)) {
      addText("You were caught!", { x: 1, y: 8, color: color`0` });
      addText("Press W!", { x: 1, y: 9, color: color`0` });
    }
  }
}

setInterval(moveGhost, 200);
