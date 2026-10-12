import type { Case, CaseStatus } from '../types'

export const priorityColors = ['#16A34A', '#3B82F6', '#EAB308', '#F59E0B', '#E53935']

export const priorityNames = ['Minor', 'Low', 'Medium', 'High', 'Critical']

export const priorityClasses = [
  'bg-priority-1/10 text-green-800 [&>span]:text-priority-1',
  'bg-priority-2/10 text-blue-800 [&>span]:text-priority-2',
  'bg-priority-3/10 text-yellow-800 [&>span]:text-priority-3',
  'bg-priority-4/10 text-amber-800 [&>span]:text-priority-4',
  'bg-priority-5/10 text-red-700 [&>span]:text-priority-5',
]

export const samplePhotos = [
  'https://images.unsplash.com/photo-1741996951019-a041d0477c82?w=900&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1784548789954-655c9a9e1a64?w=900&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1741997246403-9607826b51b8?w=900&auto=format&fit=crop',
]

type RawCaseRow = [string, string, string, string, number, CaseStatus, number, number, string]

const rawCases: RawCaseRow[] = [
  ['1048', 'Deep Pothole', 'Jalan Kuching', 'Kuala Lumpur', 5, 'Assessed', 3.185, 101.676, '4 min ago'],
  ['1047', 'Road Surface Damage', 'Jalan Ampang', 'Kuala Lumpur', 4, 'Submitted', 3.158, 101.735, '12 min ago'],
  ['1046', 'Deep Pothole', 'Jalan Gombak', 'Gombak', 5, 'In Progress', 3.237, 101.711, '28 min ago'],
  ['1045', 'Cracked Pavement', 'Jalan SS 2/24', 'Petaling Jaya', 3, 'Assessed', 3.117, 101.622, '42 min ago'],
  ['1044', 'Road Subsidence', 'Jalan Cheras', 'Cheras', 4, 'In Progress', 3.091, 101.738, '1 hour ago'],
  ['1043', 'Surface Pothole', 'Jalan Tun Razak', 'Kuala Lumpur', 2, 'Resolved', 3.173, 101.718, '2 hours ago'],
  ['1042', 'Minor Surface Crack', 'Jalan Universiti', 'Petaling Jaya', 1, 'Resolved', 3.113, 101.656, '3 hours ago'],
  ['1041', 'Deep Pothole', 'Jalan Klang Lama', 'Kuala Lumpur', 4, 'Assessed', 3.079, 101.668, '4 hours ago'],
  ['1040', 'Cracked Pavement', 'Jalan Sultan', 'Kuala Lumpur', 3, 'Closed', 3.143, 101.697, '5 hours ago'],
  ['1039', 'Surface Pothole', 'Jalan Kepong', 'Kepong', 2, 'Submitted', 3.213, 101.64, '6 hours ago'],
  ['1038', 'Road Surface Damage', 'Jalan Puchong', 'Puchong', 3, 'Resolved', 3.046, 101.623, 'Yesterday'],
  ['1037', 'Deep Pothole', 'Jalan Ipoh', 'Kuala Lumpur', 5, 'Resolved', 3.204, 101.679, 'Yesterday'],
]

export const initialCases: Case[] = rawCases.map((row, index) => ({
  id: `JKR-${row[0]}`,
  issue: row[1],
  road: row[2],
  area: row[3],
  priority: row[4],
  status: row[5],
  lat: row[6],
  lng: row[7],
  time: row[8],
  image: samplePhotos[index % 3],
  date: index > 9 ? '2026-10-05' : '2026-10-06',
  history: [
    'Submitted',
    ...(row[5] !== 'Submitted' ? ['Assessed'] : []),
    ...(['In Progress', 'Resolved', 'Closed'].includes(row[5]) ? ['In Progress'] : []),
    ...(['Resolved', 'Closed'].includes(row[5]) ? [row[5]] : []),
  ],
  justification:
    row[4] >= 4
      ? `Severity Score ${row[4]}/5: Structural crater depth exceeds safety threshold. High incident likelihood for two-wheelers.`
      : `Severity Score ${row[4]}/5: Superficial surface wear. Normal scheduling priority.`,
  reporterName: `Citizen ${1000 + index}`,
  telegramChatId: 987654321 + index,
}))

