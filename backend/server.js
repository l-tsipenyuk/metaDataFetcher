const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const csurf = require('csurf');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 3001;

// Body parser
app.use(express.json({ limit: '10kb' }));

// Cookie parser
app.use(cookieParser());

// Set security HTTP headers
app.use(helmet());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 1000,
  max: 5,
  message: "Too many requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/fetch-metadata', limiter);

// CSRF protection
const csrfProtection = csurf({ 
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  } 
});

app.use(csrfProtection);

app.get('/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

app.post('/fetch-metadata', async (req, res) => {
  const { urls } = req.body;
  
  if (!urls || !Array.isArray(urls) || urls.length < 3) {
    return res.status(400).json({ error: 'Please provide at least 3 valid URLs' });
  }

  try {
    const results = await Promise.all(urls.map(async (url) => {
      try {
        const response = await axios.get(url, {
          timeout: 5000,
          maxContentLength: 1000000,
        });
        const html = response.data;
        const $ = cheerio.load(html);

        const title = $('title').text() || $('meta[property="og:title"]').attr('content') || 'No title found';
        const description = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || 'No description found';
        const image = $('meta[property="og:image"]').attr('content') || 'https://via.placeholder.com/150';

        return { url, title, description, image };
      } catch (error) {
        return { url, error: 'Failed to fetch metadata' };
      }
    }));

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    res.status(403).json({ error: 'Invalid CSRF token' });
  } else {
    console.error(err);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});