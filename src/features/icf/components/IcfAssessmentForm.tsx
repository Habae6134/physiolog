'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Sparkles, MessageSquare, Save, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { IcfDomainCard } from './IcfDomainCard'
import { createIcfAssessment } from '@/lib/supabase/icf'
import { mergeDomains, DOMAIN_KEYS, type IcfTurn, type IcfAnalysisResult } from '@/features/icf/domain/types'

interface ApiMessage {
  role: 'user' | 'assistant'
  content: string
}

interface Props {
  patientId: string
}

const TAG_CATEGORIES = [
  {
    label: '통증',
    tags: ['날카로운 통증', '둔한 통증', '방사통', '야간통', '저림', '묵직함'],
    color: 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100',
  },
  {
    label: '가동범위/기능',
    tags: ['가동범위 제한', '근력 약화', '강직', '보행 장애', '균형 저하', '유연성 부족'],
    color: 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100',
  },
  {
    label: '환경/직업',
    tags: ['장시간 좌식', '무거운 물건 들기', '반복 작업', '계단 이용 많음', '스트레스', '열악한 의자'],
    color: 'bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100',
  },
  {
    label: '심리/정서',
    tags: ['우울감', '불안', '무력감', '회복 의지 높음', '수면 장애', '사회적 고립'],
    color: 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100',
  },
]

type Status = 'idle' | 'loading' | 'result'

