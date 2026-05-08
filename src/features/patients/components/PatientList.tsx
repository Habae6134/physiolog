'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Users } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ApiKeyDialog } from '@/components/ApiKeyDialog'
import { PatientCard } from './PatientCard'
import { patientStore, treatmentStore } from '@/lib/storage'
import type { Patient } from '@/features/patients/domain/types'

export function PatientList() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [query, setQuery] = useState('')
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setPatients(patientStore.getAllPatients())
    setHydrated(true)
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return patients
    return patients.filter((p) => p.name.toLowerCase().includes(q))
  }, [patients, query])

  const lastTreatmentByPatient = useMemo(() => {
    const map: Record<string, string | undefined> = {}
    if (!hydrated) return map
    for (const p of patients) {
      map[p.id] = treatmentStore.getLatestTreatment(p.id)?.date
    }
    return map
  }, [patients, hydrated])

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-4 pb-24">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">환자</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">총 {patients.length}명</span>
          <ApiKeyDialog />
        </div>
      </header>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="이름으로 검색"
          className="pl-9"
        />
      </div>

      {!hydrated ? (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          불러오는 중…
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState hasPatients={patients.length > 0} />
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((p) => (
            <PatientCard
              key={p.id}
              patient={p}
              lastTreatmentDate={lastTreatmentByPatient[p.id]}
            />
          ))}
        </div>
      )}

      {/* FAB */}
      <Link
        href="/patients/new"
        aria-label="환자 등록"
        className="fixed bottom-6 right-6 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition hover:scale-105 hover:shadow-xl"
      >
        <Plus className="h-6 w-6" strokeWidth={2.5} />
      </Link>
    </div>
  )
}

function EmptyState({ hasPatients }: { hasPatients: boolean }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
      <Users className="h-12 w-12 text-muted-foreground/40" strokeWidth={1.5} />
      {hasPatients ? (
        <p className="text-sm text-muted-foreground">검색 결과가 없습니다.</p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            등록된 환자가 아직 없습니다.
          </p>
          <Button asChild>
            <Link href="/patients/new">
              <Plus className="mr-1 h-4 w-4" />첫 환자 등록
            </Link>
          </Button>
        </>
      )}
    </div>
  )
}
