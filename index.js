require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// Set Content-Security-Policy header
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;"
  );
  next();
});

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

app.post('/api/grammar', async (req, res) => {
  const { prompt, text } = req.body;

  const requestBody = {
    contents: [
      {
        parts: [
          { text: `${prompt}:\n\n${text}` }
        ]
      }
    ]
  };

  try {
    const response = await axios.post(GEMINI_URL, requestBody);
    const result = response.data.candidates[0]?.content?.parts[0]?.text || "No response";
    res.json({ result });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get response from Gemini'});
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
