const socket = io("http://192.168.1.8:4000");
const status = document.getElementById("status");
const playerStatus = document.getElementById("player-status");
let room = "default-room";
let myPlayer = null;
let currentPlayer = null;
let roomData = {};

socket.emit("join-room", room);

socket.on("update-game", (roomDataFromServer) => {
    roomData = roomDataFromServer;
    updateBoard(roomData.gameState);
    if (roomData.currentPlayer === myPlayer) {
        status.textContent = "Your turn!";
    } else {
        status.textContent = "Waiting for opponent's move...";
    }
});

socket.on("start-game", (message) => {
    myPlayer = myPlayer || (roomData.players[0] === socket.id ? "x" : "o");
    currentPlayer = roomData.currentPlayer;
    playerStatus.textContent = `You are Player ${myPlayer.toUpperCase()}`;
    status.textContent = message;
});

socket.on("waiting-for-opponent", (message) => {
    status.textContent = message;
});

socket.on("room-full", () => {
    status.textContent = "Room is full. Please wait for the next game!";
    playerStatus.textContent = "";
    disableBoard();
});

socket.on("game-over", (message) => {
    status.textContent = message;
    disableBoard();
});

socket.on("player-disconnected", (message) => {
    status.textContent = message;
    disableBoard();
});

function play(cell) {
    const index = parseInt(cell.id.replace("box", "")) - 1;
    if (myPlayer && currentPlayer === myPlayer && roomData.gameState[index] === "") {
        socket.emit("make-move", { room, index, player: myPlayer });
    }
}

function updateBoard(gameState) {
    const spans = document.getElementsByTagName("span");
    gameState.forEach((player, i) => {
        spans[i].innerHTML = player === "x" || player === "o" ? player : "&nbsp;";
    });
}

function disableBoard() {
    const cells = document.querySelectorAll('.box span');
    cells.forEach(cell => {
        cell.removeAttribute("onclick");
    });
}
