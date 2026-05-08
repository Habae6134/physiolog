'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Brain, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { IcfDomainCard } from './IcfDomainCard'
import { icfStore } from '@/lib/storage'
import { DOMAIN_KEYS, DOMAIN_META, type IcfAssessment } from '@/features/icf/domain/types'

type Props = { patientId: string }

export function IcfTab({ patientId }: Props) {
  const [assessments, setAssessments] = useState<IcfAssessment[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    setAssessments(icfStore.getIcfAssessments(patientId))
    setHydrated(true)
  }, [patientId])

  function handleDelete(id: string) {
    if (!confirm('이 평가를 삭제할까요?')) return
    icfStore.deleteIcfAssessment(patientId, id)
    setAssessments(icfStore.getIcfAssessments(patientId))
    if (expanded === id) setExpanded(null)
    toast.success('삭제되었습니다.')
  }

  if (!hydrated) {
    return <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">불러오는 중…</div>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">평가지</h3>
        <Button asChild size="sm"><Link href={`/patients/${patientId}/icf/new`}><Plus className="mr-1 h-4 w-4" />새 평가</Link></Button>
      </div>

      {assessments.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed py-12">
          <Brain className="h-10 w-10 text-muted-foreground/40" strokeWidth={1.5} />
          <p className="text-sm text-muted-foreground">아직 평가 기록이 없습니다.</p>
          <Button asChild size="sm"><Link href={`/patients/${patientId}/icf/new`}><Plus className="mr-1 h-4 w-4" />첫 평가 시작</Link></Button>
        </div>
      )}

      {assessments.map((a) => (
        <div key={a.id} className="rounded-lg border bg-card">
          {/* 카드 헤더 */}
          <button
            onClick={() => setExpanded(expanded === a.id ? null : a.id)}
            className="flex w-full items-center justify-between p-3 text-left"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">{a.date}</span>
              {/* 도메인 커버리지 도트 */}
              <div className="flex gap-1">
                {DOMAIN_KEYS.map((key) => {
                  const filled = a.finalDomains[key].length > 0
                  const meta = DOMAIN_META[key]
                  return (
                    <span
                      key={key}
                      title={meta.label}
                      className={`h-2 w-2 rounded-full ${filled ? meta.color.replace('text-', 'bg-') : 'bg-muted'}`}
                    />
                  )
                })}
              </div>
            </div>
            <span className="text-xs text-muted-foreground">{expanded === a.id ? '닫기' : '펼치기'}</span>
          </button>

          {/* 상세 */}
          {expanded === a.id && (
            <div className="border-t px-3 pb-3 pt-3 flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {DOMAIN_KEYS.map((key, i) => (
                  <IcfDomainCard key={key} domainKey={key} items={a.finalDomains[key]} index={i} />
                ))}
              </div>

              {a.finalNote && (
                <div className="rounded-lg border bg-muted/40 p-3">
                  <p className="mb-1 text-xs font-semibold text-muted-foreground">임상 추론 요약</p>
                  <p className="text-sm leading-relaxed">{a.finalNote}</p>
                </div>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(a.id)}
                className="w-full gap-1.5 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />삭제
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
