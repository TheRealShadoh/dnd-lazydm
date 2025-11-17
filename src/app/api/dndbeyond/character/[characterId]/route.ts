import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ characterId: string }> }
) {
  try {
    const { characterId } = await params

    if (!characterId) {
      return NextResponse.json(
        { success: false, error: 'Character ID is required' },
        { status: 400 }
      )
    }

    // Fetch character data from D&D Beyond's undocumented API
    const response = await fetch(
      `https://character-service.dndbeyond.com/character/v5/character/${characterId}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    )

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch character data from D&D Beyond' },
        { status: response.status }
      )
    }

    const characterData = await response.json()

    // Extract relevant character information
    const extractedData = {
      id: characterData.data?.id || characterId,
      name: characterData.data?.name || 'Unknown',
      avatarUrl: characterData.data?.avatarUrl || '',
      level: characterData.data?.classes?.reduce((total: number, cls: any) => total + (cls.level || 0), 0) || 1,
      race: characterData.data?.race?.fullName || characterData.data?.race?.baseName || 'Unknown',
      classes: characterData.data?.classes?.map((cls: any) => ({
        name: cls.definition?.name || 'Unknown',
        level: cls.level || 1,
      })) || [],
      // Health information
      currentHitPoints: characterData.data?.baseHitPoints || 0,
      maxHitPoints: characterData.data?.baseHitPoints || 0,
      temporaryHitPoints: characterData.data?.temporaryHitPoints || 0,
      // Core stats
      armorClass: characterData.data?.stats?.find((stat: any) => stat.id === 1)?.value || 10,
      stats: {
        strength: characterData.data?.stats?.find((stat: any) => stat.id === 1)?.value || 10,
        dexterity: characterData.data?.stats?.find((stat: any) => stat.id === 2)?.value || 10,
        constitution: characterData.data?.stats?.find((stat: any) => stat.id === 3)?.value || 10,
        intelligence: characterData.data?.stats?.find((stat: any) => stat.id === 4)?.value || 10,
        wisdom: characterData.data?.stats?.find((stat: any) => stat.id === 5)?.value || 10,
        charisma: characterData.data?.stats?.find((stat: any) => stat.id === 6)?.value || 10,
      },
      // Additional useful info
      inspiration: characterData.data?.inspiration || false,
      conditions: characterData.data?.conditions || [],
      deathSaves: characterData.data?.deathSaves || { failCount: 0, successCount: 0 },
      // Raw data for future use
      rawData: characterData.data,
    }

    return NextResponse.json({
      success: true,
      character: extractedData,
      fetchedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching D&D Beyond character:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch character data',
        details: (error as Error).message
      },
      { status: 500 }
    )
  }
}
