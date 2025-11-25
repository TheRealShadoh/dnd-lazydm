import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { auth } from '@/lib/auth/auth-options'
import { validateCampaignId, validateCharacterId } from '@/lib/utils/sanitize'
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

    // Apply rate limiting (strict for D&D Beyond API calls)
    const identifier = getClientIdentifier(request)
    if (!strictRateLimiter.check(identifier)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      )
    }

    const { campaignId } = await params
    const { characterId } = await request.json()

    // Validate and sanitize inputs
    const safeCampaignId = validateCampaignId(campaignId)
    const safeCharacterId = characterId ? validateCharacterId(characterId) : null

    // Load campaign metadata
    const campaignPath = path.join(process.cwd(), 'src', 'app', 'campaigns', safeCampaignId)
    const metadataPath = path.join(campaignPath, 'campaign.json')
    const metadata = await fs.readFile(metadataPath, 'utf-8')
    const campaign: CampaignMetadata = JSON.parse(metadata)

    if (!campaign.dndbeyond?.characters) {
      return NextResponse.json(
        { success: false, error: 'No characters found in campaign' },
        { status: 404 }
      )
    }

    // If characterId is provided, sync only that character
    // Otherwise, sync all characters
    const charactersToSync = safeCharacterId
      ? campaign.dndbeyond.characters.filter((c) => c.characterId === safeCharacterId)
      : campaign.dndbeyond.characters

    const syncResults = []

    // Get the authentication token from the request header
    const authToken = request.headers.get('X-DnDBeyond-Token')

    for (const char of charactersToSync) {
      try {
        // Forward the authentication token to the D&D Beyond API
        const headers: HeadersInit = {}
        if (authToken) {
          headers['X-DnDBeyond-Token'] = authToken
        }

        const characterResponse = await fetch(
          `${request.nextUrl.origin}/api/dndbeyond/character/${char.characterId}`,
          { headers }
        )

        if (characterResponse.ok) {
          const characterData = await characterResponse.json()

          // Find and update the character in the array
          const index = campaign.dndbeyond.characters.findIndex(
            (c) => c.characterId === char.characterId
          )

          if (index >= 0) {
            campaign.dndbeyond.characters[index] = {
              characterId: char.characterId,
              name: characterData.character.name,
              cachedData: characterData.character,
              lastSync: characterData.fetchedAt,
            }
            syncResults.push({ characterId: char.characterId, success: true })
          }
        } else {
          syncResults.push({
            characterId: char.characterId,
            success: false,
            error: 'Failed to fetch character data',
          })
        }
      } catch (error) {
        syncResults.push({
          characterId: char.characterId,
          success: false,
          error: (error as Error).message,
        })
      }
    }

    // Save updated metadata
    await fs.writeFile(metadataPath, JSON.stringify(campaign, null, 2))

    return NextResponse.json({
      success: true,
      syncResults,
      characters: campaign.dndbeyond.characters,
    })
  } catch (error) {
    console.error('Error syncing characters:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to sync characters', details: (error as Error).message },
      { status: 500 }
    )
  }
}
