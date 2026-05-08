'use client'

import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { VASInput } from './VASInput'
import { ROMInput } from './ROMInput'
import { MMTInput } from './MMTInput'
import { MeasurementInput } from './MeasurementInput'
import { BodyMap } from './BodyMap'
import { CustomInput } from './CustomInput'
import { toISODate } from '@/lib/utils/date'
import {
  evaluationFormSchema,
  type EvaluationFormValues,
} from '@/features/evaluations/domain/schema'

type ToggleName =
  | 'toggleVas'
  | 'toggleRom'
  | 'toggleMmt'
  | 'toggleMeasurement'
  | 'togglePainMapping'
  | 'toggleCustom'

const EMPTY_DEFAULTS: EvaluationFormValues = {
  date: toISODate(),
  toggleVas: false,
  vas: undefined,
  toggleRom: false,
  rom: [],
  toggleMmt: false,
  mmt: [],
  toggleMeasurement: false,
  measurement: [],
  togglePainMapping: true,
  painMapping: [],
  toggleCustom: false,
  custom: [],
}

type Props = {
  defaultValues?: Partial<EvaluationFormValues>
  submitLabel?: string
  onSubmit: (values: EvaluationFormValues) => void | Promise<void>
  onCancel?: () => void
}

export function EvaluationForm({
  defaultValues,
  submitLabel = '저장',
  onSubmit,
  onCancel,
}: Props) {
  const form = useForm<EvaluationFormValues>({
    resolver: zodResolver(evaluationFormSchema),
    defaultValues: { ...EMPTY_DEFAULTS, ...defaultValues },
    mode: 'onSubmit',
  })

  const errors = form.formState.errors

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-5 pb-24"
      >
        <section className="flex flex-col gap-2">
          <Label className="text-base font-semibold">평가 날짜</Label>
          <Input
            type="date"
            className="max-w-[180px]"
            {...form.register('date')}
          />
          {errors.date && (
            <p className="text-sm text-destructive">{errors.date.message}</p>
          )}
        </section>

        <Separator />

        <ToggleSection
          title="ROM (관절가동범위)"
          subtitle="주요 관절·동작별 각도"
          name="toggleRom"
        >
          <ROMInput />
        </ToggleSection>

        <ToggleSection
          title="MMT (도수근력)"
          subtitle="근육별 0~5등급"
          name="toggleMmt"
        >
          <MMTInput />
        </ToggleSection>

        <ToggleSection
          title="신체 계측"
          subtitle="둘레 · 길이 · 부종"
          name="toggleMeasurement"
        >
          <MeasurementInput />
        </ToggleSection>

        <ToggleSection
          title="커스텀 평가"
          subtitle="특수검사 등 자유 평가입력"
          name="toggleCustom"
        >
          <CustomInput />
        </ToggleSection>

        <ToggleSection
          title="통증"
          subtitle="통증 부위 및 양상 (VAS 포함)"
          name="togglePainMapping"
        >
          <BodyMap 
            value={form.watch('painMapping')} 
            onChange={(v) => form.setValue('painMapping', v, { shouldDirty: true })} 
          />
        </ToggleSection>

        {errors.toggleVas?.message && (
          <p className="text-sm text-destructive">
            {String(errors.toggleVas.message)}
          </p>
        )}

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

function ToggleSection({
  title,
  subtitle,
  name,
  children,
}: {
  title: string
  subtitle?: string
  name: ToggleName
  children: React.ReactNode
}) {
  const { watch, setValue } = useFormContext<EvaluationFormValues>()
  const enabled = watch(name)
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Label className="text-base font-semibold">{title}</Label>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={(checked) =>
            setValue(name, checked, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        />
      </div>
      {enabled && <div className="mt-2">{children}</div>}
    </section>
  )
}
