import { readJSON, writeJSON } from './base'
import { STORAGE_KEYS } from './keys'

const DEFAULT_FLAGS = [
  '컨디션 좋음',
  '통증 재발',
  '동작 시 통증',
  '피로도 높음',
  '가동범위 개선',
  '숙제 미수행',
  '회복의지 높음',
]

export const flagStore = {
  getFlags(): string[] {
    const flags = readJSON<string[]>(STORAGE_KEYS.customFlags, [])
    if (flags.length === 0) {
      // 초기값 저장
      writeJSON(STORAGE_KEYS.customFlags, DEFAULT_FLAGS)
      return DEFAULT_FLAGS
    }
    return flags
  },

  addFlag(flag: string) {
    const flags = this.getFlags()
    if (flags.includes(flag)) return
    writeJSON(STORAGE_KEYS.customFlags, [...flags, flag])
  },

  deleteFlag(flag: string) {
    const flags = this.getFlags()
    writeJSON(STORAGE_KEYS.customFlags, flags.filter(f => f !== flag))
  }
}
