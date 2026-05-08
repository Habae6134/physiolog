'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { authStore } from '@/lib/storage'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [isVerified, setIsVerified] = useState(false)

  useEffect(() => {
    setMounted(true)
    // 하이드레이션 완료 후 체크
    const session = authStore.getSession()
    
    const isPublicPage = pathname === '/login' || pathname === '/signup'
    
    if (!session.isLoggedIn && !isPublicPage) {
      router.replace('/login')
    } else {
      setIsVerified(true)
    }
  }, [pathname, router])

  // 서버 렌더링 중이거나 하이드레이션 전에는 빈 화면 또는 최소한의 UI 출력
  if (!mounted) return null

  const isPublicPage = pathname === '/login' || pathname === '/signup'

  // 로딩 상태이거나 로그인하지 않은 경우 화면을 보여주지 않음 (깜빡임 방지)
  if (!isVerified && !isPublicPage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return <>{children}</>
}
