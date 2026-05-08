'use client'

import { useEffect, useState } from 'react'
import { Settings, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { getApiKey, setApiKey, clearApiKey, maskApiKey } from '@/lib/storage/api-settings'

export function ApiKeyDialog() {
  const [open, setOpen] = useState(false)
  const [currentKey, setCurrentKey] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [showInput, setShowInput] = useState(false)

  useEffect(() => {
    if (open) {
      setCurrentKey(getApiKey())
      setInputValue('')
      setShowInput(false)
    }
  }, [open])

  function handleSave() {
    if (!inputValue.trim()) return
    if (!inputValue.trim().startsWith('sk-ant-')) {
      toast.error('올바른 Anthropic API 키 형식이 아닙니다. (sk-ant-로 시작)')
      return
    }
    setApiKey(inputValue.trim())
    setCurrentKey(inputValue.trim())
    setInputValue('')
    toast.success('API 키가 저장되었습니다.')
  }

  function handleClear() {
    clearApiKey()
    setCurrentKey(null)
    setInputValue('')
    toast.success('API 키가 삭제되었습니다.')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="API 키 설정" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Anthropic API 키 설정</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* 현재 상태 */}
          <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
            currentKey ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
          }`}>
            {currentKey ? (
              <>
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>저장됨: <code className="font-mono text-xs">{maskApiKey(currentKey)}</code></span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>키가 설정되지 않았습니다. AI 평가 기능을 사용하려면 입력해주세요.</span>
              </>
            )}
          </div>

          {/* 입력 */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-muted-foreground">
              새 API 키 입력 (<a href="https://console.anthropic.com" target="_blank" rel="noreferrer" className="underline">console.anthropic.com</a>)
            </label>
            <div className="relative">
              <Input
                type={showInput ? 'text' : 'password'}
                placeholder="sk-ant-api03-..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                className="pr-10 font-mono text-sm"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowInput(!showInput)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showInput ? '숨기기' : '보기'}
              >
                {showInput ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* 보안 안내 */}
          <p className="text-xs text-muted-foreground">
            키는 이 기기의 브라우저에만 저장됩니다. 서버로 전송 시 HTTPS 헤더로만 전달되며, 로그에 기록되지 않습니다.
          </p>

          {/* 버튼 */}
          <div className="flex gap-2">
            {currentKey && (
              <Button variant="outline" size="sm" onClick={handleClear} className="text-destructive hover:text-destructive">
                키 삭제
              </Button>
            )}
            <Button onClick={handleSave} disabled={!inputValue.trim()} className="flex-1">
              저장
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
