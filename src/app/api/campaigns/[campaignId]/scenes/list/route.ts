import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const { campaignId } = await params
    const scenesPath = path.join(
      process.cwd(),
      'src',
      'app',
      'campaigns',
      campaignId,
      'scenes'
    )

    try {
      // Check if scenes directory exists
      await fs.access(scenesPath)
    } catch {
      // Scenes directory doesn't exist
      return NextResponse.json({ scenes: [] })
    }

    // Read all directories in scenes folder
    const entries = await fs.readdir(scenesPath, { withFileTypes: true })
    const scenes = []

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const scenePath = path.join(scenesPath, entry.name, 'page.mdx')
        try {
          // Check if scene has a page.mdx file
          await fs.access(scenePath)

          // Read the first line to get the title (assuming it starts with # Title)
          const content = await fs.readFile(scenePath, 'utf-8')
          const lines = content.split('\n')
          let title = entry.name

          // Try to find the title from the first heading
          for (const line of lines) {
            if (line.startsWith('# ')) {
              title = line.replace(/^# /, '').trim()
              break
            }
          }

          scenes.push({
            slug: entry.name,
            name: title,
            path: `/campaigns/${campaignId}/scenes/${entry.name}`,
          })
        } catch {
          // Skip directories without page.mdx
          continue
        }
      }
    }

    // Sort scenes alphabetically by slug
    scenes.sort((a, b) => a.slug.localeCompare(b.slug))

    return NextResponse.json({ scenes })
  } catch (error) {
    console.error('Error listing scenes:', error)
    return NextResponse.json(
      { error: 'Failed to list scenes', details: (error as Error).message },
      { status: 500 }
    )
  }
}
