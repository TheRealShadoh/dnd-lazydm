import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET() {
  try {
    const publicPath = path.join(process.cwd(), 'public', 'campaigns')

    // Check if campaigns directory exists
    try {
      await fs.access(publicPath)
    } catch {
      return NextResponse.json({ images: [] })
    }

    const images: { url: string; campaign: string; name: string }[] = []

    // Read all campaign directories
    const campaigns = await fs.readdir(publicPath, { withFileTypes: true })

    for (const campaign of campaigns) {
      if (!campaign.isDirectory()) continue

      const imgPath = path.join(publicPath, campaign.name, 'img')

      // Check if img directory exists
      try {
        await fs.access(imgPath)
      } catch {
        continue // Skip if no img directory
      }

      // Read all images in the img directory
      const files = await fs.readdir(imgPath, { withFileTypes: true })

      for (const file of files) {
        if (!file.isFile()) continue

        // Check if it's an image file
        const ext = path.extname(file.name).toLowerCase()
        if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext)) {
          images.push({
            url: `/campaigns/${campaign.name}/img/${file.name}`,
            campaign: campaign.name,
            name: file.name,
          })
        }
      }
    }

    return NextResponse.json({ images })
  } catch (error) {
    console.error('Error listing campaign images:', error)
    return NextResponse.json(
      { error: 'Failed to list campaign images' },
      { status: 500 }
    )
  }
}
