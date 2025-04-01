const fetch = require('node-fetch');

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
      version: '2023-11-12', // Updated version for debugging
      timestamp: new Date().toISOString()
    });
    return;
  }

  if (req.url.startsWith('/api/generate-background')) {
    try {
      console.log('Processing /api/generate-background');
      if (!process.env.HUGGINGFACE_API_KEY) {
        console.error('HUGGINGFACE_API_KEY is not set');
        return res.status(500).json({ error: 'HUGGINGFACE_API_KEY is not set' });
      }

      const basePrompt = req.query.basePrompt || "1girl, shiyang";
      const userPrompt = req.query.userPrompt || "";
      const weightedUserPrompt = userPrompt ? `(((${userPrompt})))` : "";
      const fullPrompt = `${basePrompt}${weightedUserPrompt ? ", " + weightedUserPrompt : ""}`;
      const width = parseInt(req.query.width) || 600;
      const height = parseInt(req.query.height) || 600;
      const seed = Math.floor(Math.random() * 1000000);
      const cacheBust = Date.now();

      console.log(`Generating background with prompt: ${fullPrompt}, width: ${width}, height: ${height}, seed: ${seed}, cacheBust: ${cacheBust}`);

      const response = await fetch(`https://api-inference.huggingface.com/models/black-forest-labs/FLUX.1-dev?cacheBust=${cacheBust}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: fullPrompt,
          parameters: {
            width: width,
            height: height,
            num_inference_steps: 30,
            guidance_scale: 7.5,
            seed: seed
          }
        }),
        timeout: 60000
      });

      console.log('Hugging Face API response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Hugging Face API error: ${response.statusText}, ${errorText}`);
        return res.status(500).json({ error: `Hugging Face API error: ${response.statusText}, ${errorText}` });
      }

      const imageBuffer = await response.arrayBuffer();
      const imageUrl = `data:image/webp;base64,${Buffer.from(imageBuffer).toString('base64')}`;
      console.log('Image generated successfully, length:', imageUrl.length);

      res.status(200).json({
        imageUrl: imageUrl,
        metadata: fullPrompt,
        generatedAt: new Date().toISOString(),
        version: '2023-11-12'
      });
    } catch (error) {
      console.error('Error in /api/generate-background:', error.message, error.stack);
      res.status(500).json({ error: 'Failed to generate background: ' + error.message });
    }
  } else {
    res.status(404).json({ error: 'Not found' });
  }
};
