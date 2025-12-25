// server.js
require('dotenv').config();

const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const mongoDB = require('./src/db/db');
const server = http.createServer(app);

// amnipulating CORS for socket.io
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

  //  SOCKET.IO ( catch system for REALTIME COMMUNICATION)
io.on('connection', (socket) => {
  console.log(' New socket connected:', socket.id);

    //  JOIN ROOM (by roomId and role)
  socket.on('join-room', ({ roomId, role }) => {
    if (!roomId || !role) return;

    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.role = role;

    console.log(` ${role} joined room ${roomId}`);

    socket.to(roomId).emit('user-joined', {
      socketId: socket.id,
      role,
    });
  });

      // WEBRTC SIGNALING(SDP, ICE CANDIDATES)
  socket.on('signal', ({ data }) => {
    const roomId = socket.data.roomId;
    if (!roomId) return;

    socket.to(roomId).emit('signal', {
      from: socket.id,
      data,
    });
  });

      // PROCTOR DATA (ONLY INTERVIEWEE)

  socket.on('proctor-data', (metrics) => {
    const { roomId, role } = socket.data;
    if (!roomId) return;

    //  SECURITY: only interviewee allowed to send proctor data
    if (role !== 'interviewee') return;

    socket.to(roomId).emit('proctor-update', {
      metrics,
      at: Date.now(),
    });
  });

      // LEAVE ROOM (MANUAL END)
  socket.on('leave-room', () => {
    const roomId = socket.data.roomId;
    if (!roomId) return;

    socket.leave(roomId);
    socket.to(roomId).emit('user-left', {
      socketId: socket.id,
      reason: 'left',
    });

    console.log(` Socket ${socket.id} left room ${roomId}`);
  });

      // DISCONNECT
  socket.on('disconnect', () => {
    const roomId = socket.data.roomId;

    if (roomId) {
      socket.to(roomId).emit('user-left', {
        socketId: socket.id,
        reason: 'disconnect',
      });
    }

    console.log(' Socket disconnected:', socket.id);
  });
});

  //  STARTING SERVER + CONNECTING TO MONGODB
mongoDB();

const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>
  console.log(` Server listening on port ${PORT}`)
);
