'use client'

import { useEffect, useState } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { Plus, Star, X, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { exerciseFavoritesStore, newId } from '@/lib/storage'
import { EXERCISE_CONCEPT_OPTIONS, EXERCISE_CONCEPT_LABEL } from '@/data/treatment-options'
import type { TreatmentFormValues } from '@/features/treatments/domain/schema'
import type { ExerciseConcept } from '@/features/treatments/domain/types'

type FavoriteEntry = { name: string; count: number; lastUsedAt: string }

export function ExerciseSection() {
  const { control, watch, formState } = useFormContext<TreatmentFormValues>()
  const { fields: groupFields, append: appendGroup, remove: removeGroup } = useFieldArray({
    control,
    name: 'exerciseGroups',
  })

  const groups = watch('exerciseGroups') ?? []
  const selectedConcepts = groups.map((g) => g.concept)
  const groupsError = formState.errors.exerciseGroups

  const handleConceptToggle = (concept: ExerciseConcept) => {
    const idx = selectedConcepts.indexOf(concept)
    if (idx >= 0) {
      removeGroup(idx)
    } else {
      appendGroup({ concept, exercises: [] })
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label>목적 선택 <span className="text-[10px] font-normal text-muted-foreground ml-1">복수 선택 가능</span></Label>
        <div className="flex flex-wrap gap-2">
          {EXERCISE_CONCEPT_OPTIONS.map((opt) => {
            const selected = selectedConcepts.includes(opt.value)
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleConceptToggle(opt.value)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                  selected
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-foreground border-input hover:bg-muted'
                }`}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
        {groupsError && typeof groupsError.message === 'string' && (
          <p className="text-sm text-destructive">{groupsError.message}</p>
        )}
      </div>

      {groupFields.map((field, groupIdx) => (
        <ExerciseGroupCard
          key={field.id}
          groupIdx={groupIdx}
          onRemove={() => removeGroup(groupIdx)}
        />
      ))}
    </div>
  )
}

function ExerciseGroupCard({ groupIdx, onRemove }: { groupIdx: number; onRemove: () => void }) {
  const { control, watch, register, setValue, formState } = useFormContext<TreatmentFormValues>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: `exerciseGroups.${groupIdx}.exercises`,
  })

  const concept = watch(`exerciseGroups.${groupIdx}.concept`)
  const exercises = watch(`exerciseGroups.${groupIdx}.exercises`) ?? []
  const exercisesError = formState.errors.exerciseGroups?.[groupIdx]?.exercises

  const [favorites, setFavorites] = useState<FavoriteEntry[]>([])
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    setFavorites(exerciseFavoritesStore.getSortedFavorites())
  }, [])

  const currentNames = new Set(exercises.map((e) => e.name.trim()))
  const suggestable = favorites.filter((f) => !currentNames.has(f.name)).slice(0, 5)

  const handleAdd = (name = '') => {
    append({ id: newId(), name, intensity: '', sets: 3, reps: 10, weight: 0 })
  }

  return (
    <Card className="flex flex-col gap-3 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">
            {EXERCISE_CONCEPT_LABEL[concept]}
          </Badge>
          <span className="text-xs text-muted-foreground">{fields.length}개</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-muted"
          >
            {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!collapsed && (
        <>
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">운동 목록</Label>
            <Button type="button" variant="outline" size="sm" onClick={() => handleAdd()} className="h-7 text-xs px-2">
              <Plus className="mr-1 h-3.5 w-3.5" />운동 추가
            </Button>
          </div>

          {suggestable.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="h-3 w-3" />자주 쓰는
              </span>
              {suggestable.map((f) => (
                <button
                  key={f.name}
                  type="button"
                  onClick={() => handleAdd(f.name)}
                  className="rounded-full border border-input bg-background px-2.5 py-1 text-xs hover:bg-accent"
                >
                  {f.name}
                  <span className="ml-1 text-muted-foreground">×{f.count}</span>
                </button>
              ))}
            </div>
          )}

          {fields.length === 0 ? (
            <p className="rounded-md border border-dashed py-5 text-center text-sm text-muted-foreground">
              추가된 운동이 없습니다.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {fields.map((field, idx) => (
                <div key={field.id} className="flex flex-col gap-2 rounded-md border bg-background p-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="shrink-0">{idx + 1}</Badge>
                    <Input
                      placeholder="운동명 (예: 스쿼트)"
                      {...register(`exerciseGroups.${groupIdx}.exercises.${idx}.name`)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(idx)}
                      aria-label="운동 제거"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <CounterField
                      label="세트"
                      value={watch(`exerciseGroups.${groupIdx}.exercises.${idx}.sets`) ?? 0}
                      onChange={(v) => setValue(`exerciseGroups.${groupIdx}.exercises.${idx}.sets`, v)}
                    />
                    <CounterField
                      label="횟수"
                      value={watch(`exerciseGroups.${groupIdx}.exercises.${idx}.reps`) ?? 0}
                      onChange={(v) => setValue(`exerciseGroups.${groupIdx}.exercises.${idx}.reps`, v)}
                    />
                    <CounterField
                      label="무게(kg)"
                      value={watch(`exerciseGroups.${groupIdx}.exercises.${idx}.weight`) ?? 0}
                      onChange={(v) => setValue(`exerciseGroups.${groupIdx}.exercises.${idx}.weight`, v)}
                    />
                    <CounterField
                      label="시간(분)"
                      value={watch(`exerciseGroups.${groupIdx}.exercises.${idx}.duration`) ?? 0}
                      onChange={(v) => setValue(`exerciseGroups.${groupIdx}.exercises.${idx}.duration`, v)}
                    />
                  </div>

                  <Textarea
                    rows={1}
                    placeholder="특이사항 (예: 좌측 통증 있음)"
                    {...register(`exerciseGroups.${groupIdx}.exercises.${idx}.intensity`)}
                    className="text-xs"
                  />
                </div>
              ))}
            </div>
          )}

          {exercisesError && typeof exercisesError.message === 'string' && (
            <p className="text-sm text-destructive">{exercisesError.message}</p>
          )}
        </>
      )}
    </Card>
  )
}

function CounterField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-medium text-muted-foreground ml-1">{label}</span>
      <div className="flex items-center overflow-hidden rounded-md border bg-slate-50">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="flex h-8 w-7 items-center justify-center text-slate-500 hover:bg-slate-100 active:bg-slate-200"
        >
          -
        </button>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
          className="w-full bg-transparent text-center text-xs font-semibold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="flex h-8 w-7 items-center justify-center text-slate-500 hover:bg-slate-100 active:bg-slate-200"
        >
          +
        </button>
      </div>
    </div>
  )
}
