import { RELATIONSHIP_START } from './config'

export const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

export function diffDays(fromISO, to = new Date()) {
  const from = new Date(`${fromISO}T00:00:00`)
  const ms = to.getTime() - from.getTime()
  return Math.max(0, Math.floor(ms / 86400000))
}

export function diffFull(fromISO) {
  const from = new Date(`${fromISO}T00:00:00`)
  const now = new Date()
  const totalSec = Math.max(0, Math.floor((now.getTime() - from.getTime()) / 1000))
  return {
    days: Math.floor(totalSec / 86400),
    hours: Math.floor((totalSec % 86400) / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
  }
}

export function formatMonth(month) {
  const [y, m] = month.split('-')
  return `${MONTH_NAMES[Number(m) - 1]} ’${y.slice(2)}`
}

export function formatDateNice(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.slice(0, 10).split('-')
  return `${Number(d)} ${MONTH_NAMES[Number(m) - 1]} ${y}`
}

export function haversineKm(a, b) {
  if (!a || !b) return null
  const R = 6371
  const toRad = (deg) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const la1 = toRad(a.lat)
  const la2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export function formatDistanceKm(km) {
  if (km == null) return '—'
  if (km < 1) return `${Math.round(km * 1000)} m`
  if (km < 100) return `${km.toFixed(1)} km`
  return `${Math.round(km)} km`
}

export function timeAgo(iso) {
  if (!iso) return 'never'
  const diffSec = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000))
  if (diffSec < 60) return 'just now'
  const min = Math.floor(diffSec / 60)
  if (min < 60) return `${min} min ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} hr ago`
  return `${Math.floor(hr / 24)} day${hr >= 48 ? 's' : ''} ago`
}

export function sumStats(stats) {
  return {
    fights: stats.reduce((a, s) => a + Number(s.fights || 0), 0),
    longDistanceDays: stats.reduce((a, s) => a + Number(s.longDistanceDays || 0), 0),
    dates: stats.reduce((a, s) => a + Number(s.dates || 0), 0),
    photos: stats.reduce((a, s) => a + Number(s.photoCount || 0), 0),
    problems: stats.reduce((a, s) => a + Number(s.problemsSolved || 0), 0),
  }
}

export function computeSummary(stats, startISO = RELATIONSHIP_START) {
  const { days: daysTogether } = diffFull(startISO)
  const totals = sumStats(stats)

  const milestones = [
    { days: 100, label: '100 days together' },
    { days: 200, label: '200 days together' },
    { days: 300, label: '300 days together' },
    { days: 365, label: '1 full year together' },
    { days: 400, label: '400 days together' },
    { days: 500, label: '500 days together' },
    { days: 730, label: '2 full years together' },
    { days: 1000, label: '1000 days together' },
  ]

  const reached = milestones
    .filter((m) => daysTogether >= m.days)
    .map((m) => ({ label: m.label, days: m.days }))
  const next = milestones.find((m) => daysTogether < m.days)
  let nextMilestoneLabel = ''
  let daysUntilNextMilestone = 0
  let progress = 1
  if (next) {
    nextMilestoneLabel = next.label
    daysUntilNextMilestone = next.days - daysTogether
    const previous = reached.length ? reached[reached.length - 1].days : 0
    progress = Math.min(1, (daysTogether - previous) / (next.days - previous))
  }

  return {
    daysTogether,
    daysLovedCrazy: daysTogether,
    ...totals,
    nextMilestoneLabel,
    daysUntilNextMilestone,
    progress,
    reached,
  }
}