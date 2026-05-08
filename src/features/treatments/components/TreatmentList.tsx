'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Copy, FileText, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { TreatmentCard } from './TreatmentCard'
import { TreatmentDetailSheet } from './TreatmentDetailSheet'
import { treatmentStore } from '@/lib/storage'
import { formatDateShort } from '@/lib/utils/date'
import { BODY_REGION_LABEL } from '@/data/body-parts'
import type { Treatment } from '@/features/treatments/domain/types'

type Props = { patientId: string }

export function TreatmentList({ patientId }: Props) {
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [selected, setSelected] = useState<Treatment | null>(null)
  const [openCopyPopover, setOpenCopyPopover] = useState(false)

  const router = useRouter() // import useRouter from next/navigation 필요

  useEffect(() => {
    setTreatments(treatmentStore.getTreatments(patientId))
    setHydrated(true)
  }, [patientId])

  const hasAny = treatments.length > 0

  const handleDelete = (id: string) => {
    if (!confirm('이 치료를 삭제할까요?')) return
    treatmentStore.deleteTreatment(patientId, id)
    setTreatments(treatmentStore.getTreatments(patientId))
    setSelected(null)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {hydrated ? `총 ${treatments.length}건` : '불러오는 중…'}
        </p>
        <div className="flex gap-2">
          {hasAny && (
            <Popover open={openCopyPopover} onOpenChange={setOpenCopyPopover}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Copy className="mr-1 h-4 w-4" />이전 기록 복사
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[280px] p-0" align="end">
                <Command>
                  <CommandInput placeholder="날짜 검색..." />
                  <CommandList>
                    <CommandEmpty>기록이 없습니다.</CommandEmpty>
                    <CommandGroup heading="복사할 기록 선택">
                      {treatments.map((t) => (
                        <CommandItem
                          key={t.id}
                          value={t.date}
                          onSelect={() => {
                            router.push(
                              `/patients/${patientId}/treatments/new?copyFrom=${t.id}`,
                            )
                            setOpenCopyPopover(false)
                          }}
                        >
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-medium">
                              {formatDateShort(t.date)}
                            </span>
                            <span className="text-xs text-muted-foreground truncate">
                              {t.bodyParts?.map((p) => BODY_REGION_LABEL[p.region]).join(', ') || '부위 정보 없음'}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}
          <Button asChild size="sm"><Link href={`/patients/${patientId}/treatments/new`}><Plus className="mr-1 h-4 w-4" />작성</Link></Button>
        </div>
      </div>

      {hydrated && !hasAny && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed py-12">
          <FileText
            className="h-10 w-10 text-muted-foreground/40"
            strokeWidth={1.5}
          />
          <p className="text-sm text-muted-foreground">
            아직 작성된 치료가 없습니다.
          </p>
          <Button asChild size="sm"><Link href={`/patients/${patientId}/treatments/new`}><Plus className="mr-1 h-4 w-4" />첫 치료 작성</Link></Button>
        </div>
      )}

      {hasAny && (
        <div className="flex flex-col gap-2">
          {treatments.map((t) => (
            <TreatmentCard
              key={t.id}
              treatment={t}
              onClick={() => setSelected(t)}
            />
          ))}
        </div>
      )}

      <TreatmentDetailSheet
        treatment={selected}
        onOpenChange={(open) => !open && setSelected(null)}
        onDelete={handleDelete}
      />
    </div>
  )
}
