import type { Patient, PatientInput } from '@/features/patients/domain/types'
import { STORAGE_KEYS } from './keys'
import { newId, nowISO, readJSON, writeJSON } from './base'

export function getAllPatients(): Patient[] {
  return readJSON<Patient[]>(STORAGE_KEYS.patients, [])
}

export function getPatient(id: string): Patient | undefined {
  return getAllPatients().find((p) => p.id === id)
}

export function createPatient(input: PatientInput): Patient {
  const now = nowISO()
  const patient: Patient = {
    ...input,
    id: newId(),
    createdAt: now,
    updatedAt: now,
  }
  const all = getAllPatients()
  writeJSON(STORAGE_KEYS.patients, [...all, patient])
  return patient
}

export function updatePatient(id: string, updates: Partial<PatientInput>): Patient | undefined {
  const all = getAllPatients()
  const idx = all.findIndex((p) => p.id === id)
  if (idx === -1) return undefined
  const updated: Patient = {
    ...all[idx],
    ...updates,
    updatedAt: nowISO(),
  }
  const next = [...all]
  next[idx] = updated
  writeJSON(STORAGE_KEYS.patients, next)
  return updated
}

export function deletePatient(id: string): boolean {
  const all = getAllPatients()
  const next = all.filter((p) => p.id !== id)
  if (next.length === all.length) return false
  writeJSON(STORAGE_KEYS.patients, next)
  return true
}

export function searchPatientsByName(query: string): Patient[] {
  const q = query.trim().toLowerCase()
  if (!q) return getAllPatients()
  return getAllPatients().filter((p) => p.name.toLowerCase().includes(q))
}
