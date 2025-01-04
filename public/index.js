const socket = io("http://localhost:3000"); // Replace with your backend URL if deployed
const status = document.getElementById("status");
let room = "default-room";
let myPlayer = null;

// Join the room
socket.emit("join-room", room);

// Listen for events from the server
socket.on("update-game", (roomData) => {
    updateBoard(roomData.gameState);
    if (roomData.currentPlayer === myPlayer) {
        status.textContent = "Your turn!";
    } else {
        status.textContent = "Waiting for opponent's move...";
    }
});

socket.on("start-game", (message) => {
    myPlayer = myPlayer || (roomData.players[0] === socket.id ? "x" : "o"); // Assign player role
    status.textContent = message;
});

socket.on("waiting-for-opponent", (message) => {
    status.textContent = message;
});

socket.on("room-full", (message) => {
    status.textContent = message;
});

// Emit a move to the server
function play(cell) {
    const index = parseInt(cell.id.replace("box", "")) - 1;
    if (myPlayer && roomData.currentPlayer === myPlayer) {
        socket.emit("make-move", { room, index, player: myPlayer });
    }
}

function updateBoard(gameState) {
    const spans = document.getElementsByTagName("span");
    gameState.forEach((player, i) => {
        spans[i].innerHTML = player === "x" || player === "o" ? player : "&nbsp;";
    });
}
