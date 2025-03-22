const { Arweave } = require('arweave');
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://opensea.io');
  const { tokenId, prompt, seed, size } = req.body;

  const response = await fetch('https://api-inference.huggingface.co/models/LightningWorks/shiyangv1', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.HUGGING_FACE_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ inputs: prompt, parameters: { size, seed } })
  });
  const imageBuffer = await response.buffer();

  const arweave = Arweave.init({ host: 'arweave.net', port: 443, protocol: 'https' });
  const key = JSON.parse(process.env.ARWEAVE_KEY);
  const transaction = await arweave.createTransaction({ data: imageBuffer }, key);
  await arweave.transactions.sign(transaction, key);
  await arweave.transactions.post(transaction);
  const arweaveUrl = `https://arweave.net/${transaction.id}`;

  res.json({ arweaveUrl });
};
