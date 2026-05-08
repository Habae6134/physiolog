import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { ICF_SYSTEM_PROMPT } from '@/data/icf-system-prompt'

// 시스템 프롬프트는 서버 코드에 고정 — 사용자 입력으로 절대 변경 불가

interface ApiMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization')
  const userKey = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  const apiKey = userKey ?? process.env.ANTHROPIC_API_KEY

  if (!apiKey || apiKey === 'your_api_key_here') {
    return NextResponse.json(
      { error: 'API 키가 없습니다. 설정(⚙️)에서 Anthropic API 키를 입력해주세요.' },
      { status: 401 },
    )
  }

  const body = await req.json() as { input: string; history?: ApiMessage[] }
  const { input, history = [] } = body

  if (!input?.trim()) {
    return NextResponse.json({ error: '입력값이 없습니다.' }, { status: 400 })
  }

  const client = new Anthropic({ apiKey })
  const messages: ApiMessage[] = [...history, { role: 'user', content: input }]

  try {
    const response = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 2048,
      system: ICF_SYSTEM_PROMPT,
      messages,
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: '분석 결과를 파싱할 수 없습니다.' }, { status: 500 })
    }

    const result = JSON.parse(jsonMatch[0])
    return NextResponse.json({ result, assistantMessage: text })

  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      const msg = err.status === 400 && err.message.includes('credit')
        ? '크레딧이 부족합니다. console.anthropic.com → Plans & Billing에서 충전해주세요.'
        : err.status === 401
        ? 'API 키가 유효하지 않습니다. 설정에서 키를 다시 확인해주세요.'
        : `API 오류 (${err.status}): ${err.message}`
      return NextResponse.json({ error: msg }, { status: err.status ?? 500 })
    }
    return NextResponse.json({ error: '알 수 없는 오류가 발생했습니다.' }, { status: 500 })
  }
}
