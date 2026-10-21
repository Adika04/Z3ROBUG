/**
 * UTP Codefest 2026 - Ingestion & AI Processing Server
 * Responsible: Adika (Ingestion/Backend) & Nizam (Gemini AI Vision)
 */

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { GoogleGenerativeAI } from '@google/generative-ai'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const ROOT_ENV_PATH = fileURLToPath(new URL('../.env', import.meta.url))

function loadEnvFile(envPath) {
  if (!fs.existsSync(envPath)) return

  const buffer = fs.readFileSync(envPath)
  let envFile = buffer.toString('utf8')

  if (buffer.length >= 2) {
    const bom0 = buffer[0]
    const bom1 = buffer[1]

    if (bom0 === 0xff && bom1 === 0xfe) {
      envFile = buffer.toString('utf16le')
    } else if (bom0 === 0xfe && bom1 === 0xff) {
      envFile = buffer.subarray(2).swap16().toString('utf16le')
    }
  }

  envFile = envFile.replace(/^\uFEFF/, '')

  for (const line of envFile.split(/\r?\n/)) {
    const trimmedLine = line.trim()
    if (!trimmedLine || trimmedLine.startsWith('#') || !trimmedLine.includes('=')) continue

    const separatorIndex = trimmedLine.indexOf('=')
    const key = trimmedLine.slice(0, separatorIndex).trim()
    const value = trimmedLine.slice(separatorIndex + 1).trim()

    if (key && !process.env[key] && value) {
      process.env[key] = value
    }
  }
}

dotenv.config({ path: ROOT_ENV_PATH })
loadEnvFile(ROOT_ENV_PATH)

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))

const PORT = process.env.PORT || 3001
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null
const SIMULATION_IMAGE_PATH = fileURLToPath(new URL('../src/assets/kuala-lumpur-road.jpg', import.meta.url))
const SIMULATION_ROADS = [
  { road: 'Jalan Kuching', area: 'Kuala Lumpur', lat: 3.185, lng: 101.676 },
  { road: 'Jalan Gombak', area: 'Gombak', lat: 3.237, lng: 101.711 },
  { road: 'Jalan Ipoh', area: 'Kuala Lumpur', lat: 3.204, lng: 101.679 },
  { road: 'Jalan Klang Lama', area: 'Kuala Lumpur', lat: 3.079, lng: 101.668 },
]

// 1. Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  })
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

    // Step C: Nizam's Gemini 3.5 Flash AI Vision Analysis
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

app.post('/api/analyze-road-damage', async (req, res) => {
  try {
    const { imageBase64 } = req.body || {}

    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' })
    }

    const result = await analyzeRoadDamage(imageBase64)
    return res.json(mapToGeminiAssessmentResult(result))
  } catch (error) {
    console.error('Road damage analysis route failed:', error)
    return res.status(500).json({ error: 'AI analysis failed' })
  }
})

