'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

/**
 * Admin page - Redirects to the unified dashboard
 * The unified dashboard at /dashboard now combines both player and admin views
 */
export default function AdminRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/dashboard')
  }, [router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground font-ui">Redirecting to dashboard...</p>
      </div>
    </div>
  )
}
