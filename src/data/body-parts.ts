import type { BodyRegionId } from '@/features/treatments/domain/types'

export type BodyRegionDef = {
  id: BodyRegionId
  label: string
  muscles: string[]
}

/**
 * 신체 부위 — 위에서 아래 순서로 정렬 (PRD 결정사항).
 * 목 → 상지(어깨/팔꿈치/손목) → 척추(흉추/요추) → 고관절 → 무릎 → 발목 → 발/발가락
 *
 * 근육 리스트는 학과에서 자주 쓰는 한글 명칭 위주.
 * 필요 시 사용자가 추가 가능 (Combobox에서 직접 입력 허용).
 */
export const BODY_REGIONS: BodyRegionDef[] = [
  {
    id: 'cervical',
    label: '목/경추',
    muscles: [
      '흉쇄유돌근 (SCM)',
      '사각근 (Scalene)',
      '견갑거근 (Levator scapulae)',
      '승모근 상부 (Upper trapezius)',
      '척추기립근 (경부)',
      '두판상근 (Splenius capitis)',
    ],
  },
  {
    id: 'shoulder',
    label: '어깨',
    muscles: [
      '삼각근 전부 (Anterior deltoid)',
      '삼각근 중부 (Middle deltoid)',
      '삼각근 후부 (Posterior deltoid)',
      '극상근 (Supraspinatus)',
      '극하근 (Infraspinatus)',
      '소원근 (Teres minor)',
      '견갑하근 (Subscapularis)',
      '광배근 (Latissimus dorsi)',
      '대원근 (Teres major)',
      '능형근 (Rhomboids)',
      '승모근 중·하부 (Mid·Lower trapezius)',
      '대흉근 (Pectoralis major)',
      '소흉근 (Pectoralis minor)',
      '전거근 (Serratus anterior)',
    ],
  },
  {
    id: 'elbow',
    label: '팔꿈치',
    muscles: [
      '상완이두근 (Biceps brachii)',
      '상완삼두근 (Triceps brachii)',
      '상완근 (Brachialis)',
      '상완요골근 (Brachioradialis)',
      '회내근 (Pronator teres)',
      '회외근 (Supinator)',
    ],
  },
  {
    id: 'wrist',
    label: '손목/손',
    muscles: [
      '손목 굴곡근군 (Wrist flexors)',
      '손목 신전근군 (Wrist extensors)',
      '요측 수근굴근 (FCR)',
      '척측 수근굴근 (FCU)',
      '요측 수근신근 (ECR)',
      '척측 수근신근 (ECU)',
      '심수지굴근 (FDP)',
      '천수지굴근 (FDS)',
    ],
  },
  {
    id: 'thoracic',
    label: '흉추',
    muscles: [
      '척추기립근 (흉부)',
      '광배근 (Latissimus dorsi)',
      '능형근 (Rhomboids)',
      '다열근 (Multifidus)',
    ],
  },
  {
    id: 'lumbar',
    label: '요추/허리',
    muscles: [
      '척추기립근 (요부)',
      '요방형근 (Quadratus lumborum)',
      '다열근 (Multifidus)',
      '복직근 (Rectus abdominis)',
      '외복사근 (External oblique)',
      '내복사근 (Internal oblique)',
      '복횡근 (Transverse abdominis)',
    ],
  },
  {
    id: 'hip',
    label: '고관절/엉덩이',
    muscles: [
      '대둔근 (Gluteus maximus)',
      '중둔근 (Gluteus medius)',
      '소둔근 (Gluteus minimus)',
      '장요근 (Iliopsoas)',
      '대퇴근막장근 (TFL)',
      '이상근 (Piriformis)',
      '내전근군 (Adductors)',
      '봉공근 (Sartorius)',
    ],
  },
  {
    id: 'knee',
    label: '무릎',
    muscles: [
      '대퇴사두근 (Quadriceps)',
      '햄스트링 (Hamstrings)',
      '비복근 (Gastrocnemius)',
      '슬와근 (Popliteus)',
      '봉공근 (Sartorius)',
      '박근 (Gracilis)',
      '내측광근 (VMO)',
    ],
  },
  {
    id: 'ankle',
    label: '발목',
    muscles: [
      '비복근 (Gastrocnemius)',
      '가자미근 (Soleus)',
      '전경골근 (Tibialis anterior)',
      '후경골근 (Tibialis posterior)',
      '장비골근 (Peroneus longus)',
      '단비골근 (Peroneus brevis)',
      '장무지굴근 (FHL)',
      '장지굴근 (FDL)',
    ],
  },
  {
    id: 'foot',
    label: '발/발가락',
    muscles: [
      '발바닥 내재근 (Intrinsic foot muscles)',
      '단무지굴근 (FHB)',
      '단지굴근 (FDB)',
      '충양근 (Lumbricals)',
      '족저근막 (Plantar fascia)',
    ],
  },
]

export const BODY_REGION_LABEL: Record<BodyRegionId, string> = Object.fromEntries(
  BODY_REGIONS.map((r) => [r.id, r.label]),
) as Record<BodyRegionId, string>

export function getMusclesForRegion(id: BodyRegionId): string[] {
  return BODY_REGIONS.find((r) => r.id === id)?.muscles ?? []
}

export const SIDE_LABEL = {
  left: '좌측',
  right: '우측',
  both: '양측',
} as const
