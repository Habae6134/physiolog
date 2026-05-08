'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BODY_REGION_LABEL, SIDE_LABEL } from '@/data/body-parts'
import {
  EXERCISE_CONCEPT_LABEL,
  TREATMENT_METHOD_LABEL,
} from '@/data/treatment-options'
import { formatDateShort } from '@/lib/utils/date'
import type { Treatment } from '@/features/treatments/domain/types'

type Props = {
  treatment: Treatment
  onClick?: () => void
  onDelete?: (id: string) => void
}

export function TreatmentCard({ treatment, onClick, onDelete }: Props) {
  return (
    <Card
      onClick={onClick}
      className="group cursor-pointer px-4 py-3 transition hover:border-primary"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {formatDateShort(treatment.date)}
            </span>
            <div className="flex flex-wrap gap-1">
              {treatment.bodyParts.map((p, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {BODY_REGION_LABEL[p.region] ?? p.region}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            {treatment.methods.map((m) => (
              <span key={m} className="text-[10px] text-muted-foreground">
                #{TREATMENT_METHOD_LABEL[m]}
              </span>
            ))}
          </div>
        </div>

        {onDelete && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(treatment.id)
            }}
            aria-label="삭제"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Card>
  )
}
