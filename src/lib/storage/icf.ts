import type { IcfAssessment } from '@/features/icf/domain/types'
import { STORAGE_KEYS } from './keys'
import { newId, nowISO, readJSON, writeJSON } from './base'

export function getIcfAssessments(patientId: string): IcfAssessment[] {
  const list = readJSON<IcfAssessment[]>(STORAGE_KEYS.icf(patientId), [])
  return [...list].sort((a, b) => b.date.localeCompare(a.date))
}

export function createIcfAssessment(
  patientId: string,
  data: Omit<IcfAssessment, 'id' | 'patientId' | 'createdAt'>,
): IcfAssessment {
  const assessment: IcfAssessment = {
    ...data,
    id: newId(),
    patientId,
    createdAt: nowISO(),
  }
  const list = readJSON<IcfAssessment[]>(STORAGE_KEYS.icf(patientId), [])
  writeJSON(STORAGE_KEYS.icf(patientId), [...list, assessment])
  return assessment
}

export function deleteIcfAssessment(patientId: string, id: string): boolean {
  const list = readJSON<IcfAssessment[]>(STORAGE_KEYS.icf(patientId), [])
  const next = list.filter((a) => a.id !== id)
  if (next.length === list.length) return false
  writeJSON(STORAGE_KEYS.icf(patientId), next)
  return true
}
