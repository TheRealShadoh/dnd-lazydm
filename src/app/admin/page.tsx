'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

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
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500 mx-auto mb-4"></div>
        <p className="text-gray-400">Redirecting to dashboard...</p>
      </div>
    </div>
  )
}
