'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Search, X, Loader2, BookOpen, Skull, Sparkles, Users, Shield, Package } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { MonsterStatBlock } from './MonsterStatBlock'
import { SpellCard } from './SpellCard'
import { RaceCard } from './RaceCard'
import { ClassCard } from './ClassCard'
import { BackgroundCard } from './BackgroundCard'
import { ItemCard } from './ItemCard'
import { ChallengeRatingBadge, SpellLevelBadge, PropertyBadge } from './shared'
import type { SRDMonster, SRDSpell, SRDRace, SRDClass, SRDItem, SRDBackgroundOption, SRDDataType } from '@/lib/srd/models'

type SRDEntry = SRDMonster | SRDSpell | SRDRace | SRDClass | SRDItem | SRDBackgroundOption

interface SRDLookupProviderProps {
  children: React.ReactNode
}

interface ContextMenuState {
  visible: boolean
  x: number
  y: number
  selectedText: string
}

interface ResultsModalState {
  visible: boolean
  query: string
  results: Array<{ entry: SRDEntry; type: SRDDataType }>
  loading: boolean
  selectedEntry: { entry: SRDEntry; type: SRDDataType } | null
}

export function SRDLookupProvider({ children }: SRDLookupProviderProps) {
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    selectedText: '',
  })

  const [modal, setModal] = useState<ResultsModalState>({
    visible: false,
    query: '',
    results: [],
    loading: false,
    selectedEntry: null,
  })

  const contextMenuRef = useRef<HTMLDivElement>(null)

  // Handle text selection and right-click
  const handleContextMenu = useCallback((e: MouseEvent) => {
    const selection = window.getSelection()
    const selectedText = selection?.toString().trim() || ''

    if (selectedText.length > 0 && selectedText.length < 100) {
      e.preventDefault()
      setContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        selectedText,
      })
    }
  }, [])

  // Close context menu on click outside
  const handleClick = useCallback((e: MouseEvent) => {
    if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
      setContextMenu(prev => ({ ...prev, visible: false }))
    }
  }, [])

  // Close context menu on scroll
  const handleScroll = useCallback(() => {
    setContextMenu(prev => ({ ...prev, visible: false }))
  }, [])

  useEffect(() => {
    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('click', handleClick)
    document.addEventListener('scroll', handleScroll, true)

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('click', handleClick)
      document.removeEventListener('scroll', handleScroll, true)
    }
  }, [handleContextMenu, handleClick, handleScroll])

  // Perform SRD lookup
  const performLookup = useCallback(async (query: string) => {
    setContextMenu(prev => ({ ...prev, visible: false }))
    setModal({
      visible: true,
      query,
      results: [],
      loading: true,
      selectedEntry: null,
    })

    try {
      const types: SRDDataType[] = ['monsters', 'spells', 'races', 'classes', 'items', 'backgrounds']
      const allResults: Array<{ entry: SRDEntry; type: SRDDataType }> = []

      // Search all types in parallel
      const responses = await Promise.all(
        types.map(type =>
          fetch(`/api/srd?type=${type}&query=${encodeURIComponent(query)}&limit=5`)
            .then(res => res.ok ? res.json() : { results: [] })
            .then(data => ({ type, results: data.results as SRDEntry[] }))
        )
      )

      for (const { type, results } of responses) {
        for (const entry of results) {
          allResults.push({ entry, type })
        }
      }

      // Sort by exact match first, then by name
      allResults.sort((a, b) => {
        const aExact = a.entry.name.toLowerCase() === query.toLowerCase()
        const bExact = b.entry.name.toLowerCase() === query.toLowerCase()
        if (aExact && !bExact) return -1
        if (!aExact && bExact) return 1
        return a.entry.name.localeCompare(b.entry.name)
      })

      setModal(prev => ({
        ...prev,
        results: allResults.slice(0, 20),
        loading: false,
        // Auto-select if exact match
        selectedEntry: allResults.length > 0 && allResults[0].entry.name.toLowerCase() === query.toLowerCase()
          ? allResults[0]
          : null,
      }))
    } catch (error) {
      console.error('SRD lookup error:', error)
      setModal(prev => ({ ...prev, loading: false }))
    }
  }, [])

  const closeModal = useCallback(() => {
    setModal(prev => ({ ...prev, visible: false, selectedEntry: null }))
  }, [])

  return (
    <>
      {children}

      {/* Context Menu */}
      {contextMenu.visible && typeof window !== 'undefined' && createPortal(
        <div
          ref={contextMenuRef}
          className="fixed z-[100] bg-card border border-border rounded-lg shadow-xl py-1 min-w-[180px]"
          style={{
            left: Math.min(contextMenu.x, window.innerWidth - 200),
            top: Math.min(contextMenu.y, window.innerHeight - 100),
          }}
        >
          <button
            onClick={() => performLookup(contextMenu.selectedText)}
            className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-muted transition-colors"
          >
            <BookOpen className="h-4 w-4 text-primary" />
            <span>SRD Lookup: <strong className="text-primary">{contextMenu.selectedText.slice(0, 30)}{contextMenu.selectedText.length > 30 ? '...' : ''}</strong></span>
          </button>
        </div>,
        document.body
      )}

      {/* Results Modal */}
      {modal.visible && typeof window !== 'undefined' && createPortal(
        <SRDResultsModal
          query={modal.query}
          results={modal.results}
          loading={modal.loading}
          selectedEntry={modal.selectedEntry}
          onSelect={(entry) => setModal(prev => ({ ...prev, selectedEntry: entry }))}
          onClose={closeModal}
        />,
        document.body
      )}
    </>
  )
}

