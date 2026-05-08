export type BodyRegionId =
  | 'cervical'    // 목/경추
  | 'shoulder'    // 어깨
  | 'elbow'       // 팔꿈치
  | 'wrist'       // 손목/손
  | 'thoracic'    // 흉추
  | 'lumbar'      // 요추
  | 'hip'         // 고관절/엉덩이
  | 'knee'        // 무릎
  | 'ankle'       // 발목
  | 'foot'        // 발/발가락

export type Side = 'left' | 'right' | 'both'

export type TreatmentMethod =
  | 'manual'      // 도수치료
  | 'electric'    // 전기
  | 'ultrasound'  // 초음파
  | 'thermal'     // 냉-온치료
  | 'task'        // 과제 훈련
  | 'exercise'    // 운동치료
  | 'other'       // 기타

export type ExerciseConcept =
  | 'strength'    // 근력증가
  | 'cardio'      // 심폐지구력
  | 'endurance'   // 근지구력
  | 'recovery'    // 회복운동
  | 'balance'     // 균형-기능

export type BodyPart = {
  region: BodyRegionId
  side?: Side
  muscles?: string[]
}

export type Exercise = {
  id: string
  name: string
  intensity?: string  // 메모: 세트·횟수·중량
}

export type Treatment = {
  id: string
  patientId: string
  date: string                 // ISO yyyy-mm-dd
  bodyParts: BodyPart[]        // 다중
  methods: TreatmentMethod[]   // 다중
  otherTreatmentMethod?: string // 기타 치료방법 (텍스트)
  exerciseConcept?: ExerciseConcept
  exercises?: Exercise[]
  comment?: string             // 당일 코멘트 (환자 반응·특이사항)
  createdAt: string
}

export type TreatmentInput = Omit<Treatment, 'id' | 'createdAt'>
