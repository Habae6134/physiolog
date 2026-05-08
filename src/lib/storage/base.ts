// SSR-safe localStorage helpers.
// 직접 localStorage.getItem/setItem 호출 금지 — 항상 이 모듈 경유.

const isBrowser = () => typeof window !== 'undefined'

export function readJSON<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeJSON<T>(key: string, value: T): void {
  if (!isBrowser()) return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    // QuotaExceededError 등
    console.error('[storage] write failed:', key, err)
  }
}

export function removeKey(key: string): void {
  if (!isBrowser()) return
  window.localStorage.removeItem(key)
}

export function newId(): string {
  if (isBrowser() && typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  // SSR fallback
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function nowISO(): string {
  return new Date().toISOString()
}
