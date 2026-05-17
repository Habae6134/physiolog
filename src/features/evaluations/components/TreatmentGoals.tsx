'use client'

import { useState } from 'react'
import { Sparkles, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { updateEvaluation } from '@/lib/supabase/evaluations'

type Props = {
  evaluationId: string
  patientId: string
  initialShortTermGoals?: string[]
  initialLongTermGoals?: string[]
  onSaved?: (shortTermGoals: string[], longTermGoals: string[]) => void
}

export function TreatmentGoals({
  evaluationId,
  patientId,
  initialShortTermGoals,
  initialLongTermGoals,
  onSaved,
}: Props) {
  const [shortTermGoals, setShortTermGoals] = useState<string[]>(
    initialShortTermGoals ?? ['', '', ''],
  )
  const [longTermGoals, setLongTermGoals] = useState<string[]>(
    initialLongTermGoals ?? [''],
  )
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const hasAnyContent = shortTermGoals.some((g) => g.trim()) || longTermGoals.some((g) => g.trim())

  const handleGenerate = async () => {
    setIsGenerating(true)
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
      setIsGenerating(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    const filteredShort = shortTermGoals.filter((g) => g.trim())
    const filteredLong = longTermGoals.filter((g) => g.trim())

    const result = await updateEvaluation(evaluationId, patientId, {
      shortTermGoals: filteredShort,
      longTermGoals: filteredLong,
    })

    setIsSaving(false)

    if (!result.success) {
      toast.error('저장 실패', { description: result.error })
      return
    }

    toast.success('치료 목표 저장됨')
    onSaved?.(filteredShort, filteredLong)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="gap-1.5 text-xs h-8"
        >
          {isGenerating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5 text-primary" />
          )}
          {isGenerating ? 'AI 분석 중...' : 'AI 추천 받기'}
        </Button>

        {hasAnyContent && (
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="gap-1.5 text-xs h-8"
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            저장
          </Button>
        )}
      </div>

      {/* 단기 목표 */}
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

      {/* 장기 목표 */}
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
    </div>
  )
}
