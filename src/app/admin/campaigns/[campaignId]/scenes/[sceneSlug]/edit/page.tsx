'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MarkdownEditor } from '@/components/editor/MarkdownEditor'
import { useToast } from '@/hooks/useToast'
import Link from 'next/link'

export default function EditScenePage() {
  const router = useRouter()
  const params = useParams()
  const campaignId = params.campaignId as string
  const sceneSlug = params.sceneSlug as string
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  useEffect(() => {
    const loadScene = async () => {
      try {
        // Fetch the scene content
        const response = await fetch(`/api/campaigns/${campaignId}/scenes/${sceneSlug}`)
        if (response.ok) {
          const data = await response.json()
          setTitle(data.title)
          setContent(data.content)
        } else {
          toast.error('Failed to load scene')
        }
      } catch (error) {
        console.error('Error loading scene:', error)
        toast.error('Error loading scene')
      } finally {
        setLoading(false)
      }
    }

    loadScene()
  }, [campaignId, sceneSlug])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/scenes/${sceneSlug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
        }),
      })

      if (response.ok) {
        router.push(`/admin/campaigns/${campaignId}`)
      } else {
        toast.error('Failed to update scene')
      }
    } catch (error) {
      console.error('Error updating scene:', error)
      toast.error('Error updating scene')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-400">Loading scene...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href={`/admin/campaigns/${campaignId}`}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            ← Back to Campaign
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-purple-400">Edit Scene</h1>
            <p className="text-gray-400 mt-1">
              Campaign: {campaignId} / Scene: {sceneSlug}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Scene Information */}
          <div className="bg-gray-900 rounded-xl border-2 border-gray-800 p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Scene Information</h2>

            <div className="space-y-4">
              {/* Scene Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Scene Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg
                           focus:border-purple-500 focus:outline-none text-white"
                  placeholder="The Dark Forest"
                />
              </div>

              <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <p className="text-sm text-gray-400">
                  <strong>Note:</strong> The scene slug ({sceneSlug}) cannot be changed when editing.
                  To change the URL, create a new scene.
                </p>
              </div>
            </div>
          </div>

          {/* Scene Content Editor */}
          <div className="bg-gray-900 rounded-xl border-2 border-gray-800 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Scene Content</h2>
              <div className="text-sm text-gray-400">
                Supports Markdown, images, tables, and dice notation
              </div>
            </div>

            <MarkdownEditor value={content} onChange={setContent} height={600} />

            <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <h3 className="font-semibold text-purple-400 mb-2">💡 Tips</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Use <code className="text-purple-300">&lt;DiceNotation value=&quot;1d20&quot; /&gt;</code> for clickable dice</li>
                <li>• Use <code className="text-purple-300">&lt;ImageLightbox src=&quot;...&quot; /&gt;</code> for images with lightbox</li>
                <li>• Reference monsters: <code className="text-purple-300">[Goblin](../reference/monsters#goblin)</code></li>
                <li>• Add battle maps: <code className="text-purple-300">![Map](../img/map_name.jpg)</code></li>
              </ul>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving || !title}
              className="flex-1 px-6 py-4 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-700
                       disabled:cursor-not-allowed rounded-lg font-semibold text-lg
                       transition-colors duration-200"
            >
              {saving ? 'Saving Changes...' : 'Save Changes'}
            </button>
            <Link
              href={`/campaigns/${campaignId}/scenes/${sceneSlug}`}
              target="_blank"
              className="px-6 py-4 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold text-lg
                       transition-colors duration-200 text-center flex items-center gap-2"
            >
              👁️ Preview
            </Link>
            <Link
              href={`/admin/campaigns/${campaignId}`}
              className="px-6 py-4 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold text-lg
                       transition-colors duration-200 text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
