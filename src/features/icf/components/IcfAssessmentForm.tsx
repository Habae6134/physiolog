'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Sparkles, MessageSquare, Save, RefreshCw, Info, AlertTriangle, Target } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { IcfDomainCard } from './IcfDomainCard'
import { createIcfAssessment } from '@/lib/supabase/icf'
import { getPatient } from '@/lib/supabase/patients'
import { getEvaluations } from '@/lib/supabase/evaluations'
import { mergeDomains, mergeRedFlags, DOMAIN_KEYS, DOMAIN_META, type IcfTurn, type IcfAnalysisResult, type GoalStatus, type IcfAssessment } from '@/features/icf/domain/types'
import type { Patient } from '@/features/patients/domain/types'
import type { Evaluation } from '@/features/evaluations/domain/types'

interface ApiMessage {
  role: 'user' | 'assistant'
  content: string
}

interface Props {
  patientId: string
  initialInput?: string
  previousAssessment?: IcfAssessment
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

export function IcfAssessmentForm({ patientId, initialInput: _initialInput, previousAssessment }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState<Status>('idle')
  const [input, setInput] = useState('')
  const [prevExpanded, setPrevExpanded] = useState(false)
  const [followUp, setFollowUp] = useState('')
  const [turns, setTurns] = useState<IcfTurn[]>([])
  const [history, setHistory] = useState<ApiMessage[]>([])
  const [currentResult, setCurrentResult] = useState<IcfAnalysisResult | null>(null)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [shortTermGoals, setShortTermGoals] = useState<string[]>(['', '', ''])
  const [longTermGoals, setLongTermGoals] = useState<string[]>([''])
  const [shortTermGoalStatuses, setShortTermGoalStatuses] = useState<GoalStatus[]>(['ongoing', 'ongoing', 'ongoing'])
  const [longTermGoalStatuses, setLongTermGoalStatuses] = useState<GoalStatus[]>(['ongoing'])
  const [isGoalsGenerating, setIsGoalsGenerating] = useState(false)
  useEffect(() => {
    async function loadData() {
      const p = await getPatient(patientId)
      const evs = await getEvaluations(patientId)
      if (p) {
        setPatient(p)
        setEvaluations(evs)
      }
    }
    loadData()
  }, [patientId])

  const latestDomains = turns.length > 0 ? mergeDomains(turns) : null
  const allRedFlags = turns.length > 0 ? mergeRedFlags(turns) : []

  async function analyze(userInput: string) {
    if (!userInput.trim()) return
    setStatus('loading')

    const newHistory: ApiMessage[] = [...history, { role: 'user', content: userInput }]

    const res = await fetch('/api/icf/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: userInput, history, patientId, previousAssessment }),
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
    const filteredShort = shortTermGoals.filter((g) => g.trim())
    const filteredLong = longTermGoals.filter((g) => g.trim())

    const result = await createIcfAssessment(patientId, {
      date: new Date().toISOString().slice(0, 10),
      turns,
      finalDomains: merged,
      finalNote: lastNote,
      shortTermGoals: filteredShort,
      longTermGoals: filteredLong,
      shortTermGoalStatuses: shortTermGoalStatuses.slice(0, filteredShort.length),
      longTermGoalStatuses: longTermGoalStatuses.slice(0, filteredLong.length),
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
    setShortTermGoals(['', '', ''])
    setLongTermGoals([''])
    setShortTermGoalStatuses(['ongoing', 'ongoing', 'ongoing'])
    setLongTermGoalStatuses(['ongoing'])
  }

  async function handleGenerateGoals() {
    setIsGoalsGenerating(true)
    try {
      const res = await fetch('/api/goals/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId }),
      })
      const data = await res.json() as { shortTermGoals?: string[]; longTermGoals?: string[]; error?: string }
      if (!res.ok || data.error) {
        toast.error(data.error ?? 'AI 추천 실패')
        return
      }
      const st = data.shortTermGoals ?? []
      const lt = data.longTermGoals ?? []
      setShortTermGoals([st[0] ?? '', st[1] ?? '', st[2] ?? ''])
      setLongTermGoals([lt[0] ?? ''])
      toast.success('AI 목표 추천 완료')
    } catch {
      toast.error('네트워크 오류가 발생했습니다.')
    } finally {
      setIsGoalsGenerating(false)
    }
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
          {/* 이전 평가 참조 카드 (재평가 모드일 때만) */}
          {previousAssessment && (() => {
            const prevText = previousAssessment.turns.map((t) => t.input).join('\n\n')
            return (
              <div className="rounded-lg border border-blue-200 bg-blue-50/40 overflow-hidden">
                {/* 헤더 */}
                <button
                  type="button"
                  onClick={() => setPrevExpanded((v) => !v)}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-left"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-blue-700">이전 평가</span>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-blue-100 border border-blue-300 text-blue-700">
                      참조중
                    </span>
                    <span className="text-[10px] text-blue-600/70">{previousAssessment.date}</span>
                    <div className="flex flex-wrap gap-1">
                      {DOMAIN_KEYS.filter((k) => previousAssessment.finalDomains[k].length > 0).map((k) => (
                        <span key={k} className={`px-1.5 py-0.5 rounded-full border text-[10px] font-medium ${DOMAIN_META[k].bg} ${DOMAIN_META[k].border} ${DOMAIN_META[k].color}`}>
                          {DOMAIN_META[k].label} {previousAssessment.finalDomains[k].length}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="text-[10px] text-blue-500 shrink-0 ml-2">
                    {prevExpanded ? '접기' : '펼치기'}
                  </span>
                </button>

                {/* 이전 평가 텍스트 — 펼쳤을 때만 */}
                {prevExpanded && prevText && (
                  <div className="border-t border-blue-200 px-3 py-2.5 bg-blue-50/60">
                    <p className="text-xs text-blue-800/80 leading-relaxed whitespace-pre-wrap">{prevText}</p>
                  </div>
                )}
              </div>
            )
          })()}

          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-semibold">
              {previousAssessment ? '재평가 내용 입력' : '초기 상담 내용 입력'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {previousAssessment
                ? '현재 시점의 변화·추가 관찰 내용을 입력하세요. AI가 이전 평가와 비교해 재분류합니다.'
                : '환자와의 초기 상담, 임상 관찰, 수행 관찰 내용을 자유롭게 적어주세요. AI가 5개 영역으로 분류합니다.'}
            </p>
          </div>

          <div className="flex items-start gap-2 rounded-md border border-blue-100 bg-blue-50/60 px-3 py-2 text-xs text-blue-800">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />
            <div>
              <span className="font-semibold">환자 컨텍스트 자동 참고</span>
              <span className="ml-1 text-blue-700/90">
                — 이 환자의 기본정보 · 최근 평가 1건 · 최근 치료 1건을 AI에게 자동 전달합니다. 새로 관찰한 내용 위주로 입력하세요.
              </span>
            </div>
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
                      <Badge
                        key={tag}
                        variant="secondary"
                        className={`cursor-pointer px-2.5 py-1 text-xs font-normal border transition-all active:scale-95 ${cat.color} ${input.includes(tag) ? 'ring-2 ring-primary ring-offset-1' : ''}`}
                        onClick={() => addTag(tag)}
                      >
                        {tag}
                      </Badge>
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
          className="flex flex-col items-center justify-center gap-4 py-20"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="h-12 w-12 rounded-full border-2 border-primary/20 border-t-primary"
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Sparkles className="h-5 w-5 text-primary" />
            </motion.div>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">AI 임상 추론 분석 중…</p>
            <p className="text-xs text-muted-foreground mt-1">프레임워크에 따라 5개 영역으로 분류하고 있습니다.</p>
          </div>
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
            {/* Red flag 경고 — 의사 평가 우선 권유 */}
            {allRedFlags.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                role="alert"
                aria-live="polite"
                className="flex flex-col gap-2 rounded-lg border-2 border-red-300 bg-red-50 p-3 shadow-sm"
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-bold text-red-700">
                      ⚠️ 적색 신호 감지 — 의사 평가 우선 권유
                    </p>
                    <p className="text-xs text-red-700/90">
                      아래 단서는 물리치료 범위를 넘어 의학적 평가가 우선될 수 있는 신호입니다. 환자에게 즉시 의사 진료를 권유하세요.
                    </p>
                  </div>
                </div>
                <ul className="ml-7 list-disc space-y-1 text-sm text-red-800">
                  {allRedFlags.map((flag, idx) => (
                    <li key={idx} className="leading-relaxed">{flag}</li>
                  ))}
                </ul>
              </motion.section>
            )}

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

            {/* 치료 목표 */}
            <motion.section
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col gap-3 rounded-lg border p-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Target className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold">치료 목표</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateGoals}
                  disabled={isGoalsGenerating}
                  className="gap-1.5 text-xs h-8"
                >
                  {isGoalsGenerating ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                  )}
                  {isGoalsGenerating ? 'AI 분석 중...' : 'AI 추천 받기'}
                </Button>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-primary">단기 목표</span>
                  <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">4주</span>
                </div>
                {shortTermGoals.map((goal, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="mt-2.5 text-[10px] font-bold text-muted-foreground w-4 shrink-0">{idx + 1}</span>
                    <div className="flex flex-1 flex-col gap-1">
                      <Textarea
                        rows={2}
                        value={goal}
                        onChange={(e) => {
                          const next = [...shortTermGoals]
                          next[idx] = e.target.value
                          setShortTermGoals(next)
                        }}
                        placeholder={`단기 목표 ${idx + 1}`}
                        className="text-sm resize-none"
                      />
                      <GoalStatusToggle
                        value={shortTermGoalStatuses[idx] ?? 'ongoing'}
                        onChange={(v) => {
                          const next = [...shortTermGoalStatuses]
                          next[idx] = v
                          setShortTermGoalStatuses(next)
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-foreground">장기 목표</span>
                  <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">8주</span>
                </div>
                <Textarea
                  rows={2}
                  value={longTermGoals[0] ?? ''}
                  onChange={(e) => setLongTermGoals([e.target.value])}
                  placeholder="장기 목표"
                  className="text-sm resize-none"
                />
                <GoalStatusToggle
                  value={longTermGoalStatuses[0] ?? 'ongoing'}
                  onChange={(v) => setLongTermGoalStatuses([v])}
                />
              </div>
            </motion.section>

            {/* 액션 버튼 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
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

function GoalStatusToggle({ value, onChange }: { value: GoalStatus; onChange: (v: GoalStatus) => void }) {
  return (
    <div className="flex gap-1.5">
      <button
        type="button"
        onClick={() => onChange('ongoing')}
        className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium border transition-colors ${
          value === 'ongoing'
            ? 'bg-amber-50 border-amber-300 text-amber-700'
            : 'bg-muted border-transparent text-muted-foreground hover:border-muted-foreground/30'
        }`}
      >
        진행중
      </button>
      <button
        type="button"
        onClick={() => onChange('achieved')}
        className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium border transition-colors ${
          value === 'achieved'
            ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
            : 'bg-muted border-transparent text-muted-foreground hover:border-muted-foreground/30'
        }`}
      >
        달성됨
      </button>
    </div>
  )
}
