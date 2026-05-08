import type { Gender, InsuranceType, PatientStatus } from '@/features/patients/domain/types'

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male', label: '남성' },
  { value: 'female', label: '여성' },
]

export const GENDER_LABEL: Record<Gender, string> = Object.fromEntries(
  GENDER_OPTIONS.map((o) => [o.value, o.label]),
) as Record<Gender, string>

export const INSURANCE_OPTIONS: { value: InsuranceType; label: string }[] = [
  { value: 'health', label: '건강보험' },
  { value: 'industrial', label: '산재' },
  { value: 'auto', label: '자동차' },
  { value: 'private', label: '실비' },
  { value: 'medical', label: '의료급여(1,2종)' },
  { value: 'self', label: '자비' },
]

export const INSURANCE_LABEL: Record<InsuranceType, string> = Object.fromEntries(
  INSURANCE_OPTIONS.map((o) => [o.value, o.label]),
) as Record<InsuranceType, string>

export const PATIENT_STATUS_OPTIONS: { value: PatientStatus; label: string }[] = [
  { value: 'new', label: '신규' },
  { value: 'readmit', label: '재입원' },
  { value: 'hold', label: '홀드' },
  { value: 'discharged', label: '종결' },
]

export const PATIENT_STATUS_LABEL: Record<PatientStatus, string> = Object.fromEntries(
  PATIENT_STATUS_OPTIONS.map((o) => [o.value, o.label]),
) as Record<PatientStatus, string>

export const MEDICAL_HISTORY_OPTIONS = [
  '심혈관질환 (고혈압, 협심증, 심부전 등)',
  '대사성 질환 (당뇨병, 고지혈증, 통풍 등)',
  '호흡기 질환 (천식, 만성폐쇄성폐질환 등)',
  '신장/간 질환 (신부전, 간경화 등)',
  '자가면역 질환 (류마티스 등)',
  '암',
  '중추신경계 질환 (뇌졸중, 치매, 파킨슨 등)',
  '기타',
]
