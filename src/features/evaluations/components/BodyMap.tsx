'use client'

import React, { useState } from 'react'
import './BodyMap.css'
import type { PainPattern, PainArea } from '../domain/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

const BODY_PARTS = [
  // 앞면 주요 부위
  { id: 'head', label: '머리', side: 'front', d: 'M50,10 Q50,5 55,5 Q60,5 60,10 Q60,15 55,20 Q50,25 45,20 Q40,15 40,10 Q40,5 45,5 Q50,5 50,10' },
  { id: 'neck', label: '목', side: 'front', d: 'M45,22 L55,22 L55,28 L45,28 Z' },
  { id: 'shoulder_l', label: '왼쪽 어깨', side: 'front', d: 'M55,25 Q70,25 75,35 L65,40 Q60,30 55,28 Z' },
  { id: 'shoulder_r', label: '오른쪽 어깨', side: 'front', d: 'M45,25 Q30,25 25,35 L35,40 Q40,30 45,28 Z' },
  { id: 'chest', label: '가슴', side: 'front', d: 'M40,30 L60,30 L60,50 L40,50 Z' },
  { id: 'abdomen', label: '복부', side: 'front', d: 'M40,50 L60,50 L60,70 L40,70 Z' },
  { id: 'arm_up_l', label: '왼쪽 상완', side: 'front', d: 'M75,35 L85,55 L75,60 L65,40 Z' },
  { id: 'arm_up_r', label: '오른쪽 상완', side: 'front', d: 'M25,35 L15,55 L25,60 L35,40 Z' },
  { id: 'elbow_l', label: '왼쪽 팔꿈치', side: 'front', d: 'M85,55 L82,65 L72,68 L75,60 Z' },
  { id: 'elbow_r', label: '오른쪽 팔꿈치', side: 'front', d: 'M15,55 L18,65 L28,68 L25,60 Z' },
  { id: 'arm_low_l', label: '왼쪽 하완', side: 'front', d: 'M82,65 L90,85 L80,90 L72,68 Z' },
  { id: 'arm_low_r', label: '오른쪽 하완', side: 'front', d: 'M18,65 L10,85 L20,90 L28,68 Z' },
  { id: 'hip_l', label: '왼쪽 고관절', side: 'front', d: 'M50,70 L65,70 L70,85 L55,85 Z' },
  { id: 'hip_r', label: '오른쪽 고관절', side: 'front', d: 'M50,70 L35,70 L30,85 L45,85 Z' },
  { id: 'thigh_l', label: '왼쪽 허벅지', side: 'front', d: 'M55,85 L70,85 L75,120 L58,120 Z' },
  { id: 'thigh_r', label: '오른쪽 허벅지', side: 'front', d: 'M45,85 L30,85 L25,120 L42,120 Z' },
  { id: 'knee_l', label: '왼쪽 무릎', side: 'front', d: 'M58,120 L75,120 L73,135 L60,135 Z' },
  { id: 'knee_r', label: '오른쪽 무릎', side: 'front', d: 'M42,120 L25,120 L27,135 L40,135 Z' },
  { id: 'calf_l', label: '왼쪽 종아리', side: 'front', d: 'M60,135 L73,135 L78,170 L65,170 Z' },
  { id: 'calf_r', label: '오른쪽 종아리', side: 'front', d: 'M40,135 L27,135 L22,170 L35,170 Z' },
  { id: 'ankle_l', label: '왼쪽 발목', side: 'front', d: 'M65,170 L78,170 L75,185 L68,185 Z' },
  { id: 'ankle_r', label: '오른쪽 발목', side: 'front', d: 'M35,170 L22,170 L25,185 L32,185 Z' },
  
  // 뒷면 주요 부위
  { id: 'back_up', label: '상부 등', side: 'back', d: 'M40,30 L60,30 L62,50 L38,50 Z' },
  { id: 'back_low', label: '하부 등/허리', side: 'back', d: 'M38,50 L62,50 L60,75 L40,75 Z' },
  { id: 'glute_l', label: '왼쪽 엉덩이', side: 'back', d: 'M50,75 L65,75 L70,95 L55,95 Z' },
  { id: 'glute_r', label: '오른쪽 엉덩이', side: 'back', d: 'M50,75 L35,75 L30,95 L45,95 Z' },
]

