# physiolog — Product Requirements Document (PRD)

> **⚠️ 모든 코드 작성 전 이 문서를 반드시 먼저 읽을 것.**
> 친구의 원본 PRD v1.6은 22주 풀버전 — 우리는 MVP 스코프만 유지.

---

## 🎯 프로젝트 개요

| 항목 | 내용 |
|---|---|
| **앱 이름** | physiolog |
| **대상 사용자** | 물리치료사, 트레이너 |
| **핵심 목적** | 환자 1인당 차팅 시간 10~20분 → **5분 이내** 단축 |
| **목표 사용자 수** | 친구(물리치료사) 1명 실사용 → 피드백 기반 확장 |
| **개발 기간** | 1~2개월 |
| **프론트엔드** | Next.js 16 + React 19 + TypeScript |
| **스타일링** | Tailwind CSS 4 + shadcn/ui (Nova preset) |
| **상태 관리** | React 훅 + localStorage |
| **백엔드/DB** | 없음 (localStorage). Phase 2에서 Supabase 검토 |
| **배포 목표** | Vercel + PWA (폰 홈에 추가) |

---

## 📋 핵심 기능 (MVP)

### 1. 환자 관리
- **등록**: 11개 필드 (이름·생년월일·성별·연락처·주소·진단명·수술이력·보험·특이사항·치료시작일·담당치료사)
- **리스트**: 카드 형태 (이름 + 진단명 + 마지막 치료일)
- **검색**: 이름 검색
- **편집**: 우상단 ✏️ 버튼
- **상태**: 활성 / 종결 / 보류

### 2. 치료기록
**입력 흐름**:
1. 치료부위 선택 (다중, 위→아래 순서)
   - 목 → 상지 → 척추/엉덩 → 무릎 → 발목 → 발가락
   - 부위별 근육 검색·선택 (Combobox)
2. 치료방법 선택 (다중 체크박스)
   - 도수치료 / 전기 / 초음파 / 냉-온치료 / 과제 훈련 / 운동치료
   - **운동치료 선택 시**:
     - 컨셉: 근력증가 / 심폐지구력 / 근지구력 / 리커버리 / 균형-기능
     - 운동 ➕로 여러 개 추가 가능
     - 세트·횟수·중량은 메모로 한 번에
     - 자주 쓰는 운동 즐겨찾기
3. 당일 코멘트 (환자 반응·특이사항)

**리스트 표시**: 카드 형태 (날짜·부위·방법 / 코멘트 미리보기)
**핵심 기능**: 이전 기록 1클릭 복사

### 3. 평가기록
**평가 항목 (MVP)**:
- VAS (통증 0~10) — 필수, 기본 그래프 표시
- ROM (관절 각도) — 주요 관절만 (어깨/팔꿈치/손목/고관절/무릎/발목/허리/목)
- MMT (근력 0~5)
- 신체 계측 (둘레·길이·부종)
- "평가 항목 추가" 버튼 (FMS 등 확장 여지)

**입력 방식**: 측정 항목 토글 (그날 측정한 것만 ON)

**그래프**:
- 상단에 추이 그래프 (recharts)
- 치료사가 표시 항목 직접 선택
- 기본은 VAS 자동 표시
- 항목 설정은 환자별 저장

---

## 🚫 MVP 스코프 외 (안 만드는 것)

| 기능 | 미루는 이유 |
|------|-----------|
| 로그인/계정 | 담당 치료사는 텍스트 필드. 멀티유저는 Phase 2 |
| 인체 그림 SVG | 구현 복잡 — 드롭다운으로 충분히 빠름 |
| AI 요약 | Claude API. MVP 후 추가 |
| 음성 입력 (STT) | Web Speech API. MVP 후 추가 |
| 클라우드 동기화 | Supabase. 친구 실사용 → 다기기 필요할 때 |
| PDF/카카오톡 공유 | 복잡도 ↑. MVP 후 |
| 팀 공유·권한 관리 | 멀티유저 도입 후 |
| 처방전·진단서 생성 | 의료법상 의사 면허 필요 (영구 제외) |
| 다국어 | 한국어만 |

---

## 📱 화면 구성

### 화면 1: 환자 리스트 `/`
- 상단: 검색창
- 본문: 환자 카드 리스트 (이름·진단명·마지막 치료일)
- 우하단: FAB ➕ → `/patients/new`

