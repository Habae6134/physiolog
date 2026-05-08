'use client'

import { Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { BODY_REGION_LABEL, SIDE_LABEL } from '@/data/body-parts'
import {
  EXERCISE_CONCEPT_LABEL,
  TREATMENT_METHOD_LABEL,
} from '@/data/treatment-options'
import { formatDate } from '@/lib/utils/date'
import type { Treatment } from '@/features/treatments/domain/types'

type Props = {
  treatment: Treatment | null
  onOpenChange: (open: boolean) => void
  onDelete?: (id: string) => void
}

export function TreatmentDetailSheet({ treatment, onOpenChange, onDelete }: Props) {
  const open = treatment !== null
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
        {treatment && (
          <>
            <SheetHeader className="text-left">
              <div className="flex items-center justify-between pr-8">
                <div>
                  <SheetTitle>{formatDate(treatment.date)}</SheetTitle>
                  <SheetDescription>치료기록 상세</SheetDescription>
                </div>
                <Button asChild variant="outline" size="sm" className="h-8 px-2">
                  <Link
                    href={`/patients/${treatment.patientId}/treatments/${treatment.id}/edit`}
                  >
                    <Pencil className="mr-1 h-3.5 w-3.5" />수정
                  </Link>
                </Button>
              </div>
            </SheetHeader>

            <div className="mt-4 flex flex-col gap-4 px-4 pb-6">
              <Section title="치료 부위">
                <ul className="flex flex-col gap-1.5">
                  {treatment.bodyParts.map((p, idx) => (
                    <li key={idx} className="text-sm">
                      <span className="font-medium">
                        {p.side && p.side !== 'both' ? `${SIDE_LABEL[p.side]} ` : ''}
                        {BODY_REGION_LABEL[p.region] ?? p.region}
                      </span>
                      {p.muscles && p.muscles.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {p.muscles.map((m) => (
                            <Badge key={m} variant="secondary" className="text-xs">
                              {m}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </Section>

              <Separator />

              <Section title="치료 방법">
                <div className="flex flex-wrap gap-1.5">
                  {treatment.methods.map((m) => (
                    <Badge key={m} variant="outline">
                      {TREATMENT_METHOD_LABEL[m]}
                    </Badge>
                  ))}
                </div>
              </Section>

              {treatment.exerciseConcept && (
                <>
                  <Separator />
                  <Section title="운동치료">
                    <Badge variant="secondary">
                      {EXERCISE_CONCEPT_LABEL[treatment.exerciseConcept]}
                    </Badge>
                    {treatment.exercises && treatment.exercises.length > 0 && (
                      <ul className="mt-2 flex flex-col gap-2">
                        {treatment.exercises.map((e, idx) => (
                          <li
                            key={e.id ?? idx}
                            className="rounded-md border bg-background p-2 text-sm"
                          >
                            <div className="font-medium">
                              {idx + 1}. {e.name}
                            </div>
                            {e.intensity && (
                              <p className="mt-0.5 whitespace-pre-wrap text-xs text-muted-foreground">
                                {e.intensity}
                              </p>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </Section>
                </>
              )}

              {treatment.homework && (
                <>
                  <Separator />
                  <Section title="숙제">
                    <p className="whitespace-pre-wrap text-sm">
                      {treatment.homework}
                    </p>
                  </Section>
                </>
              )}

              {treatment.comment && (
                <>
                  <Separator />
                  <Section title="당일 코멘트">
                    <p className="whitespace-pre-wrap text-sm">
                      {treatment.comment}
                    </p>
                  </Section>
                </>
              )}

              {onDelete && (
                <>
                  <Separator />
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => onDelete(treatment.id)}
                  >
                    <Trash2 className="mr-1 h-4 w-4" />이 기록 삭제
                  </Button>
                </>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-xs font-semibold text-muted-foreground">{title}</h3>
      <div className="mt-1.5">{children}</div>
    </section>
  )
}
