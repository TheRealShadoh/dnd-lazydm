import type { Metadata } from 'next'
import './globals.css'
import { DiceWidget } from '@/components/dice/DiceWidget'
import { RollToast } from '@/components/dice/RollToast'
import { ToastProvider } from '@/hooks/useToast'
import { ConfirmProvider } from '@/hooks/useConfirm'

export const metadata: Metadata = {
  title: 'DM Campaign Manager',
  description: 'Multi-Campaign D&D Adventure Hub',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen">
        <ToastProvider>
          <ConfirmProvider>
            {children}
            <DiceWidget />
            <RollToast />
          </ConfirmProvider>
        </ToastProvider>
      </body>
    </html>
  )
}