### 화면 2: 환자 등록/편집 `/patients/new`
- 11개 필드 폼
- react-hook-form + zod 검증
- 저장 → sonner 토스트 → `/patients/[id]` 이동

### 화면 3: 환자 정보 `/patients/[id]`
- 상단: 환자명 + ✏️ 편집 버튼
- 탭 3개: [기본정보] [치료기록] [평가기록]

#### 탭 A: 기본정보
- 11개 필드 보기

#### 탭 B: 치료기록
- 우상단 ➕ 작성 / 📋 이전 기록 복사
- 날짜별 카드 리스트
- 카드 클릭 → 상세 보기

#### 탭 C: 평가기록
- 상단: 추이 그래프 (그래프 설정 ⚙️ 버튼)
- 하단: 날짜별 평가 카드 리스트
- 우상단 ➕ 평가 입력

### 화면 4: 치료기록 작성 `/patients/[id]/treatments/new`
- 단계별 폼 (모바일은 vaul 바텀시트 추천)
- 1) 부위 → 2) 방법 → 3) 코멘트 → 저장

### 화면 5: 평가 입력 `/patients/[id]/evaluations/new`
- 토글로 측정 항목 ON/OFF
- 항목별 입력 칸
- 저장 → 그래프 자동 갱신

---

## 💾 데이터 모델 (TypeScript)

### Patient
```ts
type Patient = {
  id: string                 // uuid
  name: string
  birthDate: string          // ISO
  gender: 'male' | 'female' | 'other'
  phone: string
  address: string
  diagnosis: string
  surgeryHistory?: string
  insurance: 'health' | 'industrial' | 'auto' | 'private' | 'self'
  notes?: string             // 특이사항/금기사항
  treatmentStartDate: string // ISO
  therapist: string          // 담당 치료사 이름 (텍스트)
  status: 'active' | 'discharged' | 'on-hold'
  createdAt: string
  updatedAt: string
}
```

### Treatment
```ts
type Treatment = {
  id: string
  patientId: string
  date: string               // ISO
  bodyParts: BodyPart[]      // 다중
  methods: TreatmentMethod[] // 다중 (도수/전기/초음파/냉온/과제/운동)
  exerciseConcept?: ExerciseConcept  // 운동치료 선택 시
  exercises?: Exercise[]     // 운동치료 선택 시
  comment?: string
  createdAt: string
}

type BodyPart = {
  region: 'neck' | 'upperLimb' | 'spineHip' | 'knee' | 'ankle' | 'toe' | ...
  muscles?: string[]         // 근육명
}

type Exercise = {
  name: string
  intensity?: string         // 메모 (세트·횟수·중량)
}
```

### Evaluation
```ts
type Evaluation = {
  id: string
  patientId: string
  date: string
  vas?: number               // 0~10
  rom?: ROMRecord[]
  mmt?: MMTRecord[]
  bodyMeasurement?: BodyMeasurement[]
  custom?: CustomEval[]      // FMS 등 확장
  createdAt: string
}
```

---

## ✅ 비기능 요구사항

| 항목 | 기준 |
|------|------|
| 환자 1인 기록 시간 | **5분 이내** (이전 기록 복사 활용 시) |
| 환자 리스트 로드 | 1초 이내 (50명 기준) |
| 폼 검증 | zod 사용, 필수 필드 누락 시 저장 불가 |
| 모바일 UX | 한손 조작, 바텀시트 입력 |
| 오프라인 | PWA + Service Worker (병원 와이파이 불안정 대비) |
| 데이터 보존 | localStorage (브라우저 삭제 주의 안내) |

---

## 🚀 작업 순서

1. ✅ 프로젝트 셋업 (Next.js + shadcn/ui + 패키지)
2. 타입 정의 (`features/*/domain/types.ts`)
3. localStorage 래퍼 (`lib/storage/`)
4. 정적 데이터 (`data/muscles.ts`, `joints.ts`, `exercises.ts`)
5. 환자 리스트 + 등록 폼
6. 환자 정보 페이지 + 탭
7. 치료기록 (작성·리스트·복사)
8. 평가기록 (입력·리스트·그래프)
9. PWA 설정
10. Vercel 배포 + 폰 테스트

---

## 📚 참고
- 친구 원본 PRD: `docs/PRD-original-v1.6.md` (22주 풀버전)
- rom-detector 프로젝트의 ROM 측정 코드 재활용 가능
