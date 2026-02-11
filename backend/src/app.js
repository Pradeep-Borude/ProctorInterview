// backend/src/app.js
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const AuthRoutes = require('./routes/auth.routes'); 
const SessionRoutes = require('./routes/session.routes'); 

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.get('/', (req, res) => {
  res.send('Interview video server running');
});

app.use('/api/auth', AuthRoutes);
app.use('/api/session', SessionRoutes);

module.exports = app;
