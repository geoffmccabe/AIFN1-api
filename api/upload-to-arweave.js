const express = require('express');
const multer = require('multer');
const { Arweave } = require('arweave');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
});

app.post('/', upload.array('images'), async (req, res) => {
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
    res.status(500).json({ error: 'Failed to upload to Arweave: ' + error.message });
  }
});

module.exports = app;
