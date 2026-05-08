import { STORAGE_KEYS } from './keys'
import { readJSON, writeJSON } from './base'

export type FavoriteEvaluationEntry = {
  name: string
  count: number       // 사용 빈도
  lastUsedAt: string  // ISO
}

export function getFavoriteEvaluations(): FavoriteEvaluationEntry[] {
  return readJSON<FavoriteEvaluationEntry[]>(STORAGE_KEYS.evaluationFavorites, [])
}

/** 평가 항목 사용 시 호출 → 빈도 +1, lastUsedAt 갱신 */
export function recordEvaluationUsage(name: string): void {
  const trimmed = name.trim()
  if (!trimmed) return
  const list = getFavoriteEvaluations()
  const idx = list.findIndex((f) => f.name === trimmed)
  const now = new Date().toISOString()
  if (idx >= 0) {
    list[idx] = { ...list[idx], count: list[idx].count + 1, lastUsedAt: now }
  } else {
    list.push({ name: trimmed, count: 1, lastUsedAt: now })
  }
  writeJSON(STORAGE_KEYS.evaluationFavorites, list)
}

/** 빈도 내림차순, 동률은 최근 사용순 */
export function getSortedEvaluationFavorites(): FavoriteEvaluationEntry[] {
  return [...getFavoriteEvaluations()].sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count
    return b.lastUsedAt.localeCompare(a.lastUsedAt)
  })
}
