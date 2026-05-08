'use client'

import { useFieldArray, useFormContext } from 'react-hook-form'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { EvaluationFormValues } from '@/features/evaluations/domain/schema'
import type { BodyMeasurementType } from '@/features/evaluations/domain/types'

const TYPES: { value: BodyMeasurementType; label: string }[] = [
  { value: 'circumference', label: '둘레' },
  { value: 'length', label: '길이' },
  { value: 'edema', label: '부종' },
]

const UNITS = ['cm', 'mm'] as const

export function MeasurementInput() {
  const { control, watch, setValue, register, formState } =
    useFormContext<EvaluationFormValues>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'measurement',
  })
  const error = formState.errors.measurement

  return (
    <div className="flex flex-col gap-2">
      {fields.length === 0 ? (
        <p className="rounded-md border border-dashed py-4 text-center text-sm text-muted-foreground">
          신체 계측 항목 없음
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {fields.map((field, idx) => (
            <div
              key={field.id}
              className="flex flex-col gap-2 rounded-md border bg-background p-3"
            >
              <div className="flex items-center gap-2">
                <Select
                  value={watch(`measurement.${idx}.type`) ?? 'circumference'}
                  onValueChange={(v) =>
                    setValue(
                      `measurement.${idx}.type`,
                      v as BodyMeasurementType,
                      { shouldDirty: true },
                    )
                  }
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="부위 (예: 우측 대퇴 중앙)"
                  {...register(`measurement.${idx}.location`)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(idx)}
                  aria-label="계측 제거"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  placeholder="값"
                  className="flex-1"
                  value={watch(`measurement.${idx}.value`) ?? ''}
                  onChange={(e) =>
                    setValue(
                      `measurement.${idx}.value`,
                      e.target.value === '' ? 0 : Number(e.target.value),
                      { shouldDirty: true },
                    )
                  }
                />
                <Select
                  value={watch(`measurement.${idx}.unit`) ?? 'cm'}
                  onValueChange={(v) =>
                    setValue(`measurement.${idx}.unit`, v as 'cm' | 'mm', {
                      shouldDirty: true,
                    })
                  }
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start"
        onClick={() =>
          append({
            type: 'circumference',
            location: '',
            value: 0,
            unit: 'cm',
          })
        }
      >
        <Plus className="mr-1 h-4 w-4" />계측 추가
      </Button>

      {error && typeof error.message === 'string' && (
        <p className="text-sm text-destructive">{error.message}</p>
      )}
    </div>
  )
}
