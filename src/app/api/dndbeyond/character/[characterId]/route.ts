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
    // Try to get the cookie from request header first, then fall back to environment variable
    const cobaltSession = request.headers.get('X-DnDBeyond-Token') || process.env.DNDBEYOND_COBALT_SESSION

    if (!cobaltSession) {
      return NextResponse.json(
        {
          success: false,
          error: 'D&D Beyond authentication not configured. Please authenticate in the admin panel.',
          help: 'Go to the campaign admin page and click "Set Up Authentication" to connect your D&D Beyond account.'
        },
        { status: 401 }
      )
    }

    const response = await fetch(
      `https://character-service.dndbeyond.com/character/v5/character/${characterId}`,
      {
        headers: {
          'Accept': 'application/json',
          'Cookie': `CobaltSession=${cobaltSession}`,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://www.dndbeyond.com/',
          'Origin': 'https://www.dndbeyond.com',
        },
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`D&D Beyond API error (${response.status}):`, errorText)

      let errorMessage = 'Failed to fetch character data from D&D Beyond'
      if (response.status === 401) {
        errorMessage = 'Authentication failed. Please check your CobaltSession cookie is valid.'
      } else if (response.status === 403) {
        errorMessage = 'Access forbidden. Your cookie may be expired, or you may not have access to this character.'
      }

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          statusCode: response.status,
          details: errorText.substring(0, 200) // First 200 chars of error
        },
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
