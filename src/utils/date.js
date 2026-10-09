const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

export function toLocalISODate(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function toLocalTimeString(date = new Date()) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export function parseISODate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function formatDate(dateStr) {
  const date = parseISODate(dateStr)
  const day = String(date.getDate()).padStart(2, '0')
  return `${day} ${MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`
}

export function formatDateFull(dateStr) {
  const date = parseISODate(dateStr)
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`
}

export function formatTime(timeStr) {
  const [rawHours, minutes] = timeStr.split(':').map(Number)
  const suffix = rawHours >= 12 ? 'PM' : 'AM'
  const hours = rawHours % 12 || 12
  return `${hours}:${String(minutes).padStart(2, '0')} ${suffix}`
}

export function formatRelativeDate(dateStr) {
  const today = toLocalISODate()
  const yesterday = toLocalISODate(new Date(Date.now() - 86400000))
  if (dateStr === today) return 'Today'
  if (dateStr === yesterday) return 'Yesterday'
  return formatDate(dateStr)
}

export function formatFriendlyDateTime(dateStr, timeStr) {
  return `${formatRelativeDate(dateStr)}, ${formatTime(timeStr)}`
}

export function monthKey(dateStr) {
  return dateStr.slice(0, 7)
}

export function formatMonthLabel(key) {
  const [y, m] = key.split('-').map(Number)
  return `${MONTHS_SHORT[m - 1]} ${y}`
}

export function currentMonthKey() {
  return toLocalISODate().slice(0, 7)
}

export function getDateRange(preset) {
  const now = new Date()
  switch (preset) {
    case 'today': {
      const today = toLocalISODate(now)
      return { from: today, to: today }
    }
    case 'yesterday': {
      const yesterday = toLocalISODate(new Date(now.getTime() - 86400000))
      return { from: yesterday, to: yesterday }
    }
    case 'week': {
      const day = now.getDay()
      const offsetToMonday = day === 0 ? -6 : 1 - day
      const monday = new Date(now)
      monday.setDate(now.getDate() + offsetToMonday)
      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)
      return { from: toLocalISODate(monday), to: toLocalISODate(sunday) }
    }
    case 'month': {
      const from = toLocalISODate(
        new Date(now.getFullYear(), now.getMonth(), 1),
      )
      const to = toLocalISODate(
        new Date(now.getFullYear(), now.getMonth() + 1, 0),
      )
      return { from, to }
    }
    default:
      return null
  }
}
