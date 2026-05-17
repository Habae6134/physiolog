import { STORAGE_KEYS } from './keys'
import { readJSON, writeJSON } from './base'
import type { ExerciseConcept } from '@/features/treatments/domain/types'

/** 목적별 운동이름 히스토리를 localStorage에 저장/조회 */

export function getNames(concept: ExerciseConcept): string[] {
  return readJSON<string[]>(STORAGE_KEYS.exerciseHistory(concept), [])
}

export function addNames(concept: ExerciseConcept, names: string[]): void {
  const existing = new Set(getNames(concept))
  for (const n of names) {
    const trimmed = n.trim()
    if (trimmed) existing.add(trimmed)
  }
  // 한국어/영어 혼합 가나다·알파벳 정렬
  const sorted = [...existing].sort((a, b) => a.localeCompare(b, 'ko'))
  writeJSON(STORAGE_KEYS.exerciseHistory(concept), sorted)
}
