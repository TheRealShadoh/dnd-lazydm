'use client'

import { SRDLookupProvider } from '@/components/srd'

export default function CampaignsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SRDLookupProvider>
      {children}
    </SRDLookupProvider>
  )
}
