'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { calcAge, formatDateRelative } from '@/lib/utils/date'
import { GENDER_LABEL, PATIENT_STATUS_LABEL } from '@/data/patient-options'
import type { Patient } from '@/features/patients/domain/types'

type Props = {
  patient: Patient
  /** 마지막 치료일 (없으면 "-") */
  lastTreatmentDate?: string
}

export function PatientCard({ patient, lastTreatmentDate }: Props) {
  const age = calcAge(patient.birthDate)
  const isInactive = patient.status !== 'new'

  return (
    <Link href={`/patients/${patient.id}`} className="block">
      <Card className="px-4 py-3 transition hover:border-primary hover:shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate font-semibold">{patient.name}</h3>
              {age !== undefined && (
                <span className="shrink-0 text-sm text-muted-foreground">
                  {age}세 · {GENDER_LABEL[patient.gender]}
                </span>
              )}
              {isInactive && (
                <Badge variant="outline" className="shrink-0">
                  {PATIENT_STATUS_LABEL[patient.status]}
                </Badge>
              )}
            </div>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              {patient.diagnosis || '진단명 미입력'}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-xs text-muted-foreground">마지막 치료</div>
            <div className="text-sm font-medium">
              {formatDateRelative(lastTreatmentDate)}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
