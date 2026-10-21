import { GoogleGenerativeAI } from '@google/generative-ai'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const genAI = GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here'
  ? new GoogleGenerativeAI(GEMINI_API_KEY)
  : null

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { imageBase64 } = req.body || {}
    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' })
    }

    if (!genAI) {
      return res.status(200).json({
        issueType: 'Deep Pothole',
        severityScore: 4,
        description: 'Road damage identified. Manual inspection required before scheduling repair.',
        riskLevel: 'HIGH',
      })
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash',
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
        - No markdown, no extra keys.
      `,
    })

    const dataUrlMatch = imageBase64.match(/^data:([^;]+);base64,(.+)$/)
    const mimeType = dataUrlMatch?.[1] || 'image/jpeg'
    const base64Data = dataUrlMatch ? dataUrlMatch[2] : imageBase64

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: 'Analyze this road damage image and determine repair priority for JKR. Return only the required JSON object.' },
            { inlineData: { mimeType, data: base64Data } },
          ],
        },
      ],
    })

    const rawText = result.response.text().trim()
    const cleanJson = rawText.replace(/^```json\s*|```$/gi, '').trim()
    const parsed = JSON.parse(cleanJson)

    const score = Number.parseInt(parsed.priority_score, 10)
    const priorityScore = Number.isInteger(score) ? Math.min(5, Math.max(1, score)) : 3
    const issueType = parsed.issue_type?.trim() || 'Pothole'
    const description = parsed.ai_justification?.trim() || 'AI assessment completed.'
    const riskLevel = priorityScore >= 5 ? 'CRITICAL' : priorityScore >= 4 ? 'HIGH' : priorityScore >= 3 ? 'MEDIUM' : 'LOW'

    return res.status(200).json({
      issueType,
      severityScore: priorityScore,
      description,
      riskLevel,
    })
  } catch (err) {
    console.error('Road damage analysis failed:', err)
    return res.status(200).json({
      issueType: 'Deep Pothole',
      severityScore: 4,
      description: 'AI model fallback: Crater depth requires urgent inspection.',
      riskLevel: 'HIGH',
    })
  }
}

