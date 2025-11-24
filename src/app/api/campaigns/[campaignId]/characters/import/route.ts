import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { auth } from '@/lib/auth/auth-options'
import { validateCampaignId } from '@/lib/utils/sanitize'
import { strictRateLimiter } from '@/lib/security/rate-limit'
import { getClientIdentifier } from '@/lib/security/client-identifier'

interface DnDBeyondCharacter {
  characterId: string
  name: string
  cachedData?: any
  lastSync?: string
}

interface CampaignMetadata {
  name: string
  slug: string
  description: string
  level?: string
  players?: string
  duration?: string
  genre?: string
  thumbnail?: string
  theme?: {
    primary: string
    secondary: string
  }
  dndbeyond?: {
    campaignUrl?: string
    characters: DnDBeyondCharacter[]
  }
  createdAt: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    // Check authentication
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Apply rate limiting
    const identifier = getClientIdentifier(request)
    if (!strictRateLimiter.check(identifier)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      )
    }

    const { campaignId } = await params
    const { characterId, characterData, fetchedAt } = await request.json()

    // Validate and sanitize campaign ID
    const safeCampaignId = validateCampaignId(campaignId)

    if (!characterId || !characterData) {
      return NextResponse.json(
        { success: false, error: 'Character ID and data are required' },
        { status: 400 }
      )
    }

    // Load campaign metadata
    const campaignPath = path.join(process.cwd(), 'src', 'app', 'campaigns', safeCampaignId)
    const metadataPath = path.join(campaignPath, 'campaign.json')
    const metadata = await fs.readFile(metadataPath, 'utf-8')
    const campaign: CampaignMetadata = JSON.parse(metadata)

    // Initialize dndbeyond object if it doesn't exist
    if (!campaign.dndbeyond) {
      campaign.dndbeyond = { characters: [] }
    }

    // Check if character already exists
    const existingIndex = campaign.dndbeyond.characters.findIndex(
      (c) => c.characterId === characterId
    )

    const newCharacter: DnDBeyondCharacter = {
      characterId,
      name: characterData.name,
      cachedData: characterData,
      lastSync: fetchedAt || new Date().toISOString(),
    }

    if (existingIndex >= 0) {
      // Update existing character
      campaign.dndbeyond.characters[existingIndex] = newCharacter
    } else {
      // Add new character
      campaign.dndbeyond.characters.push(newCharacter)
    }

    // Save updated metadata
    await fs.writeFile(metadataPath, JSON.stringify(campaign, null, 2))

    return NextResponse.json({
      success: true,
      character: newCharacter,
      message: `Character "${characterData.name}" imported successfully`,
    })
  } catch (error) {
    console.error('Error importing character:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to import character',
        details: (error as Error).message
      },
      { status: 500 }
    )
  }
}
