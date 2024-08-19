const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(cors());

app.post('/fetch-metadata', async (req, res) => {
  const { urls } = req.body;
  
  if (!urls || !Array.isArray(urls) || urls.length < 3) {
    return res.status(400).json({ error: 'Please provide at least 3 valid URLs' });
  }

  try {
    const results = await Promise.all(urls.map(async (url) => {
      try {
        const response = await axios.get(url);
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

