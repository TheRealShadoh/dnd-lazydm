import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { auth } from '@/lib/auth/auth-options'
import { SceneSchema } from '@/lib/validation/schemas'
import { validateCampaignId, validateSceneSlug } from '@/lib/utils/sanitize'

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

    const { campaignId } = await params

    // Validate and sanitize campaign ID
    const safeCampaignId = validateCampaignId(campaignId)

    const data = await request.json()

    // Validate input using Zod schema
    const validation = SceneSchema.safeParse(data)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { title, slug, content } = validation.data

    // Validate and sanitize scene slug
    const safeSlug = validateSceneSlug(slug)

    // Create scene file
    const scenesPath = path.join(process.cwd(), 'src', 'app', 'campaigns', safeCampaignId, 'scenes')
    const scenePath = path.join(scenesPath, safeSlug)

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
