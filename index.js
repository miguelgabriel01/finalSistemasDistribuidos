const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
  },
});

const PORT = 3000;
const HOST_IP = '192.168.137.40';

app.use(express.static('public'));

const boardSize = 3;
let board = initializeBoard();

let currentPlayer = 'X';
let isPlayer1Turn = true;

io.on('connection', (socket) => {
  console.log('Client connected');

  io.to(socket.id).emit('initialState', { board, currentPlayer, isPlayer1Turn });

  socket.on('playMove', (move) => {
    if ((isPlayer1Turn && currentPlayer === 'X') || (!isPlayer1Turn && currentPlayer === 'O')) {
      if (isValidMove(move)) {
        updateBoard(move);
        const winner = checkWinner();
        if (winner) {
          io.emit('gameOver', { winner });
          board = initializeBoard();
        } else {
          currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
          isPlayer1Turn = !isPlayer1Turn;
          io.emit('playMove', { board, currentPlayer });
        }
      }
    }
  });

  socket.on('restartGame', () => {
    board = initializeBoard();
    currentPlayer = 'X';
    isPlayer1Turn = true;
    io.emit('initialState', { board, currentPlayer, isPlayer1Turn });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

function initializeBoard() {
  return Array.from({ length: boardSize }, () => Array(boardSize).fill(null));
}

function isValidMove({ row, col }) {
  return !board[row][col];
}

function updateBoard({ row, col }) {
  board[row][col] = currentPlayer;
}

function checkWinner() {
  // Verificar linhas e colunas
  for (let i = 0; i < boardSize; i++) {
    if (
      board[i][0] !== null &&
      board[i][0] === board[i][1] &&
      board[i][1] === board[i][2]
    ) {
      return board[i][0]; // Retorna o jogador que venceu
    }
    if (
      board[0][i] !== null &&
      board[0][i] === board[1][i] &&
      board[1][i] === board[2][i]
    ) {
      return board[0][i]; // Retorna o jogador que venceu
    }
  }

  // Verificar diagonais
  if (
    board[0][0] !== null &&
    board[0][0] === board[1][1] &&
    board[1][1] === board[2][2]
  ) {
    return board[0][0]; // Retorna o jogador que venceu
  }
  if (
    board[0][2] !== null &&
    board[0][2] === board[1][1] &&
    board[1][1] === board[2][0]
  ) {
    return board[0][2]; // Retorna o jogador que venceu
  }

  // Verificar empate
  if (board.flat().every((cell) => cell)) {
    return 'draw';
  }

  return null; // Retorna null se o jogo ainda não terminou
}

server.listen(PORT, HOST_IP, () => {
  console.log(`Server listening on http://${HOST_IP}:${PORT}`);
});
