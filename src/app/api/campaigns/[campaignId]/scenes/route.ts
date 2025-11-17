import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const { campaignId } = await params
    const data = await request.json()
    const { title, slug, content } = data

    // Create scene file
    const scenesPath = path.join(process.cwd(), 'src', 'app', 'campaigns', campaignId, 'scenes')
    const scenePath = path.join(scenesPath, slug)

    // Create scene directory
    await fs.mkdir(scenePath, { recursive: true })

    // Add MDX imports to content if not present
    let mdxContent = content
    if (!content.includes('import {')) {
      mdxContent = `import { ImageLightbox } from '@/components/lightbox/ImageLightbox'
import { DiceNotation } from '@/components/dice/DiceNotation'

${content}`
    }

    // Write scene file
    await fs.writeFile(path.join(scenePath, 'page.mdx'), mdxContent)

    return NextResponse.json({
      success: true,
      message: 'Scene created successfully',
      slug,
    })
  } catch (error) {
    console.error('Error creating scene:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create scene', details: (error as Error).message },
      { status: 500 }
    )
  }
}
