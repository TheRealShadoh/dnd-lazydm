import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const { campaignId } = await params
    const campaignPath = path.join(process.cwd(), 'src', 'app', 'campaigns', campaignId)
    const metadataPath = path.join(campaignPath, 'campaign.json')

    const metadata = await fs.readFile(metadataPath, 'utf-8')
    const campaign: CampaignMetadata = JSON.parse(metadata)

    return NextResponse.json({
      characters: campaign.dndbeyond?.characters || [],
      campaignUrl: campaign.dndbeyond?.campaignUrl || '',
    })
  } catch (error) {
    console.error('Error loading campaign characters:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load campaign characters' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const { campaignId } = await params
    const { characterId, campaignUrl } = await request.json()

    if (!characterId) {
      return NextResponse.json(
        { success: false, error: 'Character ID is required' },
        { status: 400 }
      )
    }

    // Fetch character data from D&D Beyond
    // Forward the authentication token from the request header
    const authToken = request.headers.get('X-DnDBeyond-Token')
    const headers: HeadersInit = {}
    if (authToken) {
      headers['X-DnDBeyond-Token'] = authToken
    }

    const characterResponse = await fetch(
      `${request.nextUrl.origin}/api/dndbeyond/character/${characterId}`,
      { headers }
    )

    if (!characterResponse.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch character from D&D Beyond' },
        { status: 400 }
      )
    }

    const characterData = await characterResponse.json()

    // Load campaign metadata
    const campaignPath = path.join(process.cwd(), 'src', 'app', 'campaigns', campaignId)
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
      name: characterData.character.name,
      cachedData: characterData.character,
      lastSync: characterData.fetchedAt,
    }

    if (existingIndex >= 0) {
      // Update existing character
      campaign.dndbeyond.characters[existingIndex] = newCharacter
    } else {
      // Add new character
      campaign.dndbeyond.characters.push(newCharacter)
    }

    // Update campaign URL if provided
    if (campaignUrl) {
      campaign.dndbeyond.campaignUrl = campaignUrl
    }

    // Save updated metadata
    await fs.writeFile(metadataPath, JSON.stringify(campaign, null, 2))

    return NextResponse.json({
      success: true,
      character: newCharacter,
    })
  } catch (error) {
    console.error('Error adding character to campaign:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add character', details: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const { campaignId } = await params
    const { searchParams } = new URL(request.url)
    const characterId = searchParams.get('characterId')

    if (!characterId) {
      return NextResponse.json(
        { success: false, error: 'Character ID is required' },
        { status: 400 }
      )
    }

    // Load campaign metadata
    const campaignPath = path.join(process.cwd(), 'src', 'app', 'campaigns', campaignId)
    const metadataPath = path.join(campaignPath, 'campaign.json')
    const metadata = await fs.readFile(metadataPath, 'utf-8')
    const campaign: CampaignMetadata = JSON.parse(metadata)

    if (!campaign.dndbeyond) {
      return NextResponse.json(
        { success: false, error: 'No D&D Beyond integration found' },
        { status: 404 }
      )
    }

    // Remove character
    campaign.dndbeyond.characters = campaign.dndbeyond.characters.filter(
      (c) => c.characterId !== characterId
    )

    // Save updated metadata
    await fs.writeFile(metadataPath, JSON.stringify(campaign, null, 2))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing character from campaign:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to remove character' },
      { status: 500 }
    )
  }
}
