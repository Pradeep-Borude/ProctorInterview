// server.js
require('dotenv').config(); // ✅ FIRST LINE

const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const mongoDB = require('./src/db/db');

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('New socket:', socket.id);

  socket.on('join-room', ({ roomId, role }) => {
    socket.join(roomId);
    socket.data.role = role;
    socket.data.roomId = roomId;
    socket.to(roomId).emit('user-joined', { socketId: socket.id, role });
  });

  socket.on('signal', ({ roomId, data }) => {
    const room = socket.data.roomId || roomId;
    if (!room) return;
    socket.to(room).emit('signal', { from: socket.id, data });
  });

  socket.on('proctor-data', (metrics) => {
    const roomId = socket.data.roomId;
    if (!roomId) return;
    socket.to(roomId).emit('proctor-update', {
      from: socket.id,
      metrics,
      role: socket.data.role,
      at: Date.now(),
    });
  });

  socket.on('disconnect', () => {
    const roomId = socket.data.roomId;
    if (roomId) socket.to(roomId).emit('user-left', { socketId: socket.id });
    console.log('Socket disconnected:', socket.id);
  });
});

mongoDB();

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Server listening on', PORT));
