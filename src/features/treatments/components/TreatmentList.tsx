'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Copy, FileText, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TreatmentCard } from './TreatmentCard'
import { TreatmentDetailSheet } from './TreatmentDetailSheet'
import { treatmentStore } from '@/lib/storage'
import type { Treatment } from '@/features/treatments/domain/types'

type Props = { patientId: string }

export function TreatmentList({ patientId }: Props) {
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [selected, setSelected] = useState<Treatment | null>(null)

  useEffect(() => {
    setTreatments(treatmentStore.getTreatments(patientId))
    setHydrated(true)
  }, [patientId])

  const hasAny = treatments.length > 0

  const handleDelete = (id: string) => {
    if (!confirm('이 치료기록을 삭제할까요?')) return
    treatmentStore.deleteTreatment(patientId, id)
    setTreatments(treatmentStore.getTreatments(patientId))
    setSelected(null)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {hydrated ? `총 ${treatments.length}건` : '불러오는 중…'}
        </p>
        <div className="flex gap-2">
          {hasAny && (
            <Button asChild variant="outline" size="sm">
              <Link
                href={`/patients/${patientId}/treatments/new?copy=1`}
              >
                <Copy className="mr-1 h-4 w-4" />이전 기록 복사
              </Link>
            </Button>
          )}
          <Button asChild size="sm">
            <Link href={`/patients/${patientId}/treatments/new`}>
              <Plus className="mr-1 h-4 w-4" />작성
            </Link>
          </Button>
        </div>
      </div>

      {hydrated && !hasAny && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed py-12">
          <FileText
            className="h-10 w-10 text-muted-foreground/40"
            strokeWidth={1.5}
          />
          <p className="text-sm text-muted-foreground">
            아직 작성된 치료기록이 없습니다.
          </p>
          <Button asChild size="sm">
            <Link href={`/patients/${patientId}/treatments/new`}>
              <Plus className="mr-1 h-4 w-4" />첫 치료기록 작성
            </Link>
          </Button>
        </div>
      )}

      {hasAny && (
        <div className="flex flex-col gap-2">
          {treatments.map((t) => (
            <TreatmentCard
              key={t.id}
              treatment={t}
              onClick={() => setSelected(t)}
            />
          ))}
        </div>
      )}

      <TreatmentDetailSheet
        treatment={selected}
        onOpenChange={(open) => !open && setSelected(null)}
        onDelete={handleDelete}
      />
    </div>
  )
}
