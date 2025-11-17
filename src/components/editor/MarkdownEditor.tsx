'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import '@uiw/react-md-editor/markdown-editor.css'
import '@uiw/react-markdown-preview/markdown.css'

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
)

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  height?: number
  placeholder?: string
}

export function MarkdownEditor({
  value,
  onChange,
  height = 500,
  placeholder = 'Write your content in Markdown...',
}: MarkdownEditorProps) {
  const [isDarkMode] = useState(true)

  return (
    <div className="markdown-editor-wrapper" data-color-mode={isDarkMode ? 'dark' : 'light'}>
      <MDEditor
        value={value}
        onChange={(val) => onChange(val || '')}
        height={height}
        preview="live"
        hideToolbar={false}
        enableScroll={true}
        visibleDragbar={true}
        textareaProps={{
          placeholder,
        }}
        previewOptions={{
          rehypePlugins: [],
          remarkPlugins: [],
        }}
      />
      <style jsx global>{`
        .markdown-editor-wrapper {
          --md-editor-bg-color: #1a1a2e;
          --md-editor-border-color: #7b1fa2;
        }
        .w-md-editor {
          background-color: var(--md-editor-bg-color) !important;
          border: 2px solid var(--md-editor-border-color) !important;
          border-radius: 0.5rem !important;
        }
        .w-md-editor-toolbar {
          background-color: #0f0f1a !important;
          border-bottom: 1px solid var(--md-editor-border-color) !important;
        }
        .w-md-editor-toolbar button {
          color: #ab47bc !important;
        }
        .w-md-editor-toolbar button:hover {
          background-color: rgba(171, 71, 188, 0.2) !important;
        }
        .w-md-editor-content {
          background-color: var(--md-editor-bg-color) !important;
        }
        .w-md-editor-text,
        .w-md-editor-text-pre > code,
        .w-md-editor-text-input {
          color: #e0e0e0 !important;
          font-size: 14px !important;
          line-height: 1.6 !important;
        }
        .wmde-markdown {
          background-color: var(--md-editor-bg-color) !important;
          color: #e0e0e0 !important;
        }
        .wmde-markdown h1,
        .wmde-markdown h2,
        .wmde-markdown h3 {
          color: #ab47bc !important;
          border-bottom-color: #7b1fa2 !important;
        }
        .wmde-markdown code {
          background-color: #0f0f1a !important;
          color: #ab47bc !important;
        }
        .wmde-markdown pre {
          background-color: #0f0f1a !important;
        }
        .wmde-markdown table {
          border-color: #7b1fa2 !important;
        }
        .wmde-markdown table th,
        .wmde-markdown table td {
          border-color: #7b1fa2 !important;
        }
      `}</style>
    </div>
  )
}
