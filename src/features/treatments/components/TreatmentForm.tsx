'use client'

import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { BodyPartSelector } from './BodyPartSelector'
import { MethodSelector } from './MethodSelector'
import { ExerciseSection } from './ExerciseSection'
import { toISODate } from '@/lib/utils/date'
import {
  treatmentFormSchema,
  type TreatmentFormValues,
} from '@/features/treatments/domain/schema'

type Props = {
  defaultValues?: Partial<TreatmentFormValues>
  submitLabel?: string
  onSubmit: (values: TreatmentFormValues) => void | Promise<void>
  onCancel?: () => void
}

const EMPTY_DEFAULTS: TreatmentFormValues = {
  date: toISODate(),
  bodyParts: [],
  methods: [],
  exerciseConcept: undefined,
  exercises: [],
  homework: '',
  comment: '',
}

export function TreatmentForm({
  defaultValues,
  submitLabel = '저장',
  onSubmit,
  onCancel,
}: Props) {
  const form = useForm<TreatmentFormValues>({
    resolver: zodResolver(treatmentFormSchema),
    defaultValues: { ...EMPTY_DEFAULTS, ...defaultValues },
    mode: 'onSubmit',
  })

  const methods = form.watch('methods')
  const showExercise = methods?.includes('exercise')

  const errors = form.formState.errors

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6 pb-24"
      >
        <Section title="치료 날짜">
          <Input
            type="date"
            className="max-w-[180px]"
            {...form.register('date')}
          />
          {errors.date && (
            <p className="text-sm text-destructive">{errors.date.message}</p>
          )}
        </Section>

        <Separator />

        <Section title="치료 부위" subtitle="여러 부위 선택 가능 · 위에서 아래 순서">
          <BodyPartSelector />
          {errors.bodyParts && typeof errors.bodyParts.message === 'string' && (
            <p className="text-sm text-destructive">
              {errors.bodyParts.message}
            </p>
          )}
        </Section>

        <Separator />

        <Section title="치료 방법" subtitle="여러 개 선택 가능">
          <MethodSelector />
          {errors.methods && typeof errors.methods.message === 'string' && (
            <p className="text-sm text-destructive">{errors.methods.message}</p>
          )}
        </Section>

        {showExercise && (
          <>
            <Separator />
            <Section title="운동치료" subtitle="목적 선택 + 운동 추가">
              <ExerciseSection />
            </Section>
          </>
        )}

        <Separator />

        <Section title="숙제" subtitle="과제·운동 등">
          <Textarea
            rows={3}
            placeholder="예: 집에서 아침/저녁으로 폼롤러 스트레칭 10분 수행"
            {...form.register('homework')}
          />
        </Section>

        <Separator />

        <Section title="당일 코멘트" subtitle="환자 반응·특이사항">
          <Textarea
            rows={4}
            placeholder="예: 통증 호소 줄어듦. 다음 회기엔 코어 안정화 추가 예정."
            {...form.register('comment')}
          />
        </Section>

        <div className="fixed inset-x-0 bottom-0 z-10 border-t bg-background/95 backdrop-blur">
          <div className="mx-auto flex w-full max-w-2xl gap-2 p-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onCancel}
              >
                취소
              </Button>
            )}
            <Button type="submit" className="flex-1">
              {submitLabel}
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-3">
      <div>
        <Label className="text-base font-semibold">{title}</Label>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {children}
    </section>
  )
}
