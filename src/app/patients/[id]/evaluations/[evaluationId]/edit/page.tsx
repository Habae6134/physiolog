'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { EvaluationForm } from '@/features/evaluations/components/EvaluationForm'
import { evaluationStore, patientStore } from '@/lib/storage'
import type { EvaluationFormValues } from '@/features/evaluations/domain/schema'
import type { Patient } from '@/features/patients/domain/types'
import type { Evaluation, MMTGrade } from '@/features/evaluations/domain/types'

type PageProps = { params: Promise<{ id: string; evaluationId: string }> }

export default function EditEvaluationPage({ params }: PageProps) {
  const { id: patientId, evaluationId } = use(params)
  const router = useRouter()
  const [patient, setPatient] = useState<Patient | null | undefined>(undefined)
  const [evaluation, setEvaluation] = useState<Evaluation | null | undefined>(undefined)

  useEffect(() => {
    setPatient(patientStore.getPatient(patientId) ?? null)
    setEvaluation(evaluationStore.getEvaluation(patientId, evaluationId) ?? null)
  }, [patientId, evaluationId])

  function handleSubmit(values: EvaluationFormValues) {
    evaluationStore.updateEvaluation(patientId, evaluationId, {
      date: values.date,
      vas: values.toggleVas ? values.vas : undefined,
      rom: values.toggleRom ? values.rom : undefined,
      mmt: values.toggleMmt
        ? values.mmt.map((m) => ({ ...m, grade: m.grade as MMTGrade }))
        : undefined,
      bodyMeasurement: values.toggleMeasurement ? values.measurement : undefined,
      custom: values.toggleCustom ? values.custom : undefined,
    })
    toast.success('평가기록 수정됨')
    router.replace(`/patients/${patientId}?tab=evaluations`)
  }

  if (patient === undefined || evaluation === undefined) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        불러오는 중…
      </div>
    )
  }

  if (patient === null || evaluation === null) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        평가 정보를 찾을 수 없습니다.
      </div>
    )
  }

  const defaultValues: Partial<EvaluationFormValues> = {
    date: evaluation.date,
    toggleVas: evaluation.vas !== undefined,
    vas: evaluation.vas,
    toggleRom: evaluation.rom !== undefined && evaluation.rom.length > 0,
    rom: evaluation.rom ?? [],
    toggleMmt: evaluation.mmt !== undefined && evaluation.mmt.length > 0,
    mmt: evaluation.mmt ?? [],
    toggleMeasurement: evaluation.bodyMeasurement !== undefined && evaluation.bodyMeasurement.length > 0,
    measurement: evaluation.bodyMeasurement ?? [],
    toggleCustom: evaluation.custom !== undefined && evaluation.custom.length > 0,
    custom: evaluation.custom ?? [],
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
          <h1 className="text-xl font-semibold">평가 수정</h1>
          <p className="truncate text-sm text-muted-foreground">{patient.name}</p>
        </div>
      </header>

      <EvaluationForm
        defaultValues={defaultValues}
        submitLabel="수정 완료"
        onSubmit={handleSubmit}
        onCancel={() => router.replace(`/patients/${patientId}?tab=evaluations`)}
      />
    </div>
  )
}
