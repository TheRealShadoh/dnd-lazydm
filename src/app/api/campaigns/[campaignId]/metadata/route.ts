import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const { campaignId } = await params
    const metadataPath = path.join(
      process.cwd(),
      'src',
      'app',
      'campaigns',
      campaignId,
      'campaign.json'
    )

    try {
      const metadata = await fs.readFile(metadataPath, 'utf-8')
      return NextResponse.json(JSON.parse(metadata))
    } catch {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Error loading campaign metadata:', error)
    return NextResponse.json(
      { error: 'Failed to load campaign metadata', details: (error as Error).message },
      { status: 500 }
    )
  }
}
