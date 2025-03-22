const fetch = require('node-fetch');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://opensea.io');
  const { prompt, size, count } = req.body;

  const backgrounds = [];
  for (let i = 0; i < count; i++) {
    const seed = Math.floor(Math.random() * 1000000);
    const response = await fetch('https://api-inference.huggingface.co/models/LightningWorks/shiyangv1', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.HUGGING_FACE_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ inputs: prompt, parameters: { size: size === '600x600' ? '600x600' : '2048x2048', seed } })
    });
    const imageBuffer = await response.buffer();
    backgrounds.push({
      url: `data:image/png;base64,${imageBuffer.toString('base64')}`,
      prompt,
      seed
    });
  }
  res.json({ backgrounds });
};
