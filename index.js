module.exports = async (req, res) => {
  console.log('Function invoked:', req.url);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.url.startsWith('/api/test')) {
    console.log('Processing /api/test');
    res.status(200).json({
      message: 'Test endpoint working',
      version: '2023-11-13', // Updated version for debugging
      timestamp: new Date().toISOString()
    });
    return;
  }

  if (req.url.startsWith('/api/generate-background')) {
    console.log('Processing /api/generate-background');
    res.status(200).json({
      message: 'Generate background endpoint reached',
      version: '2023-11-13',
      timestamp: new Date().toISOString()
    });
    return;
  }

  res.status(404).json({ error: 'Not found' });
};
