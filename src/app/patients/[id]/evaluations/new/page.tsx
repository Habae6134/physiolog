'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { EvaluationForm } from '@/features/evaluations/components/EvaluationForm'
import { evaluationFavoritesStore } from '@/lib/storage'
import { getPatient } from '@/lib/supabase/patients'
import { getEvaluations, createEvaluation } from '@/lib/supabase/evaluations'
import type { EvaluationFormValues } from '@/features/evaluations/domain/schema'
import type { Patient } from '@/features/patients/domain/types'
import type { Evaluation, EvaluationInput, MMTGrade } from '@/features/evaluations/domain/types'
import { LoadingScreen } from '@/components/loading-screen'
import { toISODate, formatDate } from '@/lib/utils/date'

type PageProps = { params: Promise<{ id: string }> }

function evaluationToFormValues(ev: Evaluation): Partial<EvaluationFormValues> {
  return {
    date: toISODate(),
    toggleRom: (ev.rom?.length ?? 0) > 0,
    rom: (ev.rom ?? []).map((r) => ({ ...r, side: r.side ?? 'both' })),
    toggleMmt: (ev.mmt?.length ?? 0) > 0,
    mmt: (ev.mmt ?? []).map((m) => ({ ...m, side: m.side ?? 'both' })),
    toggleMeasurement: (ev.bodyMeasurement?.length ?? 0) > 0,
    measurement: ev.bodyMeasurement ?? [],
    togglePainMapping: (ev.painMapping?.length ?? 0) > 0,
    painMapping: ev.painMapping ?? [],
    toggleCustom: (ev.custom?.length ?? 0) > 0,
    custom: ev.custom ?? [],
  }
}

export default function NewEvaluationPage({ params }: PageProps) {
  const { id: patientId } = use(params)
  const router = useRouter()
  const [patient, setPatient] = useState<Patient | null | undefined>(undefined)
  const [evals, setEvals] = useState<Evaluation[]>([])
  const [sheetOpen, setSheetOpen] = useState(false)
  const [formKey, setFormKey] = useState(0)
  const [defaultValues, setDefaultValues] = useState<Partial<EvaluationFormValues> | undefined>(undefined)

  useEffect(() => {
    async function load() {
      const [p, evList] = await Promise.all([getPatient(patientId), getEvaluations(patientId)])
      setPatient(p)
      setEvals(evList)
    }
    load()
  }, [patientId])

  function handleCopy(ev: Evaluation) {
    setDefaultValues(evaluationToFormValues(ev))
    setFormKey((k) => k + 1)
    setSheetOpen(false)
    toast.success(`${formatDate(ev.date)} 기록을 불러왔습니다.`)
  }

  async function handleSubmit(values: EvaluationFormValues) {
    const input: EvaluationInput = {
      patientId,
      date: values.date,
      vas: values.vas,
      rom: values.toggleRom ? values.rom : undefined,
      mmt: values.toggleMmt
        ? values.mmt.map((m) => ({ ...m, grade: m.grade as MMTGrade }))
        : undefined,
      bodyMeasurement: values.toggleMeasurement ? values.measurement : undefined,
      painMapping: values.togglePainMapping ? values.painMapping : undefined,
      custom: values.toggleCustom ? values.custom : undefined,
    }

    const result = await createEvaluation(input)

    if (!result.success) {
      toast.error('검사 기록 저장 실패', { description: result.error })
      return
    }
    if (values.toggleCustom && values.custom) {
      values.custom.forEach((c) => {
        if (c.name.trim()) evaluationFavoritesStore.recordEvaluationUsage(c.name)
      })
    }
    toast.success('검사 저장됨')
    router.replace(`/patients/${patientId}?tab=evaluations`)
    await new Promise(() => {})
  }

  if (patient === undefined) return <LoadingScreen />
  if (patient === null) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        환자를 찾을 수 없습니다.
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-4">
      <header className="flex items-center gap-2">
        <Link
          href={`/patients/${patientId}?tab=evaluations`}
          aria-label="뒤로"
          className="flex h-9 w-9 items-center justify-center rounded-md transition hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-semibold">검사 입력</h1>
          <p className="truncate text-sm text-muted-foreground">{patient.name}</p>
        </div>
        {evals.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setSheetOpen(true)}
            className="shrink-0 gap-1.5 text-xs"
          >
            <Copy className="h-3.5 w-3.5" />
            이전 기록 복사
          </Button>
        )}
      </header>

      <EvaluationForm
        key={formKey}
        patientGender={patient.gender}
        submitLabel="저장"
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        onCancel={() => router.replace(`/patients/${patientId}?tab=evaluations`)}
      />

      {/* 날짜 선택 시트 */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="max-h-[70vh] overflow-y-auto">
          <SheetHeader className="text-left mb-4">
            <SheetTitle>어떤 날짜 기록을 복사할까요?</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-2 pb-6">
            {evals.map((ev) => {
              const badges: string[] = []
              if (typeof ev.vas === 'number') badges.push(`VAS ${ev.vas}`)
              if (ev.rom?.length) badges.push(`ROM ${ev.rom.length}`)
              if (ev.mmt?.length) badges.push(`MMT ${ev.mmt.length}`)
              if (ev.bodyMeasurement?.length) badges.push(`계측 ${ev.bodyMeasurement.length}`)
              if (ev.painMapping?.length) badges.push(`통증 ${ev.painMapping.length}`)
              if (ev.custom?.length) badges.push(`기타 ${ev.custom.length}`)
              return (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => handleCopy(ev)}
                  className="flex items-center justify-between rounded-lg border bg-card px-4 py-3 text-left transition hover:bg-muted active:scale-[0.99]"
                >
                  <span className="text-sm font-medium">{formatDate(ev.date)}</span>
                  <div className="flex flex-wrap justify-end gap-1">
                    {badges.map((b) => (
                      <Badge key={b} variant="secondary" className="text-xs">
                        {b}
                      </Badge>
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
