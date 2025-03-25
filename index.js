const fetch = require('node-fetch');
const Arweave = require('arweave');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
});

module.exports = async (req, res) => {
  console.log('Received request:', req.url);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.url === '/api/generate-background') {
    try {
      if (!process.env.HUGGINGFACE_API_KEY) {
        console.error('HUGGINGFACE_API_KEY is not set');
        return res.status(500).json({ error: 'HUGGINGFACE_API_KEY is not set' });
      }

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
        const errorText = await response.text();
        console.error(`Hugging Face API error: ${response.statusText}, ${errorText}`);
        throw new Error(`Hugging Face API error: ${response.statusText}, ${errorText}`);
      }

      const imageBuffer = await response.buffer();
      const imageUrl = `data:image/webp;base64,${imageBuffer.toString('base64')}`;

      res.status(200).json({
        imageUrl: imageUrl,
        metadata: fullPrompt
      });
    } catch (error) {
      console.error('Error in /api/generate-background:', error);
      res.status(500).json({ error: 'Failed to generate background: ' + error.message });
    }
  } else if (req.url === '/api/upload-to-arweave') {
    try {
      const files = await new Promise((resolve, reject) => {
        upload.array('images')(req, res, (err) => {
          if (err) reject(err);
          resolve(req.files);
        });
      });

      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No images uploaded.' });
      }

      if (!process.env.ARWEAVE_KEY) {
        console.error('ARWEAVE_KEY is not set');
        return res.status(500).json({ error: 'ARWEAVE_KEY is not set' });
      }

      const wallet = JSON.parse(process.env.ARWEAVE_KEY);
      const transactionIds = [];

      for (const file of files) {
        const transaction = await arweave.createTransaction({
          data: file.buffer
        }, wallet);
        transaction.addTag('Content-Type', file.mimetype);
        await arweave.transactions.sign(transaction, wallet);
        await arweave.transactions.post(transaction);
        transactionIds.push(transaction.id);
      }

      res.status(200).json({ transactionIds });
    } catch (error) {
      console.error('Error in /api/upload-to-arweave:', error);
      res.status(500).json({ error: 'Failed to upload to Arweave: ' + error.message });
    }
  } else {
    res.status(404).json({ error: 'Not found' });
  }
};
