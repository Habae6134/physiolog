import type {
  ExerciseConcept,
  TreatmentMethod,
} from '@/features/treatments/domain/types'

export const TREATMENT_METHOD_OPTIONS: { value: TreatmentMethod; label: string }[] = [
  { value: 'manual', label: '도수치료' },
  { value: 'electric', label: '전기치료' },
  { value: 'ultrasound', label: '초음파' },
  { value: 'thermal', label: '냉-온치료' },
  { value: 'task', label: '과제 훈련' },
  { value: 'exercise', label: '운동치료' },
  { value: 'other', label: '기타' },
]

export const TREATMENT_METHOD_LABEL: Record<TreatmentMethod, string> = Object.fromEntries(
  TREATMENT_METHOD_OPTIONS.map((o) => [o.value, o.label]),
) as Record<TreatmentMethod, string>

export const EXERCISE_CONCEPT_OPTIONS: { value: ExerciseConcept; label: string }[] = [
  { value: 'strength', label: '근력증가' },
  { value: 'cardio', label: '심폐지구력' },
  { value: 'endurance', label: '근지구력' },
  { value: 'recovery', label: '회복운동' },
  { value: 'balance', label: '균형-기능' },
]

export const EXERCISE_CONCEPT_LABEL: Record<ExerciseConcept, string> = Object.fromEntries(
  EXERCISE_CONCEPT_OPTIONS.map((o) => [o.value, o.label]),
) as Record<ExerciseConcept, string>
