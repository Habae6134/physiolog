'use client'

import { useState } from 'react'
import { Check, ChevronsUpDown, Plus, X } from 'lucide-react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type Props = {
  /** 부위에 정의된 표준 근육 리스트 */
  options: string[]
  /** 현재 선택된 근육들 (옵션 목록 외 직접 추가도 가능) */
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
}

export function MuscleCombobox({
  options,
  value,
  onChange,
  placeholder = '근육 검색·선택',
}: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const toggle = (name: string) => {
    if (value.includes(name)) {
      onChange(value.filter((v) => v !== name))
    } else {
      onChange([...value, name])
    }
  }

  const remove = (name: string) => {
    onChange(value.filter((v) => v !== name))
  }

  const addCustom = () => {
    const trimmed = query.trim()
    if (!trimmed) return
    if (!value.includes(trimmed)) {
      onChange([...value, trimmed])
    }
    setQuery('')
  }

  const queryTrimmed = query.trim()
  const showAddCustom =
    queryTrimmed.length > 0 &&
    !options.some((o) => o.toLowerCase() === queryTrimmed.toLowerCase()) &&
    !value.some((v) => v.toLowerCase() === queryTrimmed.toLowerCase())

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between"
          >
            <span className="text-muted-foreground">
              {value.length === 0 ? placeholder : `근육 ${value.length}개 선택됨`}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command shouldFilter>
            <CommandInput
              placeholder="근육 이름 검색·입력"
              value={query}
              onValueChange={setQuery}
            />
            <CommandList>
              <CommandEmpty>
                {showAddCustom ? (
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
                    onClick={addCustom}
                  >
                    <Plus className="h-4 w-4" />
                    <span>
                      &ldquo;<span className="font-medium">{queryTrimmed}</span>&rdquo; 직접 추가
                    </span>
                  </button>
                ) : (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    검색 결과 없음
                  </p>
                )}
              </CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const selected = value.includes(option)
                  return (
                    <CommandItem
                      key={option}
                      value={option}
                      onSelect={() => toggle(option)}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          selected ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      <span className="flex-1 truncate">{option}</span>
                    </CommandItem>
                  )
                })}
                {showAddCustom && (
                  <CommandItem
                    key="__add_custom__"
                    value={`add-${queryTrimmed}`}
                    onSelect={addCustom}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    <span>
                      &ldquo;{queryTrimmed}&rdquo; 직접 추가
                    </span>
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((m) => (
            <Badge
              key={m}
              variant="secondary"
              className="gap-1 pr-1"
            >
              <span className="max-w-[180px] truncate">{m}</span>
              <button
                type="button"
                aria-label={`${m} 제거`}
                onClick={() => remove(m)}
                className="rounded-full hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
