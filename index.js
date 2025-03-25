const handler = (req, res) => {
  console.log('Received request:', req.url);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.url === '/api/generate-background') {
    res.status(200).json({
      imageUrl: 'https://archive.org/download/placeholder-image/placeholder-image.jpg',
      metadata: 'Debug: Static response'
    });
  } else if (req.url === '/api/upload-to-arweave') {
    res.status(200).json({ message: 'Upload endpoint hit' });
  } else {
    res.status(404).json({ error: 'Not found' });
  }
};

module.exports = handler;
