export default function handler(req, res) {
  const key = process.env.GEMINI_API_KEY
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    geminiKeyConfigured: Boolean(key) && key !== 'your_gemini_api_key_here',
  })
}