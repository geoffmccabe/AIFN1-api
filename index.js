module.exports = async (req, res) => {
  console.log('Function invoked:', req.url);

  // Extract the pathname more reliably
  let pathname = req.url.split('?')[0]; // Remove query parameters
  if (pathname.startsWith('https://')) {
    const url = new URL(req.url);
    pathname = url.pathname;
  }
  console.log('Extracted pathname:', pathname);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (pathname === '/api/test') {
    console.log('Processing /api/test');
    res.status(200).json({
      message: 'Test endpoint working',
      version: '2023-11-15', // Updated version for debugging
      timestamp: new Date().toISOString()
    });
    return;
  }

  if (pathname === '/api/generate-background-v2') {
    console.log('Processing /api/generate-background-v2');
    res.status(200).json({
      message: 'Generate background endpoint reached',
      version: '2023-11-15',
      timestamp: new Date().toISOString()
    });
    return;
  }

  console.log('No matching route for:', pathname);
  res.status(404).json({ error: 'Not found' });
};
