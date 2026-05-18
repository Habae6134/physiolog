'use client'

import { useState, useEffect, useMemo } from 'react'

interface Props {
  value?: string       // YYYY-MM-DD
  onChange: (value: string) => void
  minYear?: number
  maxYear?: number
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

function parse(value: string) {
  const [y, m, d] = value ? value.split('-') : ['', '', '']
  return {
    year:  y ? parseInt(y, 10) : 0,
    month: m ? parseInt(m, 10) : 0,
    day:   d ? parseInt(d, 10) : 0,
  }
}

export function DateSelect({
  value = '',
  onChange,
  minYear = 1930,
  maxYear = new Date().getFullYear(),
}: Props) {
  const parsed = parse(value)
  const [year,  setYear]  = useState(parsed.year)
  const [month, setMonth] = useState(parsed.month)
  const [day,   setDay]   = useState(parsed.day)

  // 외부 value가 바뀔 때(초기 로드, 폼 리셋 등) 동기화
  useEffect(() => {
    const p = parse(value)
    setYear(p.year)
    setMonth(p.month)
    setDay(p.day)
  }, [value])

  const years  = useMemo(() => Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i), [minYear, maxYear])
  const months = Array.from({ length: 12 }, (_, i) => i + 1)
  const maxDay = year && month ? daysInMonth(year, month) : 31
  const days   = Array.from({ length: maxDay }, (_, i) => i + 1)

  function emit(y: number, m: number, d: number) {
    if (y && m && d) {
      const clamped = Math.min(d, daysInMonth(y, m))
      onChange(`${y}-${String(m).padStart(2, '0')}-${String(clamped).padStart(2, '0')}`)
    } else {
      onChange('')
    }
  }

  const cls = 'h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1'

  return (
    <div className="flex gap-1.5">
      <select
        value={year || ''}
        onChange={(e) => {
          const y = parseInt(e.target.value) || 0
          setYear(y)
          emit(y, month, day)
        }}
        className={`${cls} flex-[3]`}
        aria-label="년도"
      >
        <option value="">년도</option>
        {years.map((y) => <option key={y} value={y}>{y}년</option>)}
      </select>

      <select
        value={month || ''}
        onChange={(e) => {
          const m = parseInt(e.target.value) || 0
          setMonth(m)
          emit(year, m, day)
        }}
        className={`${cls} flex-[2]`}
        aria-label="월"
      >
        <option value="">월</option>
        {months.map((m) => <option key={m} value={m}>{m}월</option>)}
      </select>

      <select
        value={day || ''}
        onChange={(e) => {
          const d = parseInt(e.target.value) || 0
          setDay(d)
          emit(year, month, d)
        }}
        className={`${cls} flex-[2]`}
        aria-label="일"
      >
        <option value="">일</option>
        {days.map((d) => <option key={d} value={d}>{d}일</option>)}
      </select>
    </div>
  )
}
