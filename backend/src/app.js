// backend/src/app.js
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes'); 

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

app.use('/api/auth', authRoutes);

module.exports = app;
