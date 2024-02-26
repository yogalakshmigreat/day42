// server.js

const express = require('express');
const bodyParser = require('body-parser');
const { nanoid } = require('nanoid');
const validUrl = require('valid-url');

const app = express();
const PORT = process.env.PORT || 5000;

// In-memory database to store shortened URLs
const urlDatabase = {};

app.use(bodyParser.json());

// Endpoint to create a shortened URL
app.post('/shorten', (req, res) => {
    const { longUrl } = req.body;

    if (!validUrl.isWebUri(longUrl)) {
        return res.status(400).json({ error: 'Invalid URL' });
    }

    const shortUrl = nanoid(8);
    urlDatabase[shortUrl] = longUrl;

    res.json({ shortUrl: `http://localhost:5000/${shortUrl}` });
});

// Redirect endpoint for shortened URLs
app.get('/:shortUrl', (req, res) => {
    const { shortUrl } = req.params;

    if (!urlDatabase[shortUrl]) {
        return res.status(404).json({ error: 'URL not found' });
    }

    res.redirect(urlDatabase[shortUrl]);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// App.js

import React, { useState } from 'react';
import axios from 'axios';

const App = () => {
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleShortenUrl = async () => {
    try {
      const response = await axios.post('http://localhost:5000/shorten', { longUrl });
      setShortUrl(response.data.shortUrl);
      setErrorMessage('');
    } catch (error) {
      setShortUrl('');
      setErrorMessage(error.response.data.error);
    }
  };

  return (
    <div className="container mt-5">
      <h2>URL Shortener</h2>
      <div className="mb-3">
        <label htmlFor="longUrl" className="form-label">Enter Long URL</label>
        <input type="text" className="form-control" id="longUrl" value={longUrl} onChange={(e) => setLongUrl(e.target.value)} />
      </div>
      <button className="btn btn-primary" onClick={handleShortenUrl}>Shorten URL</button>
      {shortUrl && <p className="mt-3">Shortened URL: <a href={shortUrl}>{shortUrl}</a></p>}
      {errorMessage && <p className="text-danger mt-3">{errorMessage}</p>}
    </div>
  );
};

export default App;
