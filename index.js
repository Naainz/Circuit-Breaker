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
................
..3.3.3.3.3.3...
..3.3.3.3.3.3...
..3.3.3.3.3.3...
..3.3.3.3.3.3...
..3.3.3.3.3.3...
..3.3.3.3.3.3...
................
................
................
................
................
................
................
................
................`],
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

setMap(level);
setSolids([player, wall]);

onInput("w", () => {
  const p = getFirst(player);
  if (p) p.y -= 1;
});

onInput("a", () => {
  const p = getFirst(player);
  if (p) p.x -= 1;
});

onInput("s", () => {
  const p = getFirst(player);
  if (p) p.y += 1;
});

onInput("d", () => {
  const p = getFirst(player);
  if (p) p.x += 1;
});

afterInput(() => {
  const p = getFirst(player);
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
});
