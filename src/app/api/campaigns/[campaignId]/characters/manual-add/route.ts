import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

interface DnDBeyondCharacter {
  characterId: string
  name: string
  avatarUrl?: string
  cachedData: any
  lastSync: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const { campaignId } = await params
    const { characterData } = await request.json()

    if (!characterData || !characterData.name) {
      return NextResponse.json(
        { success: false, error: 'Character data with name is required' },
        { status: 400 }
      )
    }

    // Read existing campaign data
    const campaignPath = path.join(process.cwd(), 'src', 'app', 'campaigns', campaignId)
    const campaignFile = path.join(campaignPath, 'campaign.json')

    let campaignFileData
    try {
      const fileContent = await fs.readFile(campaignFile, 'utf-8')
      campaignFileData = JSON.parse(fileContent)
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Initialize dndbeyond object if it doesn't exist
    if (!campaignFileData.dndbeyond) {
      campaignFileData.dndbeyond = { characters: [] }
    }

    // Create new character record
    const newCharacter: DnDBeyondCharacter = {
      characterId: characterData.id,
      name: characterData.name,
      avatarUrl: '',
      cachedData: characterData,
      lastSync: new Date().toISOString(),
    }

    // Add character (don't allow duplicates with same ID)
    const existingIndex = campaignFileData.dndbeyond.characters.findIndex(
      (c: DnDBeyondCharacter) => c.characterId === characterData.id
    )

    if (existingIndex >= 0) {
      campaignFileData.dndbeyond.characters[existingIndex] = newCharacter
    } else {
      campaignFileData.dndbeyond.characters.push(newCharacter)
    }

    // Save updated campaign
    await fs.writeFile(campaignFile, JSON.stringify(campaignFileData, null, 2))

    return NextResponse.json({
      success: true,
      character: newCharacter,
      message: `Character "${characterData.name}" added successfully`,
    })
  } catch (error) {
    console.error('Manual character add error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add character',
      },
      { status: 500 }
    )
  }
}
