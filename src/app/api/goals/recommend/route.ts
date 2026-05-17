import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildPatientContext } from '@/features/icf/domain/patient-context'

const MODEL_ID = 'claude-sonnet-4-6'

const SYSTEM_PROMPT = `당신은 물리치료사를 위한 임상 목표 설정 보조 AI입니다.
환자의 ICF 기반 평가 컨텍스트를 바탕으로 단기 목표(4주)와 장기 목표(8주)를 추천합니다.

규칙:
- 단기 목표: 4주 내 달성 가능한 구체적·측정 가능한 목표 정확히 3개
- 장기 목표: 8주 내 달성 가능한 최종 기능 목표 정확히 1개
- SMART 원칙 적용 (구체적, 측정 가능, 달성 가능, 관련성, 시간 제한)
- 물리치료 임상 용어 사용, 한국어로 작성
- 각 목표는 1~2문장으로 간결하게

반드시 아래 JSON 형식만 반환하세요. 다른 텍스트 없이:
{
  "shortTermGoals": ["목표1", "목표2", "목표3"],
  "longTermGoals": ["목표1"]
}`

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'AI 기능이 비활성화되어 있습니다.' },
      { status: 503 },
    )
  }

  const body = await req.json() as { patientId: string }
  const { patientId } = body
  if (!patientId) {
    return NextResponse.json({ error: 'patientId가 필요합니다.' }, { status: 400 })
  }

  let systemPrompt = SYSTEM_PROMPT
  try {
    const ctx = await buildPatientContext(patientId)
    if (ctx) systemPrompt = `${SYSTEM_PROMPT}\n\n${ctx}`
  } catch (err) {
    console.error('Failed to build patient context:', err)
  }

  const client = new Anthropic({ apiKey })

  try {
    const response = await client.messages.create({
      model: MODEL_ID,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: '이 환자의 치료 목표를 추천해주세요.' }],
    })

    const rawText = response.content[0].type === 'text' ? response.content[0].text : ''

    // JSON 추출
    const start = rawText.indexOf('{')
    const end = rawText.lastIndexOf('}')
    if (start === -1 || end === -1) throw new Error('JSON not found')

    const parsed = JSON.parse(rawText.slice(start, end + 1)) as {
      shortTermGoals: string[]
      longTermGoals: string[]
    }

    if (!Array.isArray(parsed.shortTermGoals) || !Array.isArray(parsed.longTermGoals)) {
      throw new Error('Invalid response shape')
    }

    return NextResponse.json({
      shortTermGoals: parsed.shortTermGoals.slice(0, 3),
      longTermGoals: parsed.longTermGoals.slice(0, 1),
    })
  } catch (err) {
    console.error('Goals recommend error:', err)
    if (err instanceof Anthropic.APIError) {
      return NextResponse.json({ error: `AI 오류: ${err.message}` }, { status: err.status ?? 500 })
    }
    return NextResponse.json({ error: 'AI 추천 생성에 실패했습니다.' }, { status: 500 })
  }
}
