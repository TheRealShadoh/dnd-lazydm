import type { Metadata } from 'next'
import {
  Cinzel,
  Cinzel_Decorative,
  Crimson_Text,
  Alegreya_Sans,
  Fira_Code,
} from 'next/font/google'
import './globals.css'
import { DiceWidget } from '@/components/dice/DiceWidget'
import { RollToast } from '@/components/dice/RollToast'
import { ToastProvider } from '@/hooks/useToast'
import { ConfirmProvider } from '@/hooks/useConfirm'
import SessionProvider from '@/components/auth/SessionProvider'
import { CampaignThemeProvider } from '@/lib/theme'

// Fantasy Typography - Google Fonts
const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  display: 'swap',
})

const cinzelDecorative = Cinzel_Decorative({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-cinzel-decorative',
  display: 'swap',
})

const crimsonText = Crimson_Text({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-crimson',
  display: 'swap',
})

const alegreyaSans = Alegreya_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-alegreya-sans',
  display: 'swap',
})

const firaCode = Fira_Code({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-fira-code',
  display: 'swap',
})

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
    <html
      lang="en"
      className={`dark ${cinzel.variable} ${cinzelDecorative.variable} ${crimsonText.variable} ${alegreyaSans.variable} ${firaCode.variable}`}
    >
      <body className="min-h-screen font-ui antialiased">
        <SessionProvider>
          <CampaignThemeProvider>
            <ToastProvider>
              <ConfirmProvider>
                {children}
                <DiceWidget />
                <RollToast />
              </ConfirmProvider>
            </ToastProvider>
          </CampaignThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
