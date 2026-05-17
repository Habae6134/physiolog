'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { IcfAssessmentForm } from '@/features/icf/components/IcfAssessmentForm'
import { getIcfAssessments } from '@/lib/supabase/icf'
import { formatDate } from '@/lib/utils/date'
import { DOMAIN_KEYS, DOMAIN_META, type IcfAssessment } from '@/features/icf/domain/types'

type PageProps = { params: Promise<{ id: string }> }

export default function IcfNewPage({ params }: PageProps) {
  const { id } = use(params)
  const [assessments, setAssessments] = useState<IcfAssessment[]>([])
  const [sheetOpen, setSheetOpen] = useState(false)
  const [initialInput, setInitialInput] = useState<string | undefined>(undefined)
  const [formKey, setFormKey] = useState(0)

  useEffect(() => {
    getIcfAssessments(id).then(setAssessments)
  }, [id])

  function handleSelectAssessment(a: IcfAssessment) {
    const text = a.turns.map((t) => t.input).join('\n\n')
    setInitialInput(text)
    setFormKey((k) => k + 1)
    setSheetOpen(false)
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-4 pb-8">
      <header className="flex items-center gap-2">
        <Link
          href={`/patients/${id}?tab=icf`}
          aria-label="뒤로"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-semibold">평가지</h1>
          <p className="text-xs text-muted-foreground">임상 추론 보조</p>
        </div>
        {assessments.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setSheetOpen(true)}
            className="shrink-0 gap-1.5 text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            재평가
          </Button>
        )}
      </header>

      <IcfAssessmentForm key={formKey} patientId={id} initialInput={initialInput} />

      {/* 이전 평가 선택 시트 */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="max-h-[70vh] overflow-y-auto">
          <SheetHeader className="text-left mb-4">
            <SheetTitle>어떤 평가 기록을 바탕으로 재평가할까요?</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-2 pb-6">
            {assessments.map((a) => {
              const filledDomains = DOMAIN_KEYS.filter((k) => a.finalDomains[k].length > 0)
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => handleSelectAssessment(a)}
                  className="flex items-start justify-between rounded-lg border bg-card px-4 py-3 text-left transition hover:bg-muted active:scale-[0.99]"
                >
                  <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium">{formatDate(a.date)}</span>
                    <div className="flex flex-wrap gap-1">
                      {filledDomains.map((k) => (
                        <span
                          key={k}
                          className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${DOMAIN_META[k].bg} ${DOMAIN_META[k].border} ${DOMAIN_META[k].color}`}
                        >
                          {DOMAIN_META[k].label}
                        </span>
                      ))}
                    </div>
                  </div>
                  {a.turns.length > 0 && (
                    <Badge variant="secondary" className="text-xs shrink-0 ml-2">
                      {a.turns.length}턴
                    </Badge>
                  )}
                </button>
              )
            })}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
