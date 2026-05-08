'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authStore } from '@/lib/storage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lock, ShieldCheck, Activity, User } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (authStore.getSession().isLoggedIn) {
      router.replace('/')
    }
  }, [router])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    setTimeout(() => {
      const success = authStore.login(username, password)
      if (success) {
        toast.success(`${username}님, 환영합니다.`)
        router.replace('/')
      } else {
        toast.error('아이디 또는 비밀번호가 올바르지 않습니다.')
        setIsLoading(false)
      }
    }, 800)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-background to-background">
      <div className="w-full max-w-[400px] space-y-8">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-2xl shadow-primary/20 animate-in fade-in zoom-in duration-500">
            <Activity className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mt-6">physiolog</h1>
          <p className="text-sm text-muted-foreground flex flex-col items-center gap-1 mt-2">
            <span className="flex items-center gap-1.5 font-medium text-primary">
              <ShieldCheck className="w-4 h-4" />
              질병을 넘어, 삶의 기능을 분석합니다
            </span>
            <span className="text-[11px] opacity-70">WHO ICF 기반의 전문적이고 효율적인 평가 솔루션</span>
          </p>
        </div>

        <div className="rounded-3xl border bg-card/50 backdrop-blur-xl p-8 shadow-2xl shadow-indigo-500/5 animate-in slide-in-from-bottom-8 duration-700">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username">아이디</Label>
              <div className="relative group">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="username"
                  placeholder="아이디를 입력하세요"
                  className="pl-10 h-11 bg-background/50 border-muted focus:ring-primary/20"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="password"
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  className="pl-10 h-11 bg-background/50 border-muted focus:ring-primary/20"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-[0.98]" 
              disabled={isLoading}
            >
              {isLoading ? '보안 연결 중...' : '시스템 접속'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              계정이 없으신가요?{' '}
              <Link href="/signup" className="font-semibold text-primary hover:underline underline-offset-4">
                회원가입
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          © 2026 physiolog Security. All rights reserved.
        </p>
      </div>
    </div>
  )
}
