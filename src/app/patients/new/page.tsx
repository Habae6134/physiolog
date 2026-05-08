'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { PatientForm } from '@/features/patients/components/PatientForm'
import { patientStore } from '@/lib/storage'
import type { PatientFormValues } from '@/features/patients/domain/schema'

export default function NewPatientPage() {
  const router = useRouter()

  function handleSubmit(values: PatientFormValues) {
    const patient = patientStore.createPatient(values)
    toast.success('환자 등록 완료', { description: patient.name })
    router.push(`/patients/${patient.id}`)
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
