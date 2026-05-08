/** ISO yyyy-mm-dd 또는 ISO datetime → "2026.05.05" */
export function formatDate(iso: string | undefined | null): string {
  if (!iso) return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '-'
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}.${m}.${day}`
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const

/** "5/5 (월)" — 카드 미리보기용 */
export function formatDateShort(iso: string | undefined | null): string {
  if (!iso) return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '-'
  return `${d.getMonth() + 1}/${d.getDate()} (${WEEKDAYS[d.getDay()]})`
}

/** "오늘", "어제", "3일 전", 그 이상은 "5/5 (월)" */
export function formatDateRelative(iso: string | undefined | null): string {
  if (!iso) return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '-'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(d)
  target.setHours(0, 0, 0, 0)
  const diffDays = Math.floor((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return '오늘'
  if (diffDays === 1) return '어제'
  if (diffDays > 1 && diffDays <= 7) return `${diffDays}일 전`
  return formatDateShort(iso)
}

/** Date 객체 → ISO yyyy-mm-dd (date input value 호환) */
export function toISODate(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** birthDate → 만 나이 */
export function calcAge(birthDate: string | undefined | null): number | undefined {
  if (!birthDate) return undefined
  const b = new Date(birthDate)
  if (Number.isNaN(b.getTime())) return undefined
  const now = new Date()
  let age = now.getFullYear() - b.getFullYear()
  const m = now.getMonth() - b.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--
  return age
}
