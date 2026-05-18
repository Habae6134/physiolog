'use client'

import { useMemo } from 'react'

interface Props {
  value?: string       // YYYY-MM-DD
  onChange: (value: string) => void
  minYear?: number
  maxYear?: number
  placeholder?: boolean
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

export function DateSelect({
  value = '',
  onChange,
  minYear = 1930,
  maxYear = new Date().getFullYear() + 1,
  placeholder = true,
}: Props) {
  const [y, m, d] = value ? value.split('-') : ['', '', '']
  const year  = y ? parseInt(y, 10) : 0
  const month = m ? parseInt(m, 10) : 0
  const day   = d ? parseInt(d, 10) : 0

  const years  = useMemo(() => Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i), [minYear, maxYear])
  const months = Array.from({ length: 12 }, (_, i) => i + 1)
  const maxDay = year && month ? daysInMonth(year, month) : 31
  const days   = Array.from({ length: maxDay }, (_, i) => i + 1)

  function emit(nextYear: number, nextMonth: number, nextDay: number) {
    if (!nextYear || !nextMonth || !nextDay) {
      // 일부만 선택된 상태 — 빈 문자열로 유지
      onChange('')
      return
    }
    const clamped = Math.min(nextDay, daysInMonth(nextYear, nextMonth))
    onChange(
      `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(clamped).padStart(2, '0')}`
    )
  }

  const selectClass =
    'h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1'

  return (
    <div className="flex gap-1.5">
      <select
        value={year || ''}
        onChange={(e) => emit(parseInt(e.target.value) || 0, month, day)}
        className={`${selectClass} flex-[3]`}
        aria-label="년도"
      >
        {placeholder && <option value="">년도</option>}
        {years.map((y) => (
          <option key={y} value={y}>{y}년</option>
        ))}
      </select>

      <select
        value={month || ''}
        onChange={(e) => emit(year, parseInt(e.target.value) || 0, day)}
        className={`${selectClass} flex-[2]`}
        aria-label="월"
      >
        {placeholder && <option value="">월</option>}
        {months.map((m) => (
          <option key={m} value={m}>{m}월</option>
        ))}
      </select>

      <select
        value={day || ''}
        onChange={(e) => emit(year, month, parseInt(e.target.value) || 0)}
        className={`${selectClass} flex-[2]`}
        aria-label="일"
      >
        {placeholder && <option value="">일</option>}
        {days.map((d) => (
          <option key={d} value={d}>{d}일</option>
        ))}
      </select>
    </div>
  )
}
