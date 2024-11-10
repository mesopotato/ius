// server.js

require('dotenv').config();
const fetch = require('node-fetch');

const express = require('express');
const cors = require('cors');
const axios = require('axios');

const searchRoutes = require('./routes/search');
const recaptchaRoutes = require('./routes/verifyRecaptcha');

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost',
  })
);

app.use(express.json());

// Example of conditional logging
if (process.env.NODE_ENV === 'development') {
  console.log('Server is running in development mode.');
}

// Routes
app.use('/api/search', searchRoutes);
app.use('/api/verify-recaptcha', recaptchaRoutes);

// Start the server
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);

  if (process.env.NODE_ENV === 'development') {
    console.log('Server is running in development mode.');
    console.log(process.env);
  } else {
    console.log('Server is running in production mode.');
  }
});
