const fetch = require('node-fetch');

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

  // Set custom headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (pathname === '/api/test') {
    console.log('Processing /api/test');
    res.status(200).json({
      message: 'Test endpoint working',
      version: '2023-11-21',
      timestamp: new Date().toISOString()
    });
    return;
  }

  if (pathname === '/api/generate-background') {
    console.log('Processing /api/generate-background');
    try {
      // Extract query parameters
      const url = new URL(req.url, 'https://aifn-1-api-new3.vercel.app');
      const basePrompt = url.searchParams.get('basePrompt') || '1girl, shiyang';
      const userPrompt = url.searchParams.get('userPrompt') || 'with a cyberpunk city background';
      const width = parseInt(url.searchParams.get('width')) || 600;
      const height = parseInt(url.searchParams.get('height')) || 600;

      console.log('Base Prompt:', basePrompt);
      console.log('User Prompt:', userPrompt);
      console.log('Width:', width, 'Height:', height);

      // Combine prompts
      const fullPrompt = `${basePrompt}, ${userPrompt}`;

      // Call Hugging Face API
      const hfResponse = await fetch('https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.HF_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: fullPrompt,
          parameters: {
            width: width,
            height: height,
            negative_prompt: 'low quality, blurry',
            num_inference_steps: 50
          }
        })
      });

      if (!hfResponse.ok) {
        throw new Error(`HF API error: ${hfResponse.status} ${hfResponse.statusText}`);
      }

      // Get the image as a buffer
      const imageBuffer = await hfResponse.buffer();

      // Convert the image to base64
      const imageBase64 = imageBuffer.toString('base64');
      const imageUrl = `data:image/webp;base64,${imageBase64}`;

      res.status(200).json({
        imageUrl: imageUrl,
        metadata: fullPrompt,
        version: '2023-11-21',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error generating background:', error);
      res.status(500).json({
        error: 'Failed to generate background',
        details: error.message,
        version: '2023-11-21',
        timestamp: new Date().toISOString()
      });
    }
    return;
  }

  if (pathname === '/api/upload-to-arweave') {
    console.log('Processing /api/upload-to-arweave');
    // Placeholder for Arweave upload logic (not implemented yet)
    res.status(200).json({
      message: 'Upload to Arweave endpoint reached (not implemented)',
      version: '2023-11-21',
      timestamp: new Date().toISOString()
    });
    return;
  }

  console.log('No matching route for:', pathname);
  res.status(404).json({ error: 'Not found' });
};
