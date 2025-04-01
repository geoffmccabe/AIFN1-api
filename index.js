module.exports = async (req, res) => {
  console.log('Function invoked:', req.url);

  // Extract the pathname more reliably for Vercel
  let pathname = req.url.split('?')[0]; // Remove query parameters
  // Remove any leading "/index.js" or other prefixes Vercel might add
  if (pathname.startsWith('/index.js')) {
    pathname = pathname.replace('/index.js', '');
  }
  // Ensure leading slash and normalize
  if (!pathname.startsWith('/')) {
    pathname = '/' + pathname;
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
      version: '2023-11-16', // Updated version for debugging
      timestamp: new Date().toISOString()
    });
    return;
  }

  if (pathname === '/api/generate-background-v2') {
    console.log('Processing /api/generate-background-v2');
    res.status(200).json({
      message: 'Generate background endpoint reached',
      version: '2023-11-16',
      timestamp: new Date().toISOString()
    });
    return;
  }

  console.log('No matching route for:', pathname);
  res.status(404).json({ error: 'Not found' });
};
