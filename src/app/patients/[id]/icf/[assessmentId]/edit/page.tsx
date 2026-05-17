'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { getIcfAssessments } from '@/lib/supabase/icf'
import { updateIcfAssessment } from '@/lib/supabase/icf'
import { DOMAIN_KEYS, DOMAIN_META, type IcfDomains, type IcfAssessment } from '@/features/icf/domain/types'
import { LoadingScreen } from '@/components/loading-screen'

type PageProps = { params: Promise<{ id: string; assessmentId: string }> }

export default function IcfEditPage({ params }: PageProps) {
  const { id: patientId, assessmentId } = use(params)
  const router = useRouter()

  const [assessment, setAssessment] = useState<IcfAssessment | null | undefined>(undefined)
  const [date, setDate] = useState('')
  const [userInput, setUserInput] = useState('')
  const [domains, setDomains] = useState<IcfDomains>({ body: [], activity: [], participation: [], environment: [], personal: [] })
  const [finalNote, setFinalNote] = useState('')
  const [shortTermGoals, setShortTermGoals] = useState<string[]>(['', '', ''])
  const [longTermGoals, setLongTermGoals] = useState<string[]>([''])
  const [newItems, setNewItems] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const list = await getIcfAssessments(patientId)
      const found = list.find((a) => a.id === assessmentId) ?? null
      setAssessment(found)
      if (found) {
        setDate(found.date)
        setUserInput(found.turns.map((t) => t.input).join('\n\n'))
        setDomains(structuredClone(found.finalDomains))
        setFinalNote(found.finalNote ?? '')
        const st = found.shortTermGoals ?? []
        setShortTermGoals([st[0] ?? '', st[1] ?? '', st[2] ?? ''])
        setLongTermGoals([found.longTermGoals?.[0] ?? ''])
      }
    }
    load()
  }, [patientId, assessmentId])

  const removeItem = (domainKey: keyof IcfDomains, idx: number) => {
    setDomains((prev) => {
      const next = { ...prev, [domainKey]: [...prev[domainKey]] }
      next[domainKey].splice(idx, 1)
      return next
    })
  }

  const addItem = (domainKey: keyof IcfDomains) => {
    const text = (newItems[domainKey] ?? '').trim()
    if (!text) return
    setDomains((prev) => ({
      ...prev,
      [domainKey]: [...prev[domainKey], text],
    }))
    setNewItems((prev) => ({ ...prev, [domainKey]: '' }))
  }

  const handleSave = async () => {
    setIsSaving(true)

    // userInput → turns 구조로 재조립 (기존 result는 유지, input만 업데이트)
    const updatedTurns = assessment!.turns.map((t, i) =>
      i === 0 ? { ...t, input: userInput } : t
    )

    const result = await updateIcfAssessment(assessmentId, patientId, {
      date,
      turns: updatedTurns,
      finalDomains: domains,
      finalNote,
      shortTermGoals: shortTermGoals.filter((g) => g.trim()),
      longTermGoals: longTermGoals.filter((g) => g.trim()),
    })

    setIsSaving(false)

    if (!result.success) {
      toast.error('저장 실패', { description: result.error })
      return
    }

    toast.success('평가지 수정됨')
    router.replace(`/patients/${patientId}?tab=icf`)
    await new Promise(() => {})
  }

  if (assessment === undefined) return <LoadingScreen />
  if (assessment === null) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        평가 기록을 찾을 수 없습니다.
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-4 pb-28">
      <header className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="뒤로"
          className="flex h-9 w-9 items-center justify-center rounded-md transition hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold">평가지 수정</h1>
      </header>

      {/* 날짜 */}
      <section className="flex flex-col gap-2">
        <Label className="text-sm font-semibold">날짜</Label>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="max-w-[180px]"
        />
      </section>

      <Separator />

      {/* 평가 내용 — AI에 입력한 원문. 상세 뷰에서는 노출 안 함 */}
      <section className="flex flex-col gap-2">
        <div>
          <Label className="text-sm font-semibold">평가 내용</Label>
          <p className="text-xs text-muted-foreground mt-0.5">AI에 입력했던 평가 텍스트 (목록 상세에서는 표시되지 않음)</p>
        </div>
        <Textarea
          rows={6}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="평가 내용을 직접 입력하거나 수정하세요"
          className="text-sm"
        />
      </section>

      <Separator />

      {/* ICF 도메인 항목 편집 */}
      <section className="flex flex-col gap-4">
        <Label className="text-sm font-semibold">ICF 분류 항목</Label>
        {DOMAIN_KEYS.map((key) => {
          const meta = DOMAIN_META[key]
          return (
            <div key={key} className={`rounded-xl border p-4 ${meta.bg} ${meta.border}`}>
              <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${meta.color}`}>
                {meta.label}
              </p>

              {/* 기존 항목 칩 */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {domains[key].length === 0 && (
                  <span className="text-[11px] text-muted-foreground/60 italic">항목 없음</span>
                )}
                {domains[key].map((item, idx) => (
                  <span
                    key={idx}
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs ${meta.bg} ${meta.border}`}
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => removeItem(key, idx)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* 항목 추가 */}
              <div className="flex gap-2">
                <Input
                  value={newItems[key] ?? ''}
                  onChange={(e) => setNewItems((prev) => ({ ...prev, [key]: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addItem(key) } }}
                  placeholder="항목 추가 후 Enter"
                  className="h-8 text-xs bg-background"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => addItem(key)}
                  className="h-8 px-2 shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )
        })}
      </section>

      <Separator />

      {/* 임상 추론 요약 */}
      <section className="flex flex-col gap-2">
        <Label className="text-sm font-semibold">임상 추론 요약</Label>
        <Textarea
          rows={4}
          value={finalNote}
          onChange={(e) => setFinalNote(e.target.value)}
          placeholder="임상 추론 요약을 입력하세요"
          className="text-sm"
        />
      </section>

      <Separator />

      {/* 치료 목표 */}
      <section className="flex flex-col gap-4">
        <Label className="text-sm font-semibold">치료 목표</Label>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-primary">단기 목표</span>
            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">4주</span>
          </div>
          {shortTermGoals.map((goal, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="mt-2.5 text-[10px] font-bold text-muted-foreground w-4 shrink-0">{idx + 1}</span>
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
        </div>
      </section>

      {/* 저장 버튼 */}
      <div className="fixed inset-x-0 bottom-0 z-10 border-t bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-2xl gap-2 p-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => router.back()}
          >
            취소
          </Button>
          <Button
            type="button"
            className="flex-1"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSaving ? '저장 중...' : '수정 완료'}
          </Button>
        </div>
      </div>
    </div>
  )
}