app.post('/api/simulate-telegram-report', async (req, res) => {
  try {
    let imageBase64 = req.body?.imageBase64
    let displayImageUrl = imageBase64

    if (!imageBase64 && req.body?.imageUrl) {
      try {
        const imgRes = await fetch(req.body.imageUrl)
        if (imgRes.ok) {
          const arrayBuf = await imgRes.arrayBuffer()
          const mime = imgRes.headers.get('content-type') || 'image/jpeg'
          imageBase64 = `data:${mime};base64,${Buffer.from(arrayBuf).toString('base64')}`
          displayImageUrl = req.body.imageUrl
        }
      } catch (fetchErr) {
        console.warn('Could not fetch provided imageUrl, using fallback:', fetchErr.message)
      }
    }

    if (!imageBase64) {
      const imageBuffer = fs.readFileSync(SIMULATION_IMAGE_PATH)
      imageBase64 = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`
      displayImageUrl = imageBase64
    }

    const aiAnalysis = await analyzeRoadDamage(imageBase64)
    const randomRoad = SIMULATION_ROADS[Math.floor(Math.random() * SIMULATION_ROADS.length)]
    const caseId = `JKR-${Math.floor(1000 + Math.random() * 9000)}`

    const caseItem = {
      id: caseId,
      issue: aiAnalysis.issue_type,
      road: randomRoad.road,
      area: randomRoad.area,
      priority: aiAnalysis.priority_score,
      status: 'Assessed',
      lat: randomRoad.lat,
      lng: randomRoad.lng,
      time: 'Just now',
      image: displayImageUrl,
      date: new Date().toISOString().slice(0, 10),
      history: ['Submitted', 'Assessed'],
      justification: aiAnalysis.ai_justification,
      reporterName: 'Telegram User @citizen_kl',
      telegramChatId: 987654321,
    }

    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY && !SUPABASE_URL.includes('your-project')) {
      try {
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
            latitude: randomRoad.lat,
            longitude: randomRoad.lng,
            road_name: randomRoad.road,
            severity_score: aiAnalysis.priority_score,
            issue_type: aiAnalysis.issue_type,
            ai_justification: aiAnalysis.ai_justification,
            image_url: displayImageUrl,
            telegram_chat_id: 987654321,
            status: 'Assessed',
          }),
        })
      } catch (dbErr) {
        console.warn('Optional Supabase insert skipped:', dbErr.message)
      }
    }

    return res.json({
      success: true,
      caseItem,
      aiAnalysis,
    })
  } catch (error) {
    console.error('Simulation route failed:', error)
    return res.status(500).json({ error: 'Failed to simulate Telegram report' })
  }
})

async function analyzeRoadDamage(imageBase64) {
  if (!imageBase64 || typeof imageBase64 !== 'string') {
    throw new Error('imageBase64 is required')
  }

  if (!genAI || !GEMINI_API_KEY) {
    return {
      priority_score: 3,
      issue_type: 'Pothole',
      ai_justification: 'Gemini API key is not configured. Manual inspection is required before actioning this maintenance request.',
    }
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash-lite',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
      systemInstruction: `
        You are a Malaysian JKR road inspection AI.
        Evaluate the road damage severity from the image.
        Return only valid JSON with exactly these keys:
        {
          "priority_score": integer from 1 to 5,
          "issue_type": "Pothole" | "Cracked Road" | "Surface Erosion" | "Road Subsidence" | "Debris/Obstruction",
          "ai_justification": "1 to 2 sentence explanation for JKR officers"
        }
        Rules:
        - priority_score must be an integer between 1 and 5.
        - 1 = minor defect, 5 = critical immediate hazard.
        - issue_type should match the road defect type.
        - ai_justification must be clear, technical, and brief.
        - No markdown, no extra keys, no commentary.
      `,
    })

    const dataUrlMatch = imageBase64.match(/^data:([^;]+);base64,(.+)$/)
    const mimeType = dataUrlMatch?.[1] || 'image/jpeg'
    const base64Data = dataUrlMatch ? dataUrlMatch[2] : imageBase64

    const result = await generateContentWithRetry(model, {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: 'Analyze this road damage image and determine repair priority for JKR. Return only the required JSON object.',
            },
            {
              inlineData: {
                mimeType,
                data: base64Data,
              },
            },
          ],
        },
      ],
    })

    const rawText = result.response.text().trim()
    const cleanJson = rawText.replace(/^```json\s*|```$/gi, '').trim()
    const parsed = JSON.parse(cleanJson)

    const priorityScore = Number.parseInt(parsed.priority_score, 10)

    return {
      priority_score: Number.isInteger(priorityScore) ? Math.min(5, Math.max(1, priorityScore)) : 3,
      issue_type: typeof parsed.issue_type === 'string' && parsed.issue_type.trim() ? parsed.issue_type.trim() : 'Pothole',
      ai_justification:
        typeof parsed.ai_justification === 'string' && parsed.ai_justification.trim()
          ? parsed.ai_justification.trim()
          : 'AI assessment indicates road damage requiring inspection and maintenance prioritization.',
    }
  } catch (error) {
    console.error('Gemini road damage analysis failed:', error?.message || error)

    return {
      priority_score: 3,
      issue_type: 'Pothole',
      ai_justification:
        'AI assessment could not be completed due to a model or image-processing error. Manual review is recommended before scheduling repair work.',
    }
  }
}

function mapToGeminiAssessmentResult(result) {
  const priorityScore = Number.isInteger(result.priority_score) ? result.priority_score : 3
  const issueType =
    typeof result.issue_type === 'string' && result.issue_type.trim() && result.issue_type.trim().toLowerCase() !== 'none'
      ? result.issue_type.trim()
      : 'Pothole'

  return {
    issueType,
    severityScore: priorityScore,
    description: result.ai_justification,
    riskLevel: priorityScore >= 5 ? 'CRITICAL' : priorityScore >= 4 ? 'HIGH' : priorityScore >= 3 ? 'MEDIUM' : 'LOW',
  }
}

async function sendTelegramMessage(chatId, text) {
  if (!TELEGRAM_BOT_TOKEN) return
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  })
}

async function analyzeWithGemini(imageUrl) {
  if (!genAI || !GEMINI_API_KEY) {
    return {
      issueType: 'Deep Pothole',
      severityScore: 4,
      description: 'Gemini API key is not configured. Manual inspection is required.',
      riskLevel: 'HIGH',
    }
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    })

    const result = await generateContentWithRetry(model, {
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

    const rawText = result.response.text().trim()
    const cleanJson = rawText.replace(/^```json\s*|```$/gi, '').trim()
    return JSON.parse(cleanJson)
  } catch (error) {
    console.error('Gemini fallback analysis failed:', error?.message || error)
    return {
      issueType: 'Deep Pothole',
      severityScore: 4,
      description: 'Model analysis failed. Manual review is required before scheduling repair work.',
      riskLevel: 'HIGH',
    }
  }
}

async function generateContentWithRetry(model, request, attempts = 3) {
  let lastError

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await model.generateContent(request)
    } catch (error) {
      lastError = error

      const status = error?.status || error?.response?.status
      const isRetryable = status === 503 || status === 429

      if (!isRetryable || attempt === attempts) {
        throw error
      }

      const delayMs = 750 * attempt
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }

  throw lastError
}

app.listen(PORT, () => {
  console.log(`Ingestion server running on http://localhost:${PORT}`)
})

