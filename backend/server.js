const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('New socket:', socket.id);

  socket.on('join-room', ({ roomId, role }) => {
    console.log(`Socket ${socket.id} joined room ${roomId} as ${role}`);
    socket.join(roomId);
    socket.data.role = role;
    socket.data.roomId = roomId;

    socket.to(roomId).emit('user-joined', { socketId: socket.id, role });
  });

  // WebRTC signaling: broadcast to other peers in the same room
  socket.on('signal', ({ roomId, data }) => {
    const room = socket.data.roomId || roomId;
    if (!room) return;

    // send to everyone else in the room except sender
    socket.to(room).emit('signal', {
      from: socket.id,
      data,
    });
  });

  // Proctoring data from interviewee
  socket.on('proctor-data', (metrics) => {
    const roomId = socket.data.roomId;
    if (!roomId) return;

    // Send only to other peers in the room (interviewer)
    socket.to(roomId).emit('proctor-update', {
      from: socket.id,
      metrics,
      role: socket.data.role,
      at: Date.now(),
    });
  });

  socket.on('disconnect', () => {
    const roomId = socket.data.roomId;
    if (roomId) {
      socket.to(roomId).emit('user-left', { socketId: socket.id });
    }
    console.log('Socket disconnected:', socket.id);
  });
});

app.get('/', (req, res) => {
  res.send('Interview video server running');
});

const PORT = 3000;
server.listen(PORT, () => console.log('Server listening on', PORT));
