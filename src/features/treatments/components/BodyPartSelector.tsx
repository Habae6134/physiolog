'use client'

import { useFieldArray, useFormContext } from 'react-hook-form'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ToggleSide } from './ToggleSide'
import { MuscleCombobox } from './MuscleCombobox'
import { BODY_REGIONS, getMusclesForRegion } from '@/data/body-parts'
import type { BodyRegionId, Side } from '@/features/treatments/domain/types'
import type { TreatmentFormValues } from '@/features/treatments/domain/schema'

export function BodyPartSelector() {
  const { control, watch, setValue } = useFormContext<TreatmentFormValues>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'bodyParts',
  })

  const selectedRegions = new Set(watch('bodyParts')?.map((p) => p.region) ?? [])

  const addRegion = (region: BodyRegionId) => {
    if (selectedRegions.has(region)) {
      // 이미 선택된 부위는 토글 → 제거
      const idx = fields.findIndex((f) => f.region === region)
      if (idx >= 0) remove(idx)
      return
    }
    append({ region, side: 'both', muscles: [] })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1.5">
        {BODY_REGIONS.map((r) => {
          const selected = selectedRegions.has(r.id)
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => addRegion(r.id)}
              className={
                selected
                  ? 'rounded-full border border-primary bg-primary px-3 py-1 text-sm font-medium text-primary-foreground'
                  : 'rounded-full border border-input bg-background px-3 py-1 text-sm hover:bg-accent'
              }
            >
              {r.label}
            </button>
          )
        })}
      </div>

      {fields.length > 0 && (
        <div className="flex flex-col gap-2">
          {fields.map((field, idx) => {
            const region = field.region as BodyRegionId
            const def = BODY_REGIONS.find((r) => r.id === region)
            const muscles = watch(`bodyParts.${idx}.muscles`) ?? []
            return (
              <Card key={field.id} className="px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{def?.label ?? region}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(idx)}
                    aria-label={`${def?.label ?? region} 제거`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-2 flex flex-col gap-2">
                  <ToggleSide
                    value={(watch(`bodyParts.${idx}.side`) as Side) ?? 'both'}
                    onChange={(v) =>
                      setValue(`bodyParts.${idx}.side`, v, {
                        shouldDirty: true,
                      })
                    }
                  />
                  <MuscleCombobox
                    options={getMusclesForRegion(region)}
                    value={muscles}
                    onChange={(next) =>
                      setValue(`bodyParts.${idx}.muscles`, next, {
                        shouldDirty: true,
                      })
                    }
                  />
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
