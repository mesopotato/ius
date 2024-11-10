// routes/verifyRecaptcha.js

const express = require('express');
const router = express.Router();
const axios = require('axios');

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

router.post('/', async (req, res) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('/api/verify-recaptcha called with body:', req.body);
  }
  const { token } = req.body;

  if (!token) {
    return res
      .status(400)
      .json({ success: false, message: 'Token is missing' });
  }

  try {
    const verificationURL = `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${token}`;

    const { data } = await axios.post(verificationURL);

    if (data.success) {
      // CAPTCHA verified successfully
      console.log('reCAPTCHA verification successful');
      res.status(200).json({ success: true });
    } else {
      // Verification failed
      console.error('reCAPTCHA verification failed:', data['error-codes']);
      res
        .status(400)
        .json({ success: false, errors: data['error-codes'] });
    }
  } catch (error) {
    console.error('Error verifying reCAPTCHA:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
