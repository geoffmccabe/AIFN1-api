import express from 'express';
import fetch from 'node-fetch';
import { Arweave } from 'arweave';
import multer from 'multer';

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
});

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.get('/api/generate-background', async (req, res) => {
  try {
    console.log('Received request for /api/generate-background');
    res.json({
      imageUrl: 'https://archive.org/download/placeholder-image/placeholder-image.jpg',
      metadata: 'Debug: Static response'
    });
  } catch (error) {
    console.error('Error in /api/generate-background:', error);
    res.status(500).json({ error: 'Failed to generate background: ' + error.message });
  }
});

app.post('/api/upload-to-arweave', upload.array('images'), async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No images uploaded.' });
    }

    const wallet = JSON.parse(process.env.ARWEAVE_WALLET);
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

    res.json({ transactionIds });
  } catch (error) {
    console.error('Error in /api/upload-to-arweave:', error);
    res.status(500).json({ error: 'Failed to upload to Arweave: ' + error.message });
  }
});

export default app;
