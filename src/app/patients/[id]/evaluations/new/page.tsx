'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { EvaluationForm } from '@/features/evaluations/components/EvaluationForm'
import { evaluationFavoritesStore } from '@/lib/storage'
import { getPatient } from '@/lib/supabase/patients'
import { getEvaluations, createEvaluation } from '@/lib/supabase/evaluations'
import type { EvaluationFormValues } from '@/features/evaluations/domain/schema'
import type { Patient, } from '@/features/patients/domain/types'
import type { Evaluation, EvaluationInput, MMTGrade } from '@/features/evaluations/domain/types'
import { LoadingScreen } from '@/components/loading-screen'
import { toISODate } from '@/lib/utils/date'

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
  const [latestEval, setLatestEval] = useState<Evaluation | null>(null)
  const [formKey, setFormKey] = useState(0)
  const [defaultValues, setDefaultValues] = useState<Partial<EvaluationFormValues> | undefined>(undefined)

  useEffect(() => {
    async function load() {
      const [p, evals] = await Promise.all([getPatient(patientId), getEvaluations(patientId)])
      setPatient(p)
      if (evals.length > 0) setLatestEval(evals[0])
    }
    load()
  }, [patientId])

  function handleCopyLatest() {
    if (!latestEval) return
    setDefaultValues(evaluationToFormValues(latestEval))
    setFormKey((k) => k + 1)
    toast.success('이전 검사 기록을 불러왔습니다.')
  }

  async function handleSubmit(values: EvaluationFormValues) {
    const input: EvaluationInput = {
      patientId,
      date: values.date,
      // vas는 EvaluationForm의 submitWithVas wrapper가 painMapping.intensity의 max로 자동 산출해서 채워줌
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
        if (c.name.trim()) {
          evaluationFavoritesStore.recordEvaluationUsage(c.name)
        }
      })
    }
    toast.success('검사 저장됨')
    router.replace(`/patients/${patientId}?tab=evaluations`)
    // 페이지 unmount까지 isSubmitting 유지 — 버튼 깜빡임 방지
    await new Promise(() => {})
  }

  if (patient === undefined) {
    return <LoadingScreen />
  }

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
        {latestEval && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyLatest}
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
    </div>
  )
}
