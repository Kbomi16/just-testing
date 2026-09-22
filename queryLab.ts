export type LabPage = 1 | 2

export type LabItem = {
  id: string
  title: string
}

export type LabPagePayload = {
  page: number
  fetchedAt: string
  requestId: string
  items: LabItem[]
  note: string
}

export type LabLogTone = 'fetch' | 'cache' | 'gc' | 'error' | 'info'

export type LabLog = {
  id: number
  at: number
  tone: LabLogTone
  title: string
  detail: string
}

export type PushLabLog = (
  tone: LabLogTone,
  title: string,
  detail: string,
) => void

export const QUERY_LAB_ROOT_KEY = 'react-query-lab'

export const STALE_TIME = 10 * 1000
export const GC_TIME = 30 * 1000

export const getLabQueryKey = (page: LabPage) =>
  [QUERY_LAB_ROOT_KEY, 'items', page] as const

export const formatClock = (timestamp: number) => {
  const date = new Date(timestamp)
  const pad = (value: number, size = 2) => String(value).padStart(size, '0')

  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}`
}

export const formatDuration = (ms: number) => {
  if (ms <= 0) return '0초'

  const totalSeconds = Math.max(1, Math.floor(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  if (minutes === 0) return `${seconds}초`

  return `${minutes}분 ${seconds}초`
}

export const formatIsoTime = (value: string) => {
  const timestamp = Date.parse(value)

  if (Number.isNaN(timestamp)) return value

  return formatClock(timestamp)
}
