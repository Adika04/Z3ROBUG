const SIMULATION_ROADS = [
  { road: 'Jalan Kuching', area: 'Kuala Lumpur', lat: 3.185, lng: 101.676 },
  { road: 'Jalan Gombak', area: 'Gombak', lat: 3.237, lng: 101.711 },
  { road: 'Jalan Ipoh', area: 'Kuala Lumpur', lat: 3.204, lng: 101.679 },
  { road: 'Jalan Klang Lama', area: 'Kuala Lumpur', lat: 3.079, lng: 101.668 },
  { road: 'Jalan Sentul', area: 'Kuala Lumpur', lat: 3.184, lng: 101.695 },
]

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1741996951019-a041d0477c82?w=900&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1784548789954-655c9a9e1a64?w=900&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1741997246403-9607826b51b8?w=900&auto=format&fit=crop',
]

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://vrjtkmriqocrrmlwzbcm.supabase.co'
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

    const randomRoad = SIMULATION_ROADS[Math.floor(Math.random() * SIMULATION_ROADS.length)]
    const randomImage = SAMPLE_IMAGES[Math.floor(Math.random() * SAMPLE_IMAGES.length)]
    const caseId = `JKR-${Math.floor(1000 + Math.random() * 9000)}`
    const priority = 5
    const issueType = 'Deep Pothole'
    const justification = 'Gemini AI Vision: Severe pothole cavity detected in active vehicle lane. Immediate hazard to two-wheelers.'

    const caseItem = {
      id: caseId,
      issue: issueType,
      road: randomRoad.road,
      area: randomRoad.area,
      priority,
      status: 'Assessed',
      lat: randomRoad.lat + (Math.random() - 0.5) * 0.01,
      lng: randomRoad.lng + (Math.random() - 0.5) * 0.01,
      time: 'Just now',
      image: randomImage,
      date: new Date().toISOString().slice(0, 10),
      history: ['Submitted', 'Assessed'],
      justification,
      reporterName: 'Telegram User @citizen_kl',
      telegramChatId: 987654321,
    }

    if (SUPABASE_URL && SUPABASE_KEY) {
      await fetch(`${SUPABASE_URL}/rest/v1/reports`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          id: caseId,
          latitude: caseItem.lat,
          longitude: caseItem.lng,
          road_name: caseItem.road,
          area: caseItem.area,
          severity_score: priority,
          issue_type: issueType,
          ai_justification: justification,
          image_url: randomImage,
          telegram_chat_id: 987654321,
          status: 'Assessed',
          history: ['Submitted', 'Assessed'],
        }),
      }).catch((e) => console.warn('Supabase insert failed during simulation:', e))
    }

    return res.status(200).json({
      success: true,
      caseItem,
      aiAnalysis: {
        issueType,
        severityScore: priority,
        description: justification,
        riskLevel: 'CRITICAL',
      },
    })
  } catch (err) {
    console.error('Simulation error:', err)
    return res.status(500).json({ error: 'Failed to simulate Telegram report' })
  }
}

