const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let rooms = {}; // To store rooms and their game state

app.use(express.static("public")); // Serve your game files from the "public" directory

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
        }

        io.to(room).emit("update-game", roomData);

        if (roomData.players.length === 2) {
            io.to(room).emit("start-game", "Game started! Player X's turn.");
        }
    });

    socket.on("make-move", ({ room, index, player }) => {
        const roomData = rooms[room];
        if (roomData && roomData.gameState[index] === "" && roomData.currentPlayer === player) {
            roomData.gameState[index] = player;
            roomData.currentPlayer = player === "x" ? "o" : "x";
            io.to(room).emit("update-game", roomData);
        }
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
        // Cleanup logic if needed
    });
});

server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
