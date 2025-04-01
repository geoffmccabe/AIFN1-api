module.exports = async (req, res) => {
  console.log('Function invoked with req.url:', req.url);
  console.log('Full request headers:', req.headers);

  // Extract the pathname directly from req.url
  let pathname = req.url.split('?')[0]; // Remove query parameters
  console.log('Initial pathname:', pathname);

  // Normalize the pathname by removing any unexpected prefixes or suffixes
  pathname = pathname.replace(/^\/index\.js/, ''); // Remove /index.js if present
  if (!pathname.startsWith('/')) {
    pathname = '/' + pathname;
  }
  if (pathname.endsWith('/') && pathname !== '/') {
    pathname = pathname.slice(0, -1);
  }
  console.log('Normalized pathname:', pathname);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (pathname === '/api/test') {
    console.log('Processing /api/test');
    res.status(200).json({
      message: 'Test endpoint working',
      version: '2023-11-19', // Updated version for debugging
      timestamp: new Date().toISOString()
    });
    return;
  }

  if (pathname === '/api/generate-background-v2') {
    console.log('Processing /api/generate-background-v2');
    res.status(200).json({
      message: 'Generate background endpoint reached',
      version: '2023-11-19',
      timestamp: new Date().toISOString()
    });
    return;
  }

  console.log('No matching route for:', pathname);
  res.status(404).json({ error: 'Not found' });
};
