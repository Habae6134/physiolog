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
  /** 선택 모드 여부 */
  isSelectionMode?: boolean
  /** 선택 상태 */
  isSelected?: boolean
  /** 선택 변경 핸들러 */
  onSelect?: (id: string, selected: boolean) => void
}

export function PatientCard({ 
  patient, 
  lastTreatmentDate,
  isSelectionMode,
  isSelected,
  onSelect
}: Props) {
  const age = calcAge(patient.birthDate)

  return (
    <div className="flex items-center gap-2">
      {isSelectionMode && (
        <div className="flex h-12 w-8 shrink-0 items-center justify-center">
          <input
            type="checkbox"
            className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
            checked={isSelected}
            onChange={(e) => onSelect?.(patient.id, e.target.checked)}
          />
        </div>
      )}
      <Link 
        href={isSelectionMode ? '#' : `/patients/${patient.id}`} 
        onClick={(e) => isSelectionMode && e.preventDefault()}
        className="block flex-1 min-w-0"
      >
        <Card 
          className={`px-4 py-3 transition hover:border-primary hover:shadow-sm ${
            isSelected ? 'border-primary bg-primary/5' : ''
          }`}
          onClick={() => isSelectionMode && onSelect?.(patient.id, !isSelected)}
        >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate font-semibold">{patient.name}</h3>
              {age !== undefined && (
                <span className="shrink-0 text-sm text-muted-foreground">
                  {age}세 · {GENDER_LABEL[patient.gender]}
                </span>
              )}
              <Badge 
                variant="secondary" 
                className={`shrink-0 text-[10px] px-1.5 py-0 h-5 font-medium ${getStatusColor(patient.status)}`}
              >
                {PATIENT_STATUS_LABEL[patient.status]}
              </Badge>
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
  </div>
  )
}
function getStatusColor(status: string) {
  switch (status) {
    case 'new': return 'bg-emerald-50 text-emerald-700 border-emerald-100'
    case 'readmit': return 'bg-blue-50 text-blue-700 border-blue-100'
    case 'hold': return 'bg-amber-50 text-amber-700 border-amber-100'
    case 'discharged': return 'bg-slate-100 text-slate-600 border-slate-200'
    default: return ''
  }
}
