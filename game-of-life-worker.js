let gridWidth;
let gridHeight;
let cells;
let newCells;

function initGrid() {
  cells = createGrid(gridWidth, gridHeight);
  newCells = createGrid(gridWidth, gridHeight);
  let sx = gridWidth / 2 - 5;
  let sy = gridHeight / 2;
  for (var i = sx; i < sx + 10; i++) {
    newCells[sy][i] = 1;
    postMessage([i, sy, 1]);
  }
}

let interval, ready = false;

const msgHandlers = {
  setup: (data) => {
    gridWidth = gridHeight = data[2] / data[1];
    initGrid();
    ready = true;
  },
  start: () => {
    if (ready) {
      interval = setInterval(function () {
        updateGrid();
      }, 100);
      ready = false;
    }
  },
  stop: () => {
    if (interval) clearInterval(interval);
    ready = true;
  },
  reset: () => {
    if (interval) clearInterval(interval);
    cells.forEach((row, i) => row.forEach((col, j) => postMessage([i, j, 0])));
    initGrid();
    ready = true;
  }
};

self.addEventListener("message", function(e) {
  let msg = e.data[0];
  msgHandlers[msg](e.data);
}, false);

function createGrid(w, h) {
  return Array(h).fill().map(i => Array(w).fill(0));
}

function copyGrid() {
  for (let j = 0; j < gridHeight; j++) {
    for (let k = 0; k < gridWidth; k++) {
      cells[j][k] = newCells[j][k];
    }
  }
}

function isCellLiving(x, y) {
  return cells[x] && cells[x][y];
}

function calcNeighbors(j, k) {
  let neighbors = 0;
  if (isCellLiving(j - 1, k - 1)) neighbors++;  //top left
  if (isCellLiving(j - 1, k))     neighbors++;  //top center
  if (isCellLiving(j - 1, k + 1)) neighbors++;  //top right
  if (isCellLiving(j, k - 1))     neighbors++;  //middle left
  if (isCellLiving(j, k + 1))     neighbors++;  //middle right
  if (isCellLiving(j + 1, k - 1)) neighbors++;  //bottom left
  if (isCellLiving(j + 1, k))     neighbors++;  //bottom center
  if (isCellLiving(j + 1, k + 1)) neighbors++;  //bottom right
  return neighbors;
}

function updateGrid() {
  for (let j = 0; j < gridHeight; j++) {
    for (let k = 0; k < gridWidth; k++) {
      let neighbors = calcNeighbors(j, k);

      if (!cells[j][k]) {
        // Každá mrtvá buňka s právě třemi živými sousedy oživne.
        if (neighbors === 3) {
          newCells[j][k] = 1;
        }
      } else {
        if (neighbors < 2) {
          newCells[j][k] = 0;
        } else if (neighbors === 2 || neighbors === 3) {
          newCells[j][k] = 1;
        } else if (neighbors > 3) {
          newCells[j][k] = 0;
        }
      }
      if (cells[j][k] !== newCells[j][k]) {
        postMessage([k, j, newCells[j][k]]);
      }
    }
  }

  copyGrid();
}