type Props = {
  value: PainArea[]
  onChange: (value: PainArea[]) => void
}

export function BodyMap({ value, onChange }: Props) {
  const [selectedPart, setSelectedPart] = useState<typeof BODY_PARTS[0] | null>(null)
  const [view, setView] = useState<'front' | 'back'>('front')

  const handlePartClick = (part: typeof BODY_PARTS[0]) => {
    setSelectedPart(part)
  }

  const addOrUpdatePain = (pattern: PainPattern, intensity: number) => {
    if (!selectedPart) return
    const existing = value.find((p) => p.id === selectedPart.id)
    if (existing) {
      onChange(value.map((p) => p.id === selectedPart.id ? { ...p, pattern, intensity } : p))
    } else {
      onChange([...value, { id: selectedPart.id, label: selectedPart.label, pattern, intensity }])
    }
    setSelectedPart(null)
  }

  const removePain = (id: string) => {
    onChange(value.filter((p) => p.id !== id))
    setSelectedPart(null)
  }

  const getPainClass = (partId: string) => {
    const pain = value.find((p) => p.id === partId)
    if (!pain) return ''
    return `pain-${pain.pattern}`
  }

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="flex gap-2 mb-2">
        <Button 
          type="button" 
          variant={view === 'front' ? 'default' : 'outline'} 
          size="sm" 
          onClick={() => setView('front')}
        >
          앞면
        </Button>
        <Button 
          type="button" 
          variant={view === 'back' ? 'default' : 'outline'} 
          size="sm" 
          onClick={() => setView('back')}
        >
          뒷면
        </Button>
      </div>

      <div className="relative w-full max-w-[300px] aspect-[1/2] bg-muted/20 rounded-xl overflow-hidden border p-4 shadow-inner">
        <svg viewBox="0 0 100 200" className="w-full h-full drop-shadow-md">
          {/* 가이드 라인 생략 - 심플한 인체 형상 */}
          {BODY_PARTS.filter(p => p.side === view).map((part) => (
            <path
              key={part.id}
              d={part.d}
              className={`body-part fill-white stroke-muted-foreground/30 ${getPainClass(part.id)} ${selectedPart?.id === part.id ? 'selected' : ''}`}
              onClick={() => handlePartClick(part)}
            />
          ))}
        </svg>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {value.map(p => (
          <div key={p.id} className="flex items-center gap-1 bg-secondary px-2 py-1 rounded text-xs">
            <span className="font-semibold">{p.label}</span>: {patternLabel(p.pattern)} (I:{p.intensity})
            <button type="button" onClick={() => removePain(p.id)} className="ml-1 text-muted-foreground hover:text-destructive">×</button>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedPart} onOpenChange={(open) => !open && setSelectedPart(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{selectedPart?.label} 통증 설정</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label>통증 양상 선택</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => addOrUpdatePain('referred', 5)} className="hover:bg-red-50 border-red-200">🔴 연관통</Button>
                <Button variant="outline" onClick={() => addOrUpdatePain('tingling', 5)} className="hover:bg-blue-50 border-blue-200">🔵 저림</Button>
                <Button variant="outline" onClick={() => addOrUpdatePain('weakness', 5)} className="hover:bg-gray-100">⚪ 힘빠짐</Button>
                <Button variant="outline" onClick={() => addOrUpdatePain('paresthesia', 5)} className="hover:bg-purple-50 border-purple-200">🟣 이상감각</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function patternLabel(p: PainPattern) {
  switch (p) {
    case 'referred': return '연관통'
    case 'tingling': return '저림'
    case 'weakness': return '힘빠짐'
    case 'paresthesia': return '이상감각'
  }
}
