'use client'

import type { Side } from '@/features/treatments/domain/types'

const OPTIONS: { value: Side; label: string }[] = [
  { value: 'left', label: '좌측' },
  { value: 'right', label: '우측' },
  { value: 'both', label: '양측' },
]

type Props = {
  value: Side
  onChange: (value: Side) => void
}

export function ToggleSide({ value, onChange }: Props) {
  return (
    <div className="inline-flex rounded-md border bg-background p-0.5">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={
            value === opt.value
              ? 'rounded-sm bg-primary px-3 py-1 text-sm font-medium text-primary-foreground'
              : 'rounded-sm px-3 py-1 text-sm text-muted-foreground hover:text-foreground'
          }
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
