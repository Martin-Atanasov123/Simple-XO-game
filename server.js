const express = require("express");
const http = require("http"); // Node's HTTP module
const { Server } = require("socket.io"); // Import Socket.IO

const app = express(); // Create an Express application
const server = http.createServer(app); // Create an HTTP server
const io = new Server(server); // Attach Socket.IO to the server

// Serve static files from the "public" directory
app.use(express.static("public"));

let rooms = {}; // Store game state for rooms

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // When a player joins a room
    socket.on("join-room", (room) => {
        if (!rooms[room]) {
            rooms[room] = { players: [], gameState: Array(9).fill(""), currentPlayer: "x" }; // Set the first player to be "x"
        }

        const roomData = rooms[room];
        if (roomData.players.length < 2) {
            roomData.players.push(socket.id);
            socket.join(room);
            console.log(`Player joined room: ${room}`);

            // Notify players about the room state
            io.to(room).emit("update-game", roomData);

            if (roomData.players.length === 2) {
                // Notify both players to start the game, set player X to start
                const currentPlayer = roomData.players[0] === socket.id ? "x" : "o";
                io.to(room).emit("start-game", `Game started! Player ${currentPlayer}'s turn.`);
                roomData.currentPlayer = currentPlayer; // Assign the first player's turn
            } else {
                socket.emit("waiting-for-opponent", "Waiting for another player to join...");
            }
        } else {
            socket.emit("room-full", "Room is full. Try another one.");
        }
    });

    // When a player makes a move
    socket.on("make-move", ({ room, index, player }) => {
        const roomData = rooms[room];
        if (roomData && roomData.gameState[index] === "" && roomData.currentPlayer === player) {
            roomData.gameState[index] = player;
            roomData.currentPlayer = player === "x" ? "o" : "x"; // Switch the turn to the next player
            io.to(room).emit("update-game", roomData);
        }
    });

    // When a player disconnects
    socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
    });
});

// Start the server
server.listen(4000, () => {
    console.log("Server running on http://192.168.1.8:4000");
});

