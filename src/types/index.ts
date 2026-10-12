export type CaseStatus =
  | 'Submitted'
  | 'Assessed'
  | 'In Progress'
  | 'Resolved'
  | 'Closed'

export type Case = {
  id: string
  issue: string
  road: string
  area: string
  priority: number // 1 to 5
  status: CaseStatus
  lat: number
  lng: number
  time: string
  image: string
  date: string
  history: string[]
  justification?: string
  telegramChatId?: string | number
  reporterName?: string
}

export type StaffRole = 'Admin' | 'JKR Officer' | 'Viewer'

export type StaffUser = {
  id?: string
  name: string
  email: string
  role: StaffRole
  active: boolean
}

export type GeminiAssessmentResult = {
  issueType: string
  severityScore: number // 1 - 5
  description: string
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
}

export type TelegramSubmission = {
  chatId: number | string
  photoUrl: string
  latitude: number
  longitude: number
  roadName?: string
  timestamp: string
}

