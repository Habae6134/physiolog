import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { ICF_SYSTEM_PROMPT } from '@/data/icf-system-prompt'
import { createClient } from '@/lib/supabase/server'
import { buildPatientContext } from '@/features/icf/domain/patient-context'
import { icfAnalysisResultSchema } from '@/features/icf/domain/schema'
import type { IcfAssessment } from '@/features/icf/domain/types'

// 시스템 프롬프트는 서버 코드에 고정 — 사용자 입력으로 절대 변경 불가
// API 키는 서버 환경변수(ANTHROPIC_API_KEY)에서만 읽어옴 — 클라이언트 BYOK 미지원
// 인증된(로그인) 사용자만 호출 가능 — 세션 체크 필수
// 환자 컨텍스트(기본정보 + 최근 평가 + 최근 치료)는 서버에서 fetch해서 system prompt에 자동 주입

interface ApiMessage {
  role: 'user' | 'assistant'
  content: string
}

const MODEL_ID = 'claude-sonnet-4-6'
const MAX_RETRY = 1

const DOMAIN_LABELS: Record<string, string> = {
  body: '신체기능', activity: '활동', participation: '참여', environment: '환경', personal: '개인',
}

function buildPreviousAssessmentContext(prev: IcfAssessment): string {
  const domainLines = (['body', 'activity', 'participation', 'environment', 'personal'] as const)
    .map((k) => {
      const items = prev.finalDomains[k]
      return items.length > 0 ? `- ${DOMAIN_LABELS[k]}: ${items.join('; ')}` : null
    })
    .filter(Boolean)
    .join('\n')

  const goalLines = [
    ...prev.shortTermGoals.map((g, i) => {
      const status = prev.shortTermGoalStatuses?.[i] === 'achieved' ? '✅ 달성됨' : '⏳ 진행중'
      return `  - [단기] ${g} (${status})`
    }),
    ...prev.longTermGoals.map((g, i) => {
      const status = prev.longTermGoalStatuses?.[i] === 'achieved' ? '✅ 달성됨' : '⏳ 진행중'
      return `  - [장기] ${g} (${status})`
    }),
  ].join('\n')

  return `## 재평가 모드 — 이전 ICF 평가 참조 (${prev.date})

아래는 이전 평가 결과입니다. 이를 반드시 참조하여:
1. 이전 평가 대비 개선·악화·변화된 항목을 파악하고 \`clinicalNote\`에 명시하세요.
2. 이전에 파악된 문제가 현재도 지속되는지 업데이트하세요.
3. 목표 달성 여부를 고려해 \`followUpQuestion\`에 새로운 방향을 제안하세요.
4. 이미 달성된 목표 관련 영역은 현재 기능 수준으로 업데이트하고, 미달성 영역은 원인 분석을 심화하세요.

### 이전 ICF 분류 결과
${domainLines || '(분류 항목 없음)'}

### 이전 임상 추론 요약
${prev.finalNote || '(없음)'}

${goalLines ? `### 치료 목표 달성 현황\n${goalLines}` : ''}`
}

/**
 * Claude 응답 텍스트에서 첫 번째 JSON 객체만 추출.
 * - balanced-brace 카운팅으로 첫 `{`부터 짝맞는 `}`까지만 잡음
 * - 문자열 안의 `{` `}` 무시 (이스케이프 처리 포함)
 * - 모델이 도입부 텍스트나 코드 펜스를 출력해도 첫 JSON 객체를 정확히 추출
 *
 * 참고: Claude Sonnet 4.6은 assistant message prefill을 지원하지 않으므로
 *      ("This model does not support assistant message prefill")
 *      JSON 시작 강제는 system prompt 지시로만 처리하고, 여기서 견고하게 추출.
 */
function extractFirstJsonObject(text: string): string | null {
  const start = text.indexOf('{')
  if (start === -1) return null

  let depth = 0
  let inString = false
  let escaped = false

  for (let i = start; i < text.length; i++) {
    const ch = text[i]
    if (escaped) { escaped = false; continue }
    if (ch === '\\') { escaped = true; continue }
    if (ch === '"') { inString = !inString; continue }
    if (inString) continue
    if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) return text.slice(start, i + 1)
    }
  }
  return null
}

