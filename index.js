module.exports = (req, res) => {
  console.log('Received request:', req.url);
  res.status(200).json({ message: 'Hello from Vercel!' });
};
