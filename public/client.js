const socket = io('http://192.168.137.40:3000'); // Substitua pelo IP do seu servidor

let isPlayerTurn = true;

socket.on('initialState', ({ board, currentPlayer }) => {
  updateBoardUI(board);
  updatePlayerTurnUI(currentPlayer);
});

socket.on('playMove', ({ board, currentPlayer }) => {
  updateBoardUI(board);
  updatePlayerTurnUI(currentPlayer);
  isPlayerTurn = true;
});

socket.on('gameOver', ({ winner }) => {
  if (winner === 'draw') {
    alert('O jogo terminou em empate!');
  } else {
    alert(`O jogador ${winner === 'O' ? 'O' : 'X'} venceu!`);
  }
});

function playMove(row, col) {
  if (!isPlayerTurn) {
    alert('Aguarde sua vez!');
    return;
  }
  
  socket.emit('playMove', { row, col });
  isPlayerTurn = false;
}

function restartGame() {
  socket.emit('restartGame');
}

function updateBoardUI(board) {
  const gameBoard = document.getElementById('game-board');
  gameBoard.innerHTML = '';

  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.textContent = board[i][j] || '';
      cell.onclick = () => onCellClick(i, j);
      gameBoard.appendChild(cell);
    }
  }
}

function updatePlayerTurnUI(currentPlayer) {
  const playerTurn = document.getElementById('player-turn');
  playerTurn.textContent = `É a vez do jogador ${currentPlayer}`;
}

function onCellClick(row, col) {
  // Implementa lógica para evitar cliques em células já ocupadas ou fora da vez do jogador
  playMove(row, col);
}
