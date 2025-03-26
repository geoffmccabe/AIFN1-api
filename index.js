const { HfInference } = require('@huggingface/inference');
const Arweave = require('arweave');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
});

module.exports = async (req, res) => {
  console.log('Received request:', req.url);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.url.startsWith('/api/generate-background')) {
    try {
      console.log('Environment HUGGINGFACE_API_KEY:', process.env.HUGGINGFACE_API_KEY ? 'Set' : 'Not set');
      if (!process.env.HUGGINGFACE_API_KEY) {
        console.error('HUGGINGFACE_API_KEY is not set');
        return res.status(500).json({ error: 'HUGGINGFACE_API_KEY is not set' });
      }

      const basePrompt = "1girl, shiyang, ((((small breasts)))), (white skull belt buckle, front hair locks, black flat dragon tattoo on right shoulder, black flat dragon tattoo on right arm, red clothes, shoulder tattoo,:1.1), golden jewelry, long hair, earrings, black hair, golden hoop earrings, clothing cutout, ponytail, cleavage cutout, cleavage, bracelet, midriff, cheongsam top, red choli top, navel, makeup, holding, pirate pistol, lips, pirate gun, black shorts, looking at viewer, dynamic pose, ((asian girl)), action pose, (white skull belt buckle), black dragon tattoo on right shoulder, black dragon tattoo on right arm, ((shoulder tattoo))";
      const userPrompt = req.query.prompt || "";
      const weightedUserPrompt = userPrompt ? `(((${userPrompt})))` : ""; // Add triple parentheses for weighting
      const fullPrompt = `${basePrompt}${weightedUserPrompt ? ", " + weightedUserPrompt : ""}`;

      console.log(`Generating background with prompt: ${fullPrompt}`);

      // Initialize the Hugging Face Inference Client
      const client = new HfInference(process.env.HUGGINGFACE_API_KEY);

      // Use the textToImage method to explicitly specify the task
      const imageBuffer = await client.textToImage({
        model: 'LightningWorks/shiyangv1',
        prompt: fullPrompt,
        parameters: {
          guidance_scale: 7.5,
          num_inference_steps: 20,
          height: 600,
          width: 600
        }
      });

      // Convert the image buffer to a base64 data URL
      const imageUrl = `data:image/webp;base64,${imageBuffer.toString('base64')}`;

      res.status(200).json({
        imageUrl: imageUrl,
        metadata: fullPrompt
      });
    } catch (error) {
      console.error('Error in /api/generate-background:', error.message, error.stack);
      res.status(500).json({ error: 'Failed to generate background: ' + error.message });
    }
  } else if (req.url === '/api/upload-to-arweave') {
    try {
      const files = await new Promise((resolve, reject) => {
        upload.array('images')(req, res, (err) => {
          if (err) reject(err);
          resolve(req.files);
        });
      });

      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No images uploaded.' });
      }

      if (!process.env.ARWEAVE_KEY) {
        console.error('ARWEAVE_KEY is not set');
        return res.status(500).json({ error: 'ARWEAVE_KEY is not set' });
      }

      const wallet = JSON.parse(process.env.ARWEAVE_KEY);
      const transactionIds = [];

      for (const file of files) {
        const transaction = await arweave.createTransaction({
          data: file.buffer
        }, wallet);
        transaction.addTag('Content-Type', file.mimetype);
        await arweave.transactions.sign(transaction, wallet);
        await arweave.transactions.post(transaction);
        transactionIds.push(transaction.id);
      }

      res.status(200).json({ transactionIds });
    } catch (error) {
      console.error('Error in /api/upload-to-arweave:', error);
      res.status(500).json({ error: 'Failed to upload to Arweave: ' + error.message });
    }
  } else {
    res.status(404).json({ error: 'Not found' });
  }
};
