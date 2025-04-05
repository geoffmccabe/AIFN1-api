export default async function handler(req, res) {
  // Set CORS headers to allow requests from your website
  res.setHeader('Access-Control-Allow-Origin', 'https://geoffmccabe.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { basePrompt, userPrompt, width, height, model } = req.query;

  if (!basePrompt || !width || !height || !model) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  // Map the selected model to its Hugging Face endpoint
  const modelMap = {
    flux: 'black-forest-labs/FLUX.1-dev',
    sdxl: 'stabilityai/stable-diffusion-xl-base-1.0',
    dreamshaper: 'Lykon/dreamshaper-8',
    pixart: 'PixArt-alpha/PixArt-XL-2-1024px-aesthetic',
    anything: 'SG161222/Realistic_Vision_V4.0_noVAE'
  };

  const selectedModel = modelMap[model];
  if (!selectedModel) {
    return res.status(400).json({ error: 'Invalid model selection' });
  }

  try {
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${selectedModel}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: `${basePrompt}${userPrompt ? ', ' + userPrompt : ''}`,
          parameters: {
            width: parseInt(width),
            height: parseInt(height),
            num_inference_steps: 28,
            guidance_scale: 7.5
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status} ${response.statusText}`);
    }

    const imageBuffer = await response.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString('base64');
    const imageUrl = `data:image/png;base64,${imageBase64}`;

    res.status(200).json({ imageUrl });
  } catch (error) {
    console.error('Error generating background:', error);
    res.status(500).json({ error: 'Failed to generate background', details: error.message });
  }
}
