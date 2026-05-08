'use client'

import { useFormContext } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import type { EvaluationFormValues } from '@/features/evaluations/domain/schema'

export function VASInput() {
  const { watch, setValue, formState } = useFormContext<EvaluationFormValues>()
  const vas = watch('vas')
  const error = formState.errors.vas

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Input
          type="number"
          min={0}
          max={10}
          step={1}
          inputMode="numeric"
          value={vas ?? ''}
          onChange={(e) => {
            const v = e.target.value
            setValue('vas', v === '' ? undefined : Number(v), {
              shouldDirty: true,
              shouldValidate: true,
            })
          }}
          className="w-24"
        />
        <span className="text-sm text-muted-foreground">/ 10</span>
        <input
          type="range"
          min={0}
          max={10}
          step={1}
          value={vas ?? 0}
          onChange={(e) =>
            setValue('vas', Number(e.target.value), {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
          className="flex-1 accent-primary"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        0 = 통증 없음 · 10 = 최대 통증
      </p>
      {error && (
        <p className="text-sm text-destructive">{error.message}</p>
      )}
    </div>
  )
}
