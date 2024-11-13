// server.js

const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

let currentPage = 1;        // Shared page state
let adminSocketId = null;   // Track the admin user's socket ID

// Serve static files from the "public" folder
app.use(express.static("public"));

// Handle Socket.IO connections
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Assign the first user as admin if none exists
    if (adminSocketId === null) {
        adminSocketId = socket.id;
        io.to(socket.id).emit("admin");  // Notify the first user that they are the admin
    }

    // Send the current page number to the new user
    socket.emit("page-update", currentPage);

    // Listen for page changes from the admin
    socket.on("change-page", (newPage) => {
        if (socket.id === adminSocketId) {  // Only allow the admin to change pages
            currentPage = newPage;
            io.emit("page-update", currentPage); // Broadcast the new page to all users
        }
    });

    // Handle user disconnection
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        
        // Reassign admin if the current admin leaves
        if (socket.id === adminSocketId) {
            const connectedSockets = Array.from(io.sockets.sockets.keys());
            adminSocketId = connectedSockets.length > 0 ? connectedSockets[0] : null;
            if (adminSocketId) io.to(adminSocketId).emit("admin"); // Assign new admin
        }
    });
});

// Start the server on port 3000
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
