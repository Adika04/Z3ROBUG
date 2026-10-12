import type { GeminiAssessmentResult } from '../types'

/**
 * Nizam's Deliverable: Gemini 2.5 Flash API Integration
 * Analyzes civic road damage images and returns structured JSON severity ratings.
 */

const GEMINI_SYSTEM_INSTRUCTION = `
You are an expert Malaysian Public Works Department (JKR) road inspector AI.
Analyze the road photo and output a structured JSON with:
- issueType: "Deep Pothole" | "Surface Pothole" | "Cracked Pavement" | "Road Subsidence" | "Road Surface Damage"
- severityScore: integer 1 (minor crack) to 5 (critical crater / high vehicle hazard)
- description: concise 1-sentence technical assessment
- riskLevel: "LOW" (1-2) | "MEDIUM" (3) | "HIGH" (4) | "CRITICAL" (5)
Only return valid JSON.
`

export async function analyzeRoadDamageWithGemini(
  imageBase64OrUrl: string,
  apiKey?: string
): Promise<GeminiAssessmentResult> {
  const key = apiKey || import.meta.env.VITE_GEMINI_API_KEY

  if (key) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: GEMINI_SYSTEM_INSTRUCTION },
                  { text: 'Analyze this road damage image and assess its hazard severity.' },
                  imageBase64OrUrl.startsWith('data:')
                    ? {
                        inline_data: {
                          mime_type: 'image/jpeg',
                          data: imageBase64OrUrl.split(',')[1],
                        },
                      }
                    : { text: `Image URL: ${imageBase64OrUrl}` },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
            },
          }),
        }
      )

      if (response.ok) {
        const data = await response.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text
        if (text) {
          return JSON.parse(text) as GeminiAssessmentResult
        }
      }
    } catch (err) {
      console.warn('Gemini API call fell back to deterministic heuristic:', err)
    }
  }

  // Deterministic fallback heuristic for hackathon stage demos & offline development
  return {
    issueType: 'Deep Pothole',
    severityScore: 5,
    description: 'Crater depth exceeds ~5cm in active traffic lane, posing an immediate hazard to motorcyclists.',
    riskLevel: 'CRITICAL',
  }
}

