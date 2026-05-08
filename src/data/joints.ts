/**
 * ROM 측정 — 주요 관절만 (PRD 결정사항).
 * 어깨/팔꿈치/손목/고관절/무릎/발목/허리/목.
 * 정상 범위는 평균치. 환자 개별 판단은 치료사 몫.
 */

export type Movement = {
  id: string             // 관절_움직임 (예: shoulder_flexion)
  label: string
  normal?: string        // 참고 정상 범위 (도, deg)
}

export type Joint = {
  id: string
  label: string
  movements: Movement[]
}

export const JOINTS: Joint[] = [
  {
    id: 'cervical',
    label: '목/경추',
    movements: [
      { id: 'cervical_flexion', label: '굴곡 (Flexion)', normal: '0~50°' },
      { id: 'cervical_extension', label: '신전 (Extension)', normal: '0~60°' },
      { id: 'cervical_lateral_flexion', label: '측굴 (Lateral flexion)', normal: '0~45°' },
      { id: 'cervical_rotation', label: '회전 (Rotation)', normal: '0~80°' },
    ],
  },
  {
    id: 'shoulder',
    label: '어깨',
    movements: [
      { id: 'shoulder_flexion', label: '굴곡 (Flexion)', normal: '0~180°' },
      { id: 'shoulder_extension', label: '신전 (Extension)', normal: '0~60°' },
      { id: 'shoulder_abduction', label: '외전 (Abduction)', normal: '0~180°' },
      { id: 'shoulder_adduction', label: '내전 (Adduction)', normal: '0~50°' },
      { id: 'shoulder_ir', label: '내회전 (Internal rotation)', normal: '0~70°' },
      { id: 'shoulder_er', label: '외회전 (External rotation)', normal: '0~90°' },
    ],
  },
  {
    id: 'elbow',
    label: '팔꿈치',
    movements: [
      { id: 'elbow_flexion', label: '굴곡 (Flexion)', normal: '0~150°' },
      { id: 'elbow_extension', label: '신전 (Extension)', normal: '0°' },
      { id: 'forearm_pronation', label: '회내 (Pronation)', normal: '0~80°' },
      { id: 'forearm_supination', label: '회외 (Supination)', normal: '0~80°' },
    ],
  },
  {
    id: 'wrist',
    label: '손목',
    movements: [
      { id: 'wrist_flexion', label: '굴곡 (Flexion)', normal: '0~80°' },
      { id: 'wrist_extension', label: '신전 (Extension)', normal: '0~70°' },
      { id: 'wrist_radial', label: '요측 편위 (Radial deviation)', normal: '0~20°' },
      { id: 'wrist_ulnar', label: '척측 편위 (Ulnar deviation)', normal: '0~30°' },
    ],
  },
  {
    id: 'lumbar',
    label: '요추/허리',
    movements: [
      { id: 'lumbar_flexion', label: '굴곡 (Flexion)', normal: '0~80°' },
      { id: 'lumbar_extension', label: '신전 (Extension)', normal: '0~25°' },
      { id: 'lumbar_lateral_flexion', label: '측굴 (Lateral flexion)', normal: '0~25°' },
      { id: 'lumbar_rotation', label: '회전 (Rotation)', normal: '0~30°' },
    ],
  },
  {
    id: 'hip',
    label: '고관절',
    movements: [
      { id: 'hip_flexion', label: '굴곡 (Flexion)', normal: '0~120°' },
      { id: 'hip_extension', label: '신전 (Extension)', normal: '0~30°' },
      { id: 'hip_abduction', label: '외전 (Abduction)', normal: '0~45°' },
      { id: 'hip_adduction', label: '내전 (Adduction)', normal: '0~30°' },
      { id: 'hip_ir', label: '내회전 (Internal rotation)', normal: '0~45°' },
      { id: 'hip_er', label: '외회전 (External rotation)', normal: '0~45°' },
    ],
  },
  {
    id: 'knee',
    label: '무릎',
    movements: [
      { id: 'knee_flexion', label: '굴곡 (Flexion)', normal: '0~135°' },
      { id: 'knee_extension', label: '신전 (Extension)', normal: '0°' },
    ],
  },
  {
    id: 'ankle',
    label: '발목',
    movements: [
      { id: 'ankle_dorsiflexion', label: '배측굴곡 (Dorsiflexion)', normal: '0~20°' },
      { id: 'ankle_plantarflexion', label: '저측굴곡 (Plantarflexion)', normal: '0~50°' },
      { id: 'ankle_inversion', label: '내번 (Inversion)', normal: '0~35°' },
      { id: 'ankle_eversion', label: '외번 (Eversion)', normal: '0~15°' },
    ],
  },
]

export function getMovementById(id: string): { joint: Joint; movement: Movement } | undefined {
  for (const joint of JOINTS) {
    const movement = joint.movements.find((m) => m.id === id)
    if (movement) return { joint, movement }
  }
  return undefined
}
