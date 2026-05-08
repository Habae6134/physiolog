'use client'

import { use } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { IcfAssessmentForm } from '@/features/icf/components/IcfAssessmentForm'

type PageProps = { params: Promise<{ id: string }> }

export default function IcfNewPage({ params }: PageProps) {
  const { id } = use(params)

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-4 pb-8">
      <header className="flex items-center gap-2">
        <Link
          href={`/patients/${id}?tab=icf`}
          aria-label="뒤로"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-lg font-semibold">평가지</h1>
          <p className="text-xs text-muted-foreground">임상 추론 보조</p>
        </div>
      </header>

      <IcfAssessmentForm patientId={id} />
    </div>
  )
}
