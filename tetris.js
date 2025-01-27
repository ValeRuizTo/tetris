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

// Define la pieza actual, que se inicializa al inicio del juego
let currentPiece = createPiece();
let gameOver = false;

// Función para crear una nueva pieza aleatoria
function createPiece() {
  const types = Object.keys(SHAPES); 
  const shape = types[Math.floor(Math.random() * types.length)]; 
  return {
    shape: SHAPES[shape], // Obtiene la forma correspondiente
    color: COLORS[types.indexOf(shape)], // Asigna un color según el índice del tipo
    x: Math.floor(COLS / 2) - 1, // Ubica la pieza en el centro superior del tablero
    y: 0, // La posición inicial en y siempre será 0 (parte superior)
  };
}

// Dibuja todo el tablero en el lienzo
function drawBoard() {
  context.clearRect(0, 0, canvas.width, canvas.height); // Limpia el lienzo antes de redibujar
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (board[y][x]) {
        drawBlock(x, y, board[y][x]); // Dibuja un bloque en cada celda no vacía
      }
    }
  }
}

// Dibuja la pieza actual en el lienzo
function drawPiece(piece) {
  piece.shape.forEach((row, dy) => {
    row.forEach((value, dx) => {
      if (value) { // Dibuja solo los bloques que forman parte de la pieza
        drawBlock(piece.x + dx, piece.y + dy, piece.color); // Calcula la posición exacta en el tablero
      }
    });
  });
}

// Dibuja un bloque en el lienzo en la posición y color especificados
function drawBlock(x, y, color) {
  context.fillStyle = color; // Color de relleno del bloque
  context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE); // Dibuja un rectángulo del tamaño del bloque
  context.strokeStyle = "#222"; // Color del borde
  context.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE); // Dibuja un borde alrededor del bloque
}

// Comprueba si una pieza puede moverse en una dirección dada (offsetX y offsetY)
function isValidMove(piece, offsetX, offsetY) {
  return piece.shape.every((row, dy) =>
    row.every((value, dx) => {
      if (!value) return true; // Si la celda no forma parte de la pieza, es válida
      const newX = piece.x + dx + offsetX; // Nueva posición x
      const newY = piece.y + dy + offsetY; // Nueva posición y
      return (
        newX >= 0 &&               // No sale del lado izquierdo
        newX < COLS &&             // No sale del lado derecho
        newY < ROWS &&             // No supera la parte inferior
        (newY < 0 || !board[newY][newX]) // La celda no está ocupada por otra pieza
      );
    })
  );
}

// Fija la pieza actual al tablero, marcando las celdas como ocupadas
function placePiece(piece) {
  piece.shape.forEach((row, dy) => {
    row.forEach((value, dx) => {
      if (value) {
        board[piece.y + dy][piece.x + dx] = piece.color; // Marca la celda con el color de la pieza
      }
    });
  });
}

// Elimina las filas completas del tablero
function clearLines() {
  // Filtra las filas que no están completamente llenas
  board = board.filter(row => row.some(cell => !cell));
  // Añade filas vacías en la parte superior para mantener el tamaño del tablero
  while (board.length < ROWS) {
    board.unshift(Array(COLS).fill(0));
  }
}

// Actualiza el estado del juego (movimiento de la pieza y colisiones)
function update() {
  if (gameOver) return; // Si el juego ha terminado, no hace nada
  if (isValidMove(currentPiece, 0, 1)) { // Comprueba si la pieza puede bajar
    currentPiece.y++; // Si puede, incrementa su posición en y
  } else {
    placePiece(currentPiece); // Fija la pieza en el tablero
    clearLines(); // Elimina las filas completas
    currentPiece = createPiece(); // Genera una nueva pieza
    if (!isValidMove(currentPiece, 0, 0)) { // Si la nueva pieza no puede colocarse, el juego termina
      gameOver = true;
      alert("Game Over"); // Muestra un mensaje de fin de juego
    }
  }
}

// Maneja las teclas para mover y rotar la pieza
document.addEventListener("keydown", (event) => {
  if (gameOver) return; // Si el juego terminó, no procesa entradas
  switch (event.key) {
    case "ArrowLeft":
      if (isValidMove(currentPiece, -1, 0)) currentPiece.x--; // Mueve la pieza a la izquierda
      break;
    case "ArrowRight":
      if (isValidMove(currentPiece, 1, 0)) currentPiece.x++; // Mueve la pieza a la derecha
      break;
    case "ArrowDown":
      if (isValidMove(currentPiece, 0, 1)) currentPiece.y++; // Baja la pieza rápidamente
      break;
    case "ArrowUp":
      rotatePiece(); // Llama a la función para rotar la pieza
      break;
  }
});

// Maneja el clic para rotar la pieza
document.addEventListener("click", () => {
  if (gameOver) return; // Si el juego terminó, no procesa entradas
  rotatePiece(); // Llama a la función para rotar la pieza
});

// Función para rotar la pieza
function rotatePiece() {
  const shape = currentPiece.shape;
  const rotated = shape[0].map((_, index) =>
    shape.map(row => row[index]).reverse()
  );
  if (isValidMove({ ...currentPiece, shape: rotated }, 0, 0)) {
    currentPiece.shape = rotated; // Aplica la rotación si es válida
  }
}

// Bucle principal del juego, que actualiza y dibuja cada 200ms
function gameLoop() {
  if (!gameOver) {
    update(); // Actualiza el estado del juego
    drawBoard(); // Dibuja el tablero
    drawPiece(currentPiece); // Dibuja la pieza actual
  }
}

// Inicia el bucle del juego
setInterval(gameLoop, 200); // Ejecuta gameLoop cada 200ms
let score = 0;
let linesCleared = 0;

// Actualiza el puntaje en el DOM
function updateScore() {
  document.getElementById("score").textContent = score;
  document.getElementById("lines").textContent = linesCleared;
}

// Modifica la función clearLines
function clearLines() {
  let linesToClear = 0;

  // Cuenta cuántas filas están completamente llenas
  board = board.filter(row => {
    if (row.every(cell => cell)) {
      linesToClear++;
      return false; // Elimina la fila
    }
    return true; // Mantiene las filas incompletas
  });

  // Añade filas vacías en la parte superior para mantener el tamaño del tablero
  while (board.length < ROWS) {
    board.unshift(Array(COLS).fill(0));
  }

  // Incrementa el puntaje y las líneas completadas
  if (linesToClear > 0) {
    linesCleared += linesToClear;
    score += linesToClear * 10; // Cada línea vale 10 puntos
    updateScore(); // Actualiza el DOM
  }
}

// Inicia el juego actualizando el puntaje inicial
updateScore();

