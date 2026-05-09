'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { PatientForm } from '@/features/patients/components/PatientForm'
import { createPatient } from '@/lib/supabase/patients'
import type { PatientFormValues } from '@/features/patients/domain/schema'

export default function NewPatientPage() {
  const router = useRouter()

  async function handleSubmit(values: PatientFormValues) {
    const result = await createPatient(values)
    if (result.success && result.data) {
      toast.success('환자 등록 완료', { description: result.data.name })
      router.push(`/patients/${result.data.id}`)
    } else {
      toast.error('환자 등록 실패', { description: result.error })
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-4 pb-8">
      <header className="flex items-center gap-2">
        <Link
          href="/"
          aria-label="뒤로"
          className="flex h-9 w-9 items-center justify-center rounded-md transition hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-semibold">환자 등록</h1>
      </header>

      <PatientForm
        submitLabel="등록"
        onSubmit={handleSubmit}
        onCancel={() => router.push('/')}
      />
    </div>
  )
}
