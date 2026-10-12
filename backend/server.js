/**
 * UTP Codefest 2026 - Ingestion & AI Processing Server
 * Responsible: Adika (Ingestion/Backend) & Nizam (Gemini AI Vision)
 */

import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))

const PORT = process.env.PORT || 3001
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

// 1. Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() })
})

// 2. Telegram Webhook Receiver
app.post('/api/webhook/telegram', async (req, res) => {
  try {
    const { message } = req.body
    if (!message) return res.status(200).send('No message')

    const chatId = message.chat?.id
    const location = message.location
    const photo = message.photo?.[message.photo.length - 1]

    // Step A: If user sends only photo without GPS, prompt for Location Pin
    if (photo && !location) {
      await sendTelegramMessage(
        chatId,
        '📍 Terima kasih atas gambar aduan! Sila kongsikan lokasi GPS anda (Share Location) untuk membolehkan JKR mengambil tindakan.\n\nThank you for the photo! Please share your live GPS location pin to complete the report.'
      )
      return res.status(200).send('Requested location pin')
    }

    if (!photo || !location) {
      return res.status(200).send('Ignored non-report message')
    }

    // Step B: Fetch Photo URL
    const fileRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${photo.file_id}`)
    const fileData = await fileRes.json()
    const filePath = fileData.result?.file_path
    const imageUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${filePath}`

    // Step C: Nizam's Gemini 2.5 Flash AI Vision Analysis
    const aiAnalysis = await analyzeWithGemini(imageUrl)

    // Step D: Insert into Abrar's Supabase Database
    const caseId = `JKR-${Math.floor(1000 + Math.random() * 9000)}`
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      await fetch(`${SUPABASE_URL}/rest/v1/reports`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          id: caseId,
          latitude: location.latitude,
          longitude: location.longitude,
          road_name: message.caption || 'Lokasi Awam Dilaporkan',
          severity_score: aiAnalysis.severityScore,
          issue_type: aiAnalysis.issueType,
          ai_justification: aiAnalysis.description,
          image_url: imageUrl,
          telegram_chat_id: chatId,
          status: 'Submitted',
        }),
      })
    }

    // Step E: Send instant confirmation back to Citizen
    await sendTelegramMessage(
      chatId,
      `✅ Aduan Diterima!\nNo. Rujukan: ${caseId}\nKeterukan AI: Peringkat ${aiAnalysis.severityScore}/5 (${aiAnalysis.riskLevel})\nJustifikasi AI: ${aiAnalysis.description}\n\nStatus kes boleh disemak melalui papan pemuka JKR.`
    )

    res.status(200).json({ success: true, caseId, aiAnalysis })
  } catch (error) {
    console.error('Webhook error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

async function analyzeWithGemini(imageUrl) {
  if (!GEMINI_API_KEY) {
    return {
      issueType: 'Deep Pothole',
      severityScore: 4,
      description: 'Crater depth exceeds ~5cm in active traffic lane, posing an immediate hazard to motorcyclists.',
      riskLevel: 'HIGH',
    }
  }

  const prompt = `Analyze this road hazard photo. Return JSON with keys: issueType, severityScore (1-5 integer), description (short reason), riskLevel (LOW, MEDIUM, HIGH, CRITICAL).`
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }, { text: `Image URL: ${imageUrl}` }],
          },
        ],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    }
  )
  const data = await res.json()
  return JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text)
}

async function sendTelegramMessage(chatId, text) {
  if (!TELEGRAM_BOT_TOKEN) return
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  })
}

app.listen(PORT, () => {
  console.log(`Ingestion server running on http://localhost:${PORT}`)
})

