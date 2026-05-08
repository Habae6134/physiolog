'use client'

import { useFormContext } from 'react-hook-form'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { TREATMENT_METHOD_OPTIONS } from '@/data/treatment-options'
import type { TreatmentMethod } from '@/features/treatments/domain/types'
import type { TreatmentFormValues } from '@/features/treatments/domain/schema'

export function MethodSelector() {
  const { watch, setValue, register } = useFormContext<TreatmentFormValues>()
  const selected = watch('methods') ?? []
  const isOtherOn = selected.includes('other')

  const toggle = (m: TreatmentMethod) => {
    if (selected.includes(m)) {
      setValue(
        'methods',
        selected.filter((s) => s !== m),
        { shouldDirty: true, shouldValidate: true },
      )
    } else {
      setValue('methods', [...selected, m], {
        shouldDirty: true,
        shouldValidate: true,
      })
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        {TREATMENT_METHOD_OPTIONS.map((opt) => {
          const isOn = selected.includes(opt.value)
          return (
            <Label
              key={opt.value}
              htmlFor={`method-${opt.value}`}
              className={
                isOn
                  ? 'flex cursor-pointer items-center gap-2 rounded-md border border-primary bg-primary/5 px-3 py-2'
                  : 'flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-2 hover:bg-accent'
              }
            >
              <Checkbox
                id={`method-${opt.value}`}
                checked={isOn}
                onCheckedChange={() => toggle(opt.value)}
              />
              <span className="select-none text-sm font-medium">
                {opt.label}
              </span>
            </Label>
          )
        })}
      </div>

      {isOtherOn && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="otherTreatmentMethod" className="text-xs text-muted-foreground">기타 치료방법 상세</Label>
          <Input
            id="otherTreatmentMethod"
            placeholder="직접 입력"
            className="h-9"
            {...register('otherTreatmentMethod')}
          />
        </div>
      )}
    </div>
  )
}
