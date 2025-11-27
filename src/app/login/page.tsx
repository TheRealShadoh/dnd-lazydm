import LoginForm from '@/components/auth/LoginForm'
import { auth } from '@/lib/auth/auth-options'
import { redirect } from 'next/navigation'
import { Sword } from 'lucide-react'
import Link from 'next/link'

export default async function LoginPage() {
  const session = await auth()

  // Redirect to dashboard if already logged in
  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 blur-3xl rounded-full" />
      </div>

      <div className="w-full max-w-md">
        {/* Logo and title */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="relative">
              <Sword className="h-10 w-10 text-primary" />
              <div className="absolute inset-0 animate-glow-pulse opacity-40 blur-md">
                <Sword className="h-10 w-10 text-primary" />
              </div>
            </div>
            <span className="font-heading text-3xl font-bold text-primary">
              LazyDM
            </span>
          </Link>
          <p className="mt-3 text-muted-foreground font-ui">
            Campaign management for dungeon masters
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  )
}
