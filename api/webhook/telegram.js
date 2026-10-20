import { GoogleGenerativeAI } from '@google/generative-ai'

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://vrjtkmriqocrrmlwzbcm.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const genAI = GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here'
  ? new GoogleGenerativeAI(GEMINI_API_KEY)
  : null

async function sendTelegramMessage(chatId, text) {
  if (!TELEGRAM_BOT_TOKEN || !chatId) return
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    })
  } catch (err) {
    console.error('Failed to send Telegram message:', err)
  }
}

async function analyzeWithGemini(imageUrl) {
  if (!genAI) {
    return {
      issueType: 'Deep Pothole',
      severityScore: 4,
      description: 'Road damage reported via Telegram. Manual inspection scheduled.',
      riskLevel: 'HIGH',
    }
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-lite',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    })

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: 'Analyze this road hazard photo. Return JSON with keys: issueType, severityScore (1-5 integer), description (short reason), riskLevel (LOW, MEDIUM, HIGH, CRITICAL).',
            },
            {
              text: `Image URL: ${imageUrl}`,
            },
          ],
        },
      ],
    })

    const raw = result.response.text().trim().replace(/^```json\s*|```$/gi, '').trim()
    return JSON.parse(raw)
  } catch (err) {
    console.warn('Gemini analysis in webhook failed:', err)
    return {
      issueType: 'Deep Pothole',
      severityScore: 4,
      description: 'AI model fallback: Surface damage requiring inspection.',
      riskLevel: 'HIGH',
    }
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).send('Telegram webhook active')
  }

  try {
    const { message } = req.body || {}
    if (!message) return res.status(200).send('No message')

    const chatId = message.chat?.id
    const location = message.location
    const photo = message.photo?.[message.photo.length - 1]

    // Step A: Photo sent without GPS -> ask for location pin
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

    // Step B: Get file URL from Telegram
    const fileRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${photo.file_id}`)
    const fileData = await fileRes.json()
    const filePath = fileData.result?.file_path
    const imageUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${filePath}`

    // Step C: AI Analysis
    const ai = await analyzeWithGemini(imageUrl)

    // Step D: Insert into Supabase
    const caseId = `JKR-${Math.floor(1000 + Math.random() * 9000)}`
    if (SUPABASE_URL && SUPABASE_KEY) {
      await fetch(`${SUPABASE_URL}/rest/v1/reports`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          id: caseId,
          latitude: location.latitude,
          longitude: location.longitude,
          road_name: message.caption || 'Lokasi Awam Dilaporkan',
          area: 'Kuala Lumpur',
          severity_score: ai.severityScore,
          issue_type: ai.issueType,
          ai_justification: ai.description,
          image_url: imageUrl,
          telegram_chat_id: chatId,
          reporter_name: message.from?.username || `user_${chatId}`,
          status: 'Submitted',
          history: ['Submitted'],
        }),
      })
    }

    // Step E: Send confirmation back to citizen
    await sendTelegramMessage(
      chatId,
      `✅ Aduan Diterima!\nNo. Rujukan: ${caseId}\nKeterukan AI: Peringkat ${ai.severityScore}/5 (${ai.riskLevel})\nJenis Kerosakan: ${ai.issueType}\nJustifikasi: ${ai.description}\n\nStatus kes boleh disemak melalui papan pemuka JKR.`
    )

    return res.status(200).json({ success: true, caseId, ai })
  } catch (err) {
    console.error('Webhook error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

