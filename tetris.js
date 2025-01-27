const canvas = document.getElementById("game-board");
const context = canvas.getContext("2d");

// Define las dimensiones del lienzo: 
canvas.width = 300;
canvas.height = 600;

const COLS = 10;
const ROWS = 20;

// Tamaño de cada bloque en píxeles
const BLOCK_SIZE = canvas.width / COLS;

const COLORS = ["cyan", "blue", "orange", "yellow", "green", "purple", "red"];

const SHAPES = {
  I: [[1, 1, 1, 1]], 
  O: [               
    [1, 1],
    [1, 1],
  ],
  T: [               
    [1, 1, 1],
    [0, 1, 0],
  ],
  S: [               
    [0, 1, 1],
    [1, 1, 0],
  ],
  Z: [               
    [1, 1, 0],
    [0, 1, 1],
  ],
  J: [               
    [1, 0, 0],
    [1, 1, 1],
  ],
  L: [              
    [0, 0, 1],
    [1, 1, 1],
  ],
};

// Inicializa el tablero como una matriz llena de ceros 
let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

let currentPiece = createPiece();
let gameOver = false;

function createPiece() {
  const types = Object.keys(SHAPES); 
  const shape = types[Math.floor(Math.random() * types.length)]; 
  return {
    shape: SHAPES[shape],
    color: COLORS[types.indexOf(shape)],
    x: Math.floor(COLS / 2) - 1,
    y: 0,
  };
}

function drawBoard() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (board[y][x]) {
        drawBlock(x, y, board[y][x]);
      }
    }
  }
}

function drawPiece(piece) {
  piece.shape.forEach((row, dy) => {
    row.forEach((value, dx) => {
      if (value) {
        drawBlock(piece.x + dx, piece.y + dy, piece.color);
      }
    });
  });
}

function drawBlock(x, y, color) {
  context.fillStyle = color;
  context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
  context.strokeStyle = "#222";
  context.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

function isValidMove(piece, offsetX, offsetY) {
  return piece.shape.every((row, dy) =>
    row.every((value, dx) => {
      if (!value) return true;
      const newX = piece.x + dx + offsetX;
      const newY = piece.y + dy + offsetY;
      return (
        newX >= 0 &&
        newX < COLS &&
        newY < ROWS &&
        (newY < 0 || !board[newY][newX])
      );
    })
  );
}

function placePiece(piece) {
  piece.shape.forEach((row, dy) => {
    row.forEach((value, dx) => {
      if (value) {
        board[piece.y + dy][piece.x + dx] = piece.color;
      }
    });
  });
}

function clearLines() {
  let linesToClear = 0;

  board = board.filter(row => {
    if (row.every(cell => cell)) {
      linesToClear++;
      return false;
    }
    return true;
  });

  while (board.length < ROWS) {
    board.unshift(Array(COLS).fill(0));
  }

  if (linesToClear > 0) {
    linesCleared += linesToClear;
    score += linesToClear * 10;
    updateScore();
  }
}

function update() {
  if (gameOver) return;
  if (isValidMove(currentPiece, 0, 1)) {
    currentPiece.y++;
  } else {
    placePiece(currentPiece);
    clearLines();
    currentPiece = createPiece();
    if (!isValidMove(currentPiece, 0, 0)) {
      gameOver = true;
      if (confirm("Game Over! ¿Quieres jugar otra vez?")) {
        resetGame();
      }
    }
  }
}

function resetGame() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  currentPiece = createPiece();
  gameOver = false;
  score = 0;
  linesCleared = 0;
  updateScore();
}

document.addEventListener("keydown", (event) => {
  if (gameOver) return;
  switch (event.key) {
    case "ArrowLeft":
      if (isValidMove(currentPiece, -1, 0)) currentPiece.x--;
      break;
    case "ArrowRight":
      if (isValidMove(currentPiece, 1, 0)) currentPiece.x++;
      break;
    case "ArrowDown":
      if (isValidMove(currentPiece, 0, 1)) currentPiece.y++;
      break;
    case "ArrowUp":
      rotatePiece();
      break;
  }
});

document.addEventListener("click", () => {
  if (gameOver) return;
  rotatePiece();
});

function rotatePiece() {
  const shape = currentPiece.shape;
  const rotated = shape[0].map((_, index) =>
    shape.map(row => row[index]).reverse()
  );
  if (isValidMove({ ...currentPiece, shape: rotated }, 0, 0)) {
    currentPiece.shape = rotated;
  }
}

function gameLoop() {
  if (!gameOver) {
    update();
    drawBoard();
    drawPiece(currentPiece);
  }
}

setInterval(gameLoop, 200);
let score = 0;
let linesCleared = 0;

function updateScore() {
  document.getElementById("score").textContent = score;
  document.getElementById("lines").textContent = linesCleared;
}

updateScore();