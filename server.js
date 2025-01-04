const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let rooms = {};

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("join-room", (room) => {
        if (!rooms[room]) {
            rooms[room] = { players: [], gameState: Array(9).fill(""), currentPlayer: "x" };
        }

        const roomData = rooms[room];
        if (roomData.players.length < 2) {
            roomData.players.push(socket.id);
            socket.join(room);
            console.log(`Player joined room: ${room}`);

            io.to(room).emit("update-game", roomData);

            if (roomData.players.length === 2) {
                const currentPlayer = roomData.players[0] === socket.id ? "x" : "o";
                io.to(room).emit("start-game", `Game started! Player ${currentPlayer.toUpperCase()}'s turn.`);
                roomData.currentPlayer = currentPlayer;
            } else {
                socket.emit("waiting-for-opponent", "Waiting for another player to join...");
            }
        } else {
            socket.emit("room-full", "Room is full. Try another one.");
        }
    });

    socket.on("make-move", ({ room, index, player }) => {
        const roomData = rooms[room];
        if (roomData && roomData.gameState[index] === "" && roomData.currentPlayer === player) {
            roomData.gameState[index] = player;
            roomData.currentPlayer = player === "x" ? "o" : "x";

            const winner = checkWinner(roomData.gameState);
            if (winner) {
                io.to(room).emit("game-over", winner === "draw" ? "It's a draw!" : `Player ${winner.toUpperCase()} wins!`);
                resetGame(room);
            } else {
                io.to(room).emit("update-game", roomData);
            }
        }
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
        for (let room in rooms) {
            const roomData = rooms[room];
            if (roomData.players.includes(socket.id)) {
                io.to(room).emit("player-disconnected", "One of the players has disconnected.");
                resetGame(room);
                break;
            }
        }
    });
});

function checkWinner(gameState) {
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], 
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    for (let combo of winningCombinations) {
        const [a, b, c] = combo;
        if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
            return gameState[a];
        }
    }
    return gameState.includes('') ? null : 'draw';
}

function resetGame(room) {
    rooms[room].gameState = Array(9).fill("");
    rooms[room].currentPlayer = "x";
    io.to(room).emit("update-game", rooms[room]);
}

server.listen(4000, '0.0.0.0', () => {
    console.log("Server running on port http://192.168.1.8:4000");
});
