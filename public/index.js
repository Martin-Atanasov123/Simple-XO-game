// const socket = io("http://192.168.1.8:4000"); // Use your computer's local IP
// const status = document.getElementById("status");
// let room = "default-room";
// let myPlayer = null;
// let currentPlayer = null; // Store current player

// // Join the room
// socket.emit("join-room", room);

// // Listen for events from the server
// socket.on("update-game", (roomData) => {
//     updateBoard(roomData.gameState);
//     if (roomData.currentPlayer === myPlayer) {
//         status.textContent = "Your turn!";
//     } else {
//         status.textContent = "Waiting for opponent's move...";
//     }
// });

// socket.on("start-game", (message) => {
//     status.textContent = message;
//     myPlayer = myPlayer || (roomData.players[0] === socket.id ? "x" : "o"); // Assign player role if not already set
//     currentPlayer = roomData.currentPlayer; // Set the current player
// });

// socket.on("waiting-for-opponent", (message) => {
//     status.textContent = message;
// });

// socket.on("room-full", (message) => {
//     status.textContent = message;
// });

// // Emit a move to the server
// function play(cell) {
//     const index = parseInt(cell.id.replace("box", "")) - 1;
//     if (myPlayer && currentPlayer === myPlayer && roomData.gameState[index] === "") {
//         socket.emit("make-move", { room, index, player: myPlayer });
//     }
// }

// function updateBoard(gameState) {
//     const spans = document.getElementsByTagName("span");
//     gameState.forEach((player, i) => {
//         spans[i].innerHTML = player === "x" || player === "o" ? player : "&nbsp;";
//     });
// }

const socket = io("http://192.168.1.8:4000"); // Use your computer's local IP
const status = document.getElementById("status");
let room = "default-room";
let myPlayer = null;
let currentPlayer = null; // Store current player
let roomData = {}; // To store room data from the server

// Join the room
socket.emit("join-room", room);

// Listen for events from the server
socket.on("update-game", (roomDataFromServer) => {
    roomData = roomDataFromServer; // Store room data received from server
    updateBoard(roomData.gameState);
    if (roomData.currentPlayer === myPlayer) {
        status.textContent = "Your turn!";
    } else {
        status.textContent = "Waiting for opponent's move...";
    }
});

socket.on("start-game", (roomDataFromServer) => {
    roomData = roomDataFromServer; // Store room data received from server
    status.textContent = `Game started! Player ${myPlayer === "x" ? "X" : "O"}'s turn.`;
    myPlayer = myPlayer || (roomData.players[0] === socket.id ? "x" : "o"); // Assign player role if not already set
    currentPlayer = roomData.currentPlayer; // Set the current player
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

