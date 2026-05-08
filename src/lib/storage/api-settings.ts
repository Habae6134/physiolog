const KEY = 'physiolog_settings_api_key'

export function getApiKey(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(KEY)
}

export function setApiKey(key: string): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(KEY, key.trim())
}

export function clearApiKey(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(KEY)
}

export function maskApiKey(key: string): string {
  if (key.length <= 12) return '••••••••'
  return key.slice(0, 12) + '••••••••••••'
}