// Results Modal Component
function SRDResultsModal({
  query,
  results,
  loading,
  selectedEntry,
  onSelect,
  onClose,
}: {
  query: string
  results: Array<{ entry: SRDEntry; type: SRDDataType }>
  loading: boolean
  selectedEntry: { entry: SRDEntry; type: SRDDataType } | null
  onSelect: (entry: { entry: SRDEntry; type: SRDDataType }) => void
  onClose: () => void
}) {
  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-4xl max-h-[90vh] flex bg-card border border-border rounded-lg shadow-xl overflow-hidden">
        {/* Left Panel - Search Results */}
        <div className="w-80 border-r border-border flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Search className="h-4 w-4 text-primary" />
                SRD Lookup
              </h3>
              <button
                onClick={onClose}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              Searching for: <span className="text-primary font-medium">&ldquo;{query}&rdquo;</span>
            </p>
          </div>

          {/* Results List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-8 px-4">
                <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No results found</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {results.map(({ entry, type }, idx) => (
                  <ResultItem
                    key={`${type}-${entry.id}-${idx}`}
                    entry={entry}
                    type={type}
                    isSelected={selectedEntry?.entry.id === entry.id && selectedEntry?.type === type}
                    onClick={() => onSelect({ entry, type })}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Detail View */}
        <div className="flex-1 overflow-y-auto bg-muted/30">
          {selectedEntry ? (
            <DetailView entry={selectedEntry.entry} type={selectedEntry.type} />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Select an item to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Result Item Component
function ResultItem({
  entry,
  type,
  isSelected,
  onClick,
}: {
  entry: SRDEntry
  type: SRDDataType
  isSelected: boolean
  onClick: () => void
}) {
  const getIcon = () => {
    switch (type) {
      case 'monsters': return <Skull className="h-4 w-4" />
      case 'spells': return <Sparkles className="h-4 w-4" />
      case 'races': return <Users className="h-4 w-4" />
      case 'classes': return <Shield className="h-4 w-4" />
      case 'items': return <Package className="h-4 w-4" />
      case 'backgrounds': return <BookOpen className="h-4 w-4" />
      default: return <Search className="h-4 w-4" />
    }
  }

  const getBadge = () => {
    switch (type) {
      case 'monsters':
        return <ChallengeRatingBadge cr={(entry as SRDMonster).challengeRating} showXP={false} size="sm" />
      case 'spells':
        return <SpellLevelBadge level={(entry as SRDSpell).level} size="sm" />
      case 'items':
        const item = entry as SRDItem
        return item.rarity ? <PropertyBadge variant="rarity" size="sm">{item.rarity}</PropertyBadge> : null
      default:
        return null
    }
  }

  const getSubtext = () => {
    switch (type) {
      case 'monsters':
        const monster = entry as SRDMonster
        return `${monster.size || ''} ${monster.type || ''}`.trim()
      case 'spells':
        const spell = entry as SRDSpell
        return spell.school || ''
      case 'races':
        const race = entry as SRDRace
        return race.size ? `${race.size}` : ''
      case 'classes':
        const cls = entry as SRDClass
        return cls.hitDice || ''
      case 'items':
        return (entry as SRDItem).type || ''
      case 'backgrounds':
        const bg = entry as SRDBackgroundOption
        return bg.skillProficiencies?.slice(0, 2).join(', ') || ''
      default:
        return ''
    }
  }

  return (
    <button
      onClick={onClick}
      className={`w-full p-3 text-left transition-colors ${
        isSelected ? 'bg-primary/10 border-l-2 border-l-primary' : 'hover:bg-muted'
      }`}
    >
      <div className="flex items-start gap-2">
        <span className={`mt-0.5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
          {getIcon()}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground truncate">{entry.name}</span>
            {getBadge()}
          </div>
          {getSubtext() && (
            <p className="text-xs text-muted-foreground truncate">{getSubtext()}</p>
          )}
        </div>
      </div>
    </button>
  )
}

// Detail View Component
function DetailView({ entry, type }: { entry: SRDEntry; type: SRDDataType }) {
  switch (type) {
    case 'monsters':
      return <MonsterStatBlock monster={entry as SRDMonster} />
    case 'spells':
      return <SpellCard spell={entry as SRDSpell} />
    case 'races':
      return <RaceCard race={entry as SRDRace} />
    case 'classes':
      return <ClassCard cls={entry as SRDClass} />
    case 'items':
      return <ItemCard item={entry as SRDItem} />
    case 'backgrounds':
      return <BackgroundCard background={entry as SRDBackgroundOption} />
    default:
      return null
  }
}