/**
 * Claude를 호출하고 응답을 zod로 검증.
 * 형식 어긋나면 throw해서 호출부에서 재시도 트리거.
 */
async function analyzeOnce(
  client: Anthropic,
  systemPrompt: string,
  messages: ApiMessage[],
): Promise<{ result: ReturnType<typeof icfAnalysisResultSchema.parse>; rawText: string }> {
  const response = await client.messages.create({
    model: MODEL_ID,
    max_tokens: 2048,
    system: systemPrompt,
    messages,
  })

  const rawText = response.content[0].type === 'text' ? response.content[0].text : ''

  const json = extractFirstJsonObject(rawText)
  if (!json) {
    throw new Error('JSON 객체를 응답에서 찾을 수 없음')
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch (err) {
    throw new Error(`JSON 파싱 실패: ${(err as Error).message}`)
  }

  // zod 검증 — 필드 누락·타입 오류 감지
  const validated = icfAnalysisResultSchema.parse(parsed)

  return { result: validated, rawText }
}

export async function POST(req: NextRequest) {
  // 1. 세션 체크 — 로그인된 사용자만 허용
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  // 2. 서버 환경변수에서만 API 키 사용
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'AI 평가 기능이 비활성화되어 있습니다. 관리자에게 문의해주세요.' },
      { status: 503 },
    )
  }

  // 3. 입력 검증
  const body = await req.json() as {
    input: string
    history?: ApiMessage[]
    patientId?: string
    previousAssessment?: IcfAssessment
  }
  const { input, history = [], patientId, previousAssessment } = body
  if (!input?.trim()) {
    return NextResponse.json({ error: '입력값이 없습니다.' }, { status: 400 })
  }

  // 4. 환자 컨텍스트 + 재평가 컨텍스트 주입 (실패해도 분석 진행)
  let systemPrompt = ICF_SYSTEM_PROMPT
  try {
    const parts: string[] = [ICF_SYSTEM_PROMPT]
    if (patientId) {
      const ctx = await buildPatientContext(patientId)
      if (ctx) parts.push(ctx)
    }
    if (previousAssessment) {
      parts.push(buildPreviousAssessmentContext(previousAssessment))
    }
    systemPrompt = parts.join('\n\n')
  } catch (err) {
    console.error('Failed to build context, falling back to base prompt:', err)
  }

  const client = new Anthropic({ apiKey })
  const messages: ApiMessage[] = [...history, { role: 'user', content: input }]

  // 5. 분석 호출 — 응답 형식 오류 시 최대 MAX_RETRY회 재시도
  let lastError: Error | null = null
  for (let attempt = 0; attempt <= MAX_RETRY; attempt++) {
    try {
      const { result, rawText } = await analyzeOnce(client, systemPrompt, messages)
      return NextResponse.json({ result, assistantMessage: rawText })
    } catch (err) {
      lastError = err as Error

      // Anthropic API 자체 에러는 재시도해도 같은 결과 — 즉시 반환
      if (err instanceof Anthropic.APIError) {
        console.error(`[ICF] Anthropic APIError ${err.status}: ${err.message}`)
        const msg = err.status === 400 && err.message.includes('credit')
          ? 'AI 사용량 한도에 도달했습니다. 관리자에게 문의해주세요.'
          : err.status === 401
          ? 'AI 평가 설정에 문제가 있습니다. 관리자에게 문의해주세요.'
          : `AI 분석 오류 (${err.status}) — ${err.message}`
        return NextResponse.json({ error: msg, detail: err.message }, { status: err.status ?? 500 })
      }

      // JSON 파싱·zod 검증 실패는 재시도 가치 있음 (다음 시도에 정상 출력 가능성 ↑)
      console.warn(`ICF analyze attempt ${attempt + 1} failed: ${lastError.message}`)
    }
  }

  // 6. 최대 재시도 후에도 실패 — 사용자에게 명확한 메시지
  return NextResponse.json(
    {
      error: 'AI 응답 형식 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      detail: lastError?.message,
    },
    { status: 500 },
  )
}
