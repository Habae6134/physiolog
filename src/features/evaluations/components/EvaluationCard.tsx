'use client'

import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDateShort } from '@/lib/utils/date'
import type { Evaluation } from '@/features/evaluations/domain/types'

type Props = {
  evaluation: Evaluation
  onClick?: () => void
  onDelete?: (id: string) => void
}

export function EvaluationCard({ evaluation, onClick, onDelete }: Props) {
  const summary = buildSummary(evaluation)

  return (
    <Card
      onClick={onClick}
      className="group cursor-pointer px-4 py-3 transition hover:border-primary"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {formatDateShort(evaluation.date)}
          </span>
          <div className="flex flex-wrap gap-1">
            {summary.map((s) => (
              <Badge key={s} variant="secondary" className="text-xs">
                {s}
              </Badge>
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
              onDelete(evaluation.id)
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

function buildSummary(e: Evaluation): string[] {
  const out: string[] = []
  if (typeof e.vas === 'number') out.push(`VAS ${e.vas}`)
  if (e.rom && e.rom.length > 0) out.push(`ROM ${e.rom.length}`)
  if (e.mmt && e.mmt.length > 0) out.push(`MMT ${e.mmt.length}`)
  if (e.bodyMeasurement && e.bodyMeasurement.length > 0)
    out.push(`계측 ${e.bodyMeasurement.length}`)
  if (e.custom && e.custom.length > 0) out.push(`기타 ${e.custom.length}`)
  if (out.length === 0) out.push('비어 있음')
  return out
}