export function IcfAssessmentForm({ patientId }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState<Status>('idle')
  const [input, setInput] = useState('')
  const [followUp, setFollowUp] = useState('')
  const [turns, setTurns] = useState<IcfTurn[]>([])
  const [history, setHistory] = useState<ApiMessage[]>([])
  const [currentResult, setCurrentResult] = useState<IcfAnalysisResult | null>(null)

  const latestDomains = turns.length > 0 ? mergeDomains(turns) : null

  async function analyze(userInput: string) {
    if (!userInput.trim()) return
    setStatus('loading')

    const newHistory: ApiMessage[] = [...history, { role: 'user', content: userInput }]

    const res = await fetch('/api/icf/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: userInput, history }),
    })

    let data: { result?: IcfAnalysisResult; error?: string; assistantMessage?: string }
    try {
      data = await res.json()
    } catch {
      toast.error('서버 응답 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
      setStatus(turns.length > 0 ? 'result' : 'idle')
      return
    }

    if (!res.ok || data.error) {
      toast.error(data.error ?? '분석 중 오류가 발생했습니다.')
      setStatus(turns.length > 0 ? 'result' : 'idle')
      return
    }

    const result = data.result!
    const newTurn: IcfTurn = { input: userInput, result }

    setTurns((prev) => [...prev, newTurn])
    setHistory([...newHistory, { role: 'assistant', content: data.assistantMessage! }])
    setCurrentResult(result)
    setStatus('result')
    setInput('')
    setFollowUp('')
  }

  function handleInitialSubmit() {
    analyze(input)
  }

  function handleFollowUpSubmit() {
    analyze(`[추가 정보]\n${followUp}`)
  }

  async function handleSave() {
    if (turns.length === 0) return
    const merged = mergeDomains(turns)
    const lastNote = currentResult?.clinicalNote ?? ''
    
    const result = await createIcfAssessment(patientId, {
      date: new Date().toISOString().slice(0, 10),
      turns,
      finalDomains: merged,
      finalNote: lastNote,
    })

    if (result.success) {
      toast.success('평가가 저장되었습니다.')
      router.push(`/patients/${patientId}?tab=icf`)
    } else {
      toast.error('평가 저장 실패', { description: result.error })
    }
  }

  function handleReset() {
    setStatus('idle')
    setInput('')
    setFollowUp('')
    setTurns([])
    setHistory([])
    setCurrentResult(null)
  }

  const addTag = (tag: string) => {
    if (input.includes(tag)) return
    setInput(prev => prev ? `${prev}, ${tag}` : tag)
  }

  return (
    <div className="flex flex-col gap-5">
      {/* 초기 입력 */}
      {status === 'idle' && (
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-3"
        >
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-semibold">초기 상담 내용 입력</h2>
            <p className="text-xs text-muted-foreground">
              환자와의 초기 상담, 임상 관찰, 수행 관찰 내용을 자유롭게 적어주세요. AI가 5개 영역으로 분류합니다.
            </p>
          </div>
          <Textarea
            placeholder={`예시:\n40대 남성, 공장 라인 근무. 3주 전 허리를 삐끗한 후 요통 발생. VAS 7/10. 허리 굽히기 어려워 신발 신기, 물건 줍기 어려움. 빨리 직장에 복귀하고 싶어함. 가족은 안정을 권유 중.`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={6}
            className="resize-none text-sm"
          />
          <Button onClick={handleInitialSubmit} disabled={!input.trim()} className="w-full gap-2 shadow-lg shadow-primary/20">
            <Sparkles className="h-4 w-4" />
            분석 시작
          </Button>

          {/* 태그 클라우드 */}
          <div className="mt-4 space-y-4 rounded-xl border border-dashed p-4 bg-muted/20">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                키워드 태깅 (빠른 입력)
              </h3>
              <span className="text-[10px] font-normal text-muted-foreground bg-muted px-1.5 py-0.5 rounded leading-none">선택사항</span>
            </div>
            <div className="space-y-3">
              {TAG_CATEGORIES.map((cat) => (
                <div key={cat.label} className="space-y-1.5">
                  <p className="text-[10px] font-medium text-muted-foreground/70 ml-1">{cat.label}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.tags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => addTag(tag)}
                        className={`px-2.5 py-1 rounded-full text-xs border transition-all active:scale-95 ${cat.color}`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* 로딩 */}
      {status === 'loading' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center gap-3 py-16"
        >
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">프레임워크로 분석 중…</p>
          <p className="text-xs text-muted-foreground/60">5개 영역 분류 및 임상 추론 생성</p>
        </motion.div>
      )}

      {/* 결과 */}
      <AnimatePresence>
        {status === 'result' && latestDomains && currentResult && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-4"
          >
            {/* 도메인 카드 그리드 */}
            <section className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold">분류 결과</h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {DOMAIN_KEYS.map((key, i) => (
                  <IcfDomainCard
                    key={key}
                    domainKey={key}
                    items={latestDomains[key]}
                    index={i}
                  />
                ))}
              </div>
            </section>

            {/* 임상 추론 메모 */}
            {currentResult.clinicalNote && (
              <motion.section
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="rounded-lg border bg-muted/40 p-3"
              >
                <p className="mb-1 text-xs font-semibold text-muted-foreground">임상 추론 요약</p>
                <p className="text-sm leading-relaxed">{currentResult.clinicalNote}</p>
              </motion.section>
            )}

            {/* AI 추가 질문 */}
            {currentResult.followUpQuestion && (
              <motion.section
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3"
              >
                <div className="flex items-start gap-2">
                  <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-semibold text-primary">AI 추가 질문</p>
                    <p className="text-sm leading-relaxed">{currentResult.followUpQuestion}</p>
                  </div>
                </div>
                <Textarea
                  placeholder="답변을 입력하면 프로파일이 더 정확해집니다."
                  value={followUp}
                  onChange={(e) => setFollowUp(e.target.value)}
                  rows={3}
                  className="resize-none text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFollowUpSubmit}
                  disabled={!followUp.trim()}
                  className="w-full gap-2"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  답변 추가 분석
                </Button>
              </motion.section>
            )}

            {/* 액션 버튼 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex gap-2"
            >
              <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5">
                <RefreshCw className="h-3.5 w-3.5" />
                다시 시작
              </Button>
              <Button onClick={handleSave} className="flex-1 gap-2">
                <Save className="h-4 w-4" />
                평가 저장
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
