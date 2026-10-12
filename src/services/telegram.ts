import type { Case, TelegramSubmission } from '../types'

/**
 * Adika's Deliverable: Telegram Bot Ingestion & Notification Logic
 * Primary Interface: @AduanPotholeBot
 */

export function formatTelegramResolutionMessage(caseItem: Case, language: 'en' | 'ms' = 'en'): string {
  if (language === 'ms') {
    return `🎉 Aduan ${caseItem.id} telah SELESAI dibaiki oleh JKR!\nLokasi: ${caseItem.road}, ${caseItem.area}\nStatus: Selesai / Ditutup\nTerima kasih kerana membantu memastikan jalan raya kita selamat.`
  }
  return `🎉 Report ${caseItem.id} has been marked as RESOLVED by JKR!\nLocation: ${caseItem.road}, ${caseItem.area}\nStatus: Resolved\nThank you for making our roads safer!`
}

export function parseTelegramWebhook(body: any): TelegramSubmission | null {
  try {
    const message = body?.message
    if (!message) return null

    const location = message.location
    const photo = message.photo?.[message.photo.length - 1] // highest resolution photo

    return {
      chatId: message.chat?.id,
      photoUrl: photo?.file_id ? `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${photo.file_id}` : '',
      latitude: location?.latitude ?? 3.1412,
      longitude: location?.longitude ?? 101.6865,
      roadName: message.caption || 'Jalan Dilaporkan',
      timestamp: new Date(message.date * 1000).toISOString(),
    }
  } catch {
    return null
  }
}

