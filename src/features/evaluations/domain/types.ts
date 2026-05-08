import type { Side } from '@/features/treatments/domain/types'

export type ROMRecord = {
  jointId: string              // joints.ts의 id 참조
  side?: Side
  active?: number              // 능동 ROM (도)
  passive?: number             // 수동 ROM (도)
}

export type MMTGrade = 0 | 1 | 2 | 3 | 4 | 5

export type MMTRecord = {
  jointId: string               // joints.ts의 id 참조
  side?: Side
  grade: MMTGrade
}

export type BodyMeasurementType = 'circumference' | 'length' | 'edema'

export type BodyMeasurement = {
  type: BodyMeasurementType
  location: string             // 부위 (예: "우측 대퇴 중앙")
  value: number
  unit: 'cm' | 'mm'
}

export type CustomEval = {
  name: string                 // 사용자가 정의한 평가 항목명 (예: "FMS 점수")
  value: string                // 자유 입력
}

export type Evaluation = {
  id: string
  patientId: string
  date: string                 // ISO yyyy-mm-dd
  vas?: number                 // 0~10
  rom?: ROMRecord[]
  mmt?: MMTRecord[]
  bodyMeasurement?: BodyMeasurement[]
  custom?: CustomEval[]
  createdAt: string
}

export type EvaluationInput = Omit<Evaluation, 'id' | 'createdAt'>

// 그래프 표시 항목 설정 (환자별 저장)
export type GraphMetric =
  | { kind: 'vas' }
  | { kind: 'rom'; jointId: string; side?: Side; mode: 'active' | 'passive' }
  | { kind: 'mmt'; jointId: string; side?: Side }
  | { kind: 'measurement'; type: BodyMeasurementType; location: string }
  | { kind: 'custom'; name: string }

export type GraphSettings = {
  patientId: string
  metrics: GraphMetric[]
}
