'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MarkdownEditor } from '@/components/editor/MarkdownEditor'
import Link from 'next/link'
import { useToast } from '@/hooks/useToast'

export default function NewCampaignPage() {
  const router = useRouter()
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [synopsis, setSynopsis] = useState('')
  const [level, setLevel] = useState('')
  const [players, setPlayers] = useState('')
  const [duration, setDuration] = useState('')
  const [genre, setGenre] = useState('')
  const [thumbnail, setThumbnail] = useState('')

  // Theme colors
  const [primaryColor, setPrimaryColor] = useState('#ab47bc')
  const [secondaryColor, setSecondaryColor] = useState('#7b1fa2')

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    setName(value)
    const generatedSlug = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    setSlug(generatedSlug)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug,
          description,
          synopsis,
          level,
          players,
          duration,
          genre,
          thumbnail,
          theme: {
            primary: primaryColor,
            secondary: secondaryColor,
          },
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Campaign created successfully!')
        router.push(`/admin/campaigns/${data.slug}`)
      } else {
        toast.error('Failed to create campaign')
      }
    } catch (error) {
      console.error('Error creating campaign:', error)
      toast.error('Error creating campaign')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/admin"
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            ← Back
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-purple-400">Create New Campaign</h1>
            <p className="text-gray-400 mt-1">Set up your campaign details and theme</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-gray-900 rounded-xl border-2 border-gray-800 p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Basic Information</h2>

            <div className="space-y-4">
              {/* Campaign Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg
                           focus:border-purple-500 focus:outline-none text-white"
                  placeholder="The Court of Thorns and Mire"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  URL Slug *
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  pattern="[a-z0-9-]+"
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg
                           focus:border-purple-500 focus:outline-none text-white font-mono"
                  placeholder="court-of-thorns-mire"
                />
                <p className="text-sm text-gray-500 mt-1">
                  URL: /campaigns/{slug || 'your-campaign-slug'}
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Short Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg
                           focus:border-purple-500 focus:outline-none text-white"
                  placeholder="A romantasy one-shot adventure"
                />
              </div>

              {/* Campaign Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Level Range
                  </label>
                  <input
                    type="text"
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg
                             focus:border-purple-500 focus:outline-none text-white"
                    placeholder="4"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Players
                  </label>
                  <input
                    type="text"
                    value={players}
                    onChange={(e) => setPlayers(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg
                             focus:border-purple-500 focus:outline-none text-white"
                    placeholder="1-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg
                             focus:border-purple-500 focus:outline-none text-white"
                    placeholder="One-shot (3-4 hours)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Genre
                  </label>
                  <input
                    type="text"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg
                             focus:border-purple-500 focus:outline-none text-white"
                    placeholder="Romantasy"
                  />
                </div>
              </div>

              {/* Thumbnail URL */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Thumbnail Image URL
                </label>
                <input
                  type="text"
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg
                           focus:border-purple-500 focus:outline-none text-white font-mono text-sm"
                  placeholder="/campaigns/your-campaign/img/thumbnail.jpg"
                />
                {thumbnail && (
                  <div className="mt-2">
                    <img
                      src={thumbnail}
                      alt="Thumbnail preview"
                      className="w-48 h-32 object-cover rounded border-2 border-gray-700"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.jpg'
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Synopsis */}
          <div className="bg-gray-900 rounded-xl border-2 border-gray-800 p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Campaign Synopsis</h2>
            <p className="text-gray-400 text-sm mb-4">
              Write a detailed synopsis of your campaign (supports Markdown)
            </p>
            <MarkdownEditor
              value={synopsis}
              onChange={setSynopsis}
              height={300}
              placeholder="## Campaign Overview&#10;&#10;Write your campaign synopsis here..."
            />
          </div>

          {/* Theme Customization */}
          <div className="bg-gray-900 rounded-xl border-2 border-gray-800 p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Theme Customization</h2>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Primary Color
                </label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-16 h-12 rounded border-2 border-gray-700 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg
                             focus:border-purple-500 focus:outline-none text-white font-mono"
                  />
                </div>
                <div
                  className="mt-2 h-8 rounded"
                  style={{ backgroundColor: primaryColor }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Secondary Color
                </label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-16 h-12 rounded border-2 border-gray-700 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="flex-1 px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg
                             focus:border-purple-500 focus:outline-none text-white font-mono"
                  />
                </div>
                <div
                  className="mt-2 h-8 rounded"
                  style={{ backgroundColor: secondaryColor }}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || !name || !slug}
              className="flex-1 px-6 py-4 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-700
                       disabled:cursor-not-allowed rounded-lg font-semibold text-lg
                       transition-colors duration-200"
            >
              {loading ? 'Creating Campaign...' : 'Create Campaign'}
            </button>
            <Link
              href="/admin"
              className="px-6 py-4 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold text-lg
                       transition-colors duration-200"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
