const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("A user connected");

  function emitParticipantsUpdated() {
    if (!io.sockets.adapter.rooms.get(socket.room)) {
      // Room doesn't exist anymore. No need to update participants.
      return;
    }

    io.to(socket.room).emit("participants-updated", {
      roomSize: io.sockets.adapter.rooms.get(socket.room).size,
    });
  }

  socket.on("create-room", (roomName) => {
    console.log("creating room: " + roomName);
    socket.join(roomName);
    socket.room = roomName;

    emitParticipantsUpdated();
  });

  socket.on("join-room", (roomName) => {
    console.log("joining room: " + roomName);

    if (!io.sockets.adapter.rooms.get(roomName)) {
      //handle error
    }

    socket.join(roomName);
    socket.room = roomName;

    emitParticipantsUpdated();
  });

  socket.broadcast.emit("user connected", {
    userID: socket.id,
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected");

    emitParticipantsUpdated();
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
