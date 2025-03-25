const express = require('express');
const fetch = require('node-fetch');

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.get('/', async (req, res) => {
  try {
    const basePrompt = "A futuristic cityscape at night with neon lights";
    const userPrompt = req.query.prompt || "";
    const fullPrompt = `${basePrompt}${userPrompt ? ", " + userPrompt : ""}`;

    console.log(`Generating background with prompt: ${fullPrompt}`);

    const response = await fetch('https://api-inference.huggingface.co/models/LightningWorks/shiyangv1', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ inputs: fullPrompt })
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.statusText}`);
    }

    const imageBuffer = await response.buffer();
    const imageUrl = `data:image/webp;base64,${imageBuffer.toString('base64')}`;

    res.json({
      imageUrl: imageUrl,
      metadata: fullPrompt
    });
  } catch (error) {
    console.error('Error generating background:', error);
    res.status(500).json({ error: 'Failed to generate background: ' + error.message });
  }
});

module.exports = app;
