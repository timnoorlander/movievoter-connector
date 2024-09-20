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
    console.log("emitting: participants-updated");

    const roomSize = getRoomSize(socket.room);

    if (!roomSize || roomSize === 0) {
      return;
    }

    io.to(socket.room).emit("participants-updated", {
      roomSize: getRoomSize(socket.room),
    });
  }

  socket.on("create-voting", (roomName) => {
    console.log("creating room: " + roomName);
    socket.join(roomName);
    socket.room = roomName;
    socket.host = socket.id;

    emitParticipantsUpdated();
  });

  socket.on("join-voting", (roomName) => {
    console.log("joining room: " + roomName);

    socket.join(roomName);
    socket.room = roomName;

    emitParticipantsUpdated();
  });

  socket.on("start-voting", (data) => {
    io.to(socket.room).emit("voting-started", data);
  });

  socket.on("add-movies", (movieIds) => {
    console.log("add movies received");
    io.to(socket.room).emit("movies-added", movieIds);
  });

  socket.on("remove-movies", (movieIds) => {
    io.to(socket.room).emit("movies-removed", movieIds);
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

function getRoomSize(roomName) {
  if (!io.sockets.adapter.rooms.get(roomName)) {
    return;
  }

  return io.sockets.adapter.rooms.get(roomName).size;
}
