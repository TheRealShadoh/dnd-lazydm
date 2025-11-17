import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string; sceneSlug: string }> }
) {
  try {
    const { campaignId, sceneSlug } = await params
    const scenePath = path.join(
      process.cwd(),
      'src',
      'app',
      'campaigns',
      campaignId,
      'scenes',
      sceneSlug,
      'page.mdx'
    )

    try {
      const content = await fs.readFile(scenePath, 'utf-8')

      // Extract title from first heading
      const lines = content.split('\n')
      let title = sceneSlug
      for (const line of lines) {
        if (line.startsWith('# ')) {
          title = line.replace(/^# /, '').trim()
          break
        }
      }

      return NextResponse.json({
        title,
        content,
        slug: sceneSlug,
      })
    } catch {
      return NextResponse.json(
        { error: 'Scene not found' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Error loading scene:', error)
    return NextResponse.json(
      { error: 'Failed to load scene', details: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string; sceneSlug: string }> }
) {
  try {
    const { campaignId, sceneSlug } = await params
    const data = await request.json()
    const { title, content } = data

    const scenePath = path.join(
      process.cwd(),
      'src',
      'app',
      'campaigns',
      campaignId,
      'scenes',
      sceneSlug,
      'page.mdx'
    )

    // Ensure imports are present
    let mdxContent = content
    if (!content.includes('import {')) {
      mdxContent = `import { ImageLightbox } from '@/components/lightbox/ImageLightbox'
import { DiceNotation } from '@/components/dice/DiceNotation'

${content}`
    }

    // Write updated scene file
    await fs.writeFile(scenePath, mdxContent)

    return NextResponse.json({
      success: true,
      message: 'Scene updated successfully',
      slug: sceneSlug,
    })
  } catch (error) {
    console.error('Error updating scene:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update scene', details: (error as Error).message },
      { status: 500 }
    )
  }
}
