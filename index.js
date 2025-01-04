let gameState = Array(9).fill('');  // Keep track of the game state, empty = "", X or O
let currentPlayer = 'X';  // Start with player X
let isGameOver = false;  // Flag to check if the game is over
const status = document.getElementById('status');
const cells = document.querySelectorAll('.box span');  // Get all the cell elements

// Function to handle a player's move
function play(cell) {
    const index = Array.from(cells).indexOf(cell);  // Get the index of the clicked cell

    // Only allow player X to click and make a move if it's not already filled
    if (!isGameOver && gameState[index] === '' && currentPlayer === 'X') {
        gameState[index] = 'X';  // Update game state with "X"
        cell.innerHTML = 'X';  // Update the cell visually with "X"
        cell.classList.add('occupied');  // Mark cell as occupied
        currentPlayer = 'O';  // Switch to AI (Player O)
        status.textContent = "AI's turn";  // Update the status

        checkWinner();  // Check if there's a winner after player move
        if (!isGameOver) {
            setTimeout(() => {
                aiMove();  // After a short delay, AI makes its move
            }, 500);  // Delay AI move to give some time for the player move
        }
    }
}

// Function for AI to make a move
function aiMove() {
    const availableMoves = gameState.map((value, index) => value === '' ? index : null).filter(index => index !== null);

    if (availableMoves.length === 0) return;  // No available moves, game over

    const aiMoveIndex = availableMoves[Math.floor(Math.random() * availableMoves.length)];  // Pick a random available move
    gameState[aiMoveIndex] = 'O';  // Update game state with "O"
    cells[aiMoveIndex].innerHTML = 'O';  // Update the cell visually with "O"
    cells[aiMoveIndex].classList.add('occupied');  // Mark cell as occupied
    currentPlayer = 'X';  // Switch back to player X
    status.textContent = "Player X's turn";  // Update the status

    checkWinner();  // Check if there's a winner after AI move
}

// Function to check for a winner
function checkWinner() {
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]  // Diagonals
    ];

    for (let combination of winningCombinations) {
        const [a, b, c] = combination;
        if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
            // Color the winning cells and display an alert
            setTimeout(() => {
                alert(`${gameState[a]} wins!`);
                resetGame();  // Reset the game after a win
            }, 200);

            // Highlight the winning cells
            highlightCells(combination, 'winner');

            isGameOver = true;  // End the game
            return;
        }
    }

    // Check for draw
    if (!gameState.includes('')) {
        setTimeout(() => {
            alert("It's a draw!");  // Show draw if all cells are filled
            resetGame();  // Reset the game after a draw
        }, 200);

        // Highlight all cells with the draw color
        cells.forEach(cell => cell.classList.add('draw'));

        isGameOver = true;  // End the game
    }
}

// Function to highlight the winning cells or draw
function highlightCells(indices, className) {
    indices.forEach(index => {
        cells[index].classList.add(className);  // Add winner or draw class
    });
}

// Reset the game for a new round
function resetGame() {
    gameState = Array(9).fill('');
    currentPlayer = 'X';
    status.textContent = "Player X's turn";  // Set the status back to Player X's turn
    isGameOver = false;  // Reset game over flag

    cells.forEach(cell => {
        cell.innerHTML = '';  // Clear the grid
        cell.classList.remove('winner', 'draw', 'occupied');  // Remove any color or winner class
    });
}

// Attach event listeners to all the cells
cells.forEach(cell => {
    cell.addEventListener('click', () => play(cell));
});
