'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { exerciseHistoryStore } from '@/lib/storage'
import type { ExerciseConcept } from '@/features/treatments/domain/types'

type Props = {
  concept: ExerciseConcept
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function ExerciseNameInput({ concept, value, onChange, placeholder, className }: Props) {
  const [open, setOpen] = useState(false)
  const [history, setHistory] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setHistory(exerciseHistoryStore.getNames(concept))
  }, [concept])

  const filtered = history.filter((n) =>
    value.trim() === '' || n.toLowerCase().includes(value.toLowerCase())
  )

  const handleSelect = (name: string) => {
    onChange(name)
    setOpen(false)
    inputRef.current?.blur()
  }

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const showDropdown = open && filtered.length > 0

  return (
    <div className="relative flex-1">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setOpen(true)}
          className={cn(
            'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pr-8 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
            className,
          )}
        />
        {history.length > 0 && (
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault()
              setOpen((v) => !v)
              inputRef.current?.focus()
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />
          </button>
        )}
      </div>

      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute left-0 top-full z-50 mt-1 max-h-52 w-full overflow-y-auto rounded-md border bg-popover shadow-md"
        >
          {filtered.map((name) => (
            <button
              key={name}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                handleSelect(name)
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
            >
              {value === name && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
              <span className={cn('flex-1', value === name ? 'font-medium' : '')}>{name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
