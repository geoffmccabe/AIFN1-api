module.exports = async (req, res) => {
  console.log('Function invoked:', req.url);

  // Extract the pathname from req.url (remove query parameters)
  const url = new URL(req.url, 'https://aifn-1-api-q1ni.vercel.app');
  const pathname = url.pathname;
  console.log('Pathname:', pathname);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (pathname === '/api/test') {
    console.log('Processing /api/test');
    res.status(200).json({
      message: 'Test endpoint working',
      version: '2023-11-14', // Updated version for debugging
      timestamp: new Date().toISOString()
    });
    return;
  }

  if (pathname === '/api/generate-background') {
    console.log('Processing /api/generate-background');
    res.status(200).json({
      message: 'Generate background endpoint reached',
      version: '2023-11-14',
      timestamp: new Date().toISOString()
    });
    return;
  }

  console.log('No matching route for:', pathname);
  res.status(404).json({ error: 'Not found' });
};
