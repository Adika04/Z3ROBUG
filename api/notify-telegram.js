// api/notify-telegram.js
// Vercel serverless function: sends a Telegram message to the citizen who filed a report.
// Needs the TELEGRAM_BOT_TOKEN environment variable (server-side, NOT prefixed with VITE_).

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const token = process.env.TELEGRAM_BOT_TOKEN
  const { chatId, caseId, road, area } = req.body || {}

  if (!token || !chatId) {
    return res.status(200).json({ sent: false, reason: 'Missing TELEGRAM_BOT_TOKEN or chatId' })
  }

  const text =
    `🎉 Aduan ${caseId} telah SELESAI dibaiki oleh JKR!\n` +
    `Lokasi: ${road}, ${area}\n` +
    `Terima kasih kerana membantu memastikan jalan raya kita selamat.\n\n` +
    `Report ${caseId} has been marked as RESOLVED by JKR. Thank you for making our roads safer!`

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    })
    const data = await response.json()
    return res.status(200).json({ sent: Boolean(data.ok), reason: data.description })
  } catch (err) {
    console.error('Telegram notify failed:', err)
    return res.status(200).json({ sent: false, reason: String(err) })
  }
}
