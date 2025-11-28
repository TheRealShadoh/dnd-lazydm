import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth-options'
import { promises as fs } from 'fs'
import path from 'path'
import { PlayerLanguageProfile } from '@/types/messaging'

// Get path to player languages file
function getPlayerLanguagesPath(campaignId: string): string {
  return path.join(process.cwd(), 'data', 'campaigns', campaignId, 'player-languages.json')
}

// Ensure data directory exists
async function ensureDataDir(campaignId: string): Promise<void> {
  const dir = path.join(process.cwd(), 'data', 'campaigns', campaignId)
  try {
    await fs.mkdir(dir, { recursive: true })
  } catch {
    // Directory may already exist
  }
}

// Load player languages
async function loadPlayerLanguages(campaignId: string): Promise<PlayerLanguageProfile[]> {
  try {
    const content = await fs.readFile(getPlayerLanguagesPath(campaignId), 'utf-8')
    return JSON.parse(content)
  } catch {
    return []
  }
}

// Save player languages
async function savePlayerLanguages(
  campaignId: string,
  profiles: PlayerLanguageProfile[]
): Promise<void> {
  await ensureDataDir(campaignId)
  await fs.writeFile(getPlayerLanguagesPath(campaignId), JSON.stringify(profiles, null, 2))
}

// Check if user is DM for campaign
async function isDMForCampaign(campaignId: string, userId: string): Promise<boolean> {
  try {
    const metadataPath = path.join(
      process.cwd(),
      'src',
      'app',
      'campaigns',
      campaignId,
      'campaign.json'
    )
    const content = await fs.readFile(metadataPath, 'utf-8')
    const campaign = JSON.parse(content)
    return (
      campaign.access?.ownerId === userId ||
      campaign.access?.dmIds?.includes(userId)
    )
  } catch {
    return false
  }
}

// GET - Get player languages for campaign
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { campaignId } = await params
    const profiles = await loadPlayerLanguages(campaignId)

    return NextResponse.json({
      profiles,
    })
  } catch (error) {
    console.error('Error loading player languages:', error)
    return NextResponse.json(
      { error: 'Failed to load player languages' },
      { status: 500 }
    )
  }
}

// POST - Set languages for a player (DM or self)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { campaignId } = await params
    const body = await request.json()
    const { playerId, playerName, languages } = body

    if (!playerId || !languages || !Array.isArray(languages)) {
      return NextResponse.json(
        { error: 'Missing required fields: playerId, languages (array)' },
        { status: 400 }
      )
    }

    // Check permissions - DM can edit anyone, players can only edit themselves
    const isDM = await isDMForCampaign(campaignId, session.user.id)
    const isSelf = playerId === session.user.id

    if (!isDM && !isSelf) {
      return NextResponse.json(
        { error: 'You can only edit your own language profile' },
        { status: 403 }
      )
    }

    // Load existing profiles
    const profiles = await loadPlayerLanguages(campaignId)

    // Find or create profile
    const existingIndex = profiles.findIndex((p) => p.playerId === playerId)
    const profile: PlayerLanguageProfile = {
      playerId,
      playerName: playerName || session.user.name || 'Unknown',
      languages: languages.map((l: string) => l.trim()).filter(Boolean),
    }

    if (existingIndex >= 0) {
      profiles[existingIndex] = profile
    } else {
      profiles.push(profile)
    }

    await savePlayerLanguages(campaignId, profiles)

    return NextResponse.json({
      success: true,
      profile,
    })
  } catch (error) {
    console.error('Error saving player languages:', error)
    return NextResponse.json(
      { error: 'Failed to save player languages' },
      { status: 500 }
    )
  }
}

// PUT - Bulk update player languages (DM only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { campaignId } = await params
    const isDM = await isDMForCampaign(campaignId, session.user.id)

    if (!isDM) {
      return NextResponse.json(
        { error: 'Only the DM can bulk update player languages' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { profiles } = body

    if (!profiles || !Array.isArray(profiles)) {
      return NextResponse.json(
        { error: 'Missing required field: profiles (array)' },
        { status: 400 }
      )
    }

    // Validate and clean profiles
    const validProfiles: PlayerLanguageProfile[] = profiles
      .filter((p: any) => p.playerId && Array.isArray(p.languages))
      .map((p: any) => ({
        playerId: p.playerId,
        playerName: p.playerName || 'Unknown',
        languages: p.languages.map((l: string) => l.trim()).filter(Boolean),
      }))

    await savePlayerLanguages(campaignId, validProfiles)

    return NextResponse.json({
      success: true,
      profiles: validProfiles,
    })
  } catch (error) {
    console.error('Error updating player languages:', error)
    return NextResponse.json(
      { error: 'Failed to update player languages' },
      { status: 500 }
    )
  }
}
