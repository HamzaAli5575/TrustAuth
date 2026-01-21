const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const path = require('path');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(cookieParser());

// DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected Locally'))
  .catch(err => console.log('DB Error:', err));

// Routes
app.use('/api', authRoutes);

// HTTPS Options (mTLS config)
const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, '../certs/server.key')),
  cert: fs.readFileSync(path.join(__dirname, '../certs/server.crt')),
  ca: fs.readFileSync(path.join(__dirname, '../certs/ca.crt')),
  requestCert: true,
  rejectUnauthorized: false // We verify in middleware
};

https.createServer(httpsOptions, app).listen(process.env.PORT, () => {
  console.log(`Secure Server running on https://localhost:${process.env.PORT}`);
});