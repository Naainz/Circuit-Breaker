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
  `]
);

const level = map`
wwwwwwwwww
w........w
w.p......w
w..1..s..w
w..1..w..w
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

// Movement controls with step tracking and game over check
onInput("w", () => {
  const p = getFirst(player);
  if (p && currentSteps < maxSteps) {
    p.y -= 1;
    currentSteps++;
    updateStepCounter();
    checkGameOver();
  }
});

onInput("a", () => {
  const p = getFirst(player);
  if (p && currentSteps < maxSteps) {
    p.x -= 1;
    currentSteps++;
    updateStepCounter();
    checkGameOver();
  }
});

onInput("s", () => {
  const p = getFirst(player);
  if (p && currentSteps < maxSteps) {
    p.y += 1;
    currentSteps++;
    updateStepCounter();
    checkGameOver();
  }
});

onInput("d", () => {
  const p = getFirst(player);
  if (p && currentSteps < maxSteps) {
    p.x += 1;
    currentSteps++;
    updateStepCounter();
    checkGameOver();
  }
});

function checkGameOver() {
  const p = getFirst(player);
  if (currentSteps >= maxSteps) {
    clearText();
    addText("Level failed!", { x: 1, y: 8, color: color`0` });
    addText("Press W!", { x: 1, y: 9, color: color`0` });
    return;
  }
  
  if (p) {
    const playerTile = getTile(p.x, p.y);
    
    if (playerTile.find(tile => tile.type === switchOff)) {
      clearTile(p.x, p.y);
      addSprite(p.x, p.y, switchOn);
      
      // Activate the wire
      getAll(wire).forEach(wireTile => {
        clearTile(wireTile.x, wireTile.y);
        addSprite(wireTile.x, wireTile.y, wireActive);
      });

      // Indicate circuit completed
      addText("Circuit Activated!", { x: 1, y: 1, color: color`5` });
    }
  }
}

onInput("w", () => {
  if (currentSteps >= maxSteps) {
    resetGame();
  }
});
