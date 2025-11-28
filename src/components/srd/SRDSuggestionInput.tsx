'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Input } from '@/components/ui/Input'
import { Search, Loader2, ChevronDown, Check } from 'lucide-react'

interface SuggestionItem {
  id: string
  name: string
  description?: string
  badge?: string
}

interface SRDSuggestionInputProps {
  value: string
  onChange: (value: string) => void
  onSelect?: (item: SuggestionItem) => void
  type: 'races' | 'classes' | 'backgrounds'
  placeholder?: string
  label?: string
  required?: boolean
  className?: string
}

export function SRDSuggestionInput({
  value,
  onChange,
  onSelect,
  type,
  placeholder,
  label,
  required = false,
  className = '',
}: SRDSuggestionInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([])
  const [loading, setLoading] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Fetch suggestions when value changes
  useEffect(() => {
    if (!isOpen) return

    const fetchSuggestions = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          type,
          query: value,
          source: 'all',
          limit: '10',
        })

        const response = await fetch(`/api/srd?${params}`)
        if (response.ok) {
          const data = await response.json()
          const items: SuggestionItem[] = data.results.map((item: any) => ({
            id: item.id,
            name: item.name,
            description: getDescription(item, type),
            badge: getBadge(item, type),
          }))
          setSuggestions(items)
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error)
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(fetchSuggestions, 200)
    return () => clearTimeout(timer)
  }, [value, type, isOpen])

  const getDescription = (item: any, type: string): string => {
    switch (type) {
      case 'races':
        return item.size ? `${item.size} • Speed ${item.speed || 30} ft.` : ''
      case 'classes':
        return item.hitDice ? `Hit Dice: ${item.hitDice}` : ''
      case 'backgrounds':
        return item.skillProficiencies?.join(', ') || ''
      default:
        return ''
    }
  }

  const getBadge = (item: any, type: string): string => {
    switch (type) {
      case 'races':
        if (item.abilityScoreBonuses) {
          const bonuses = Object.entries(item.abilityScoreBonuses)
            .map(([stat, val]) => `${stat.substring(0, 3).toUpperCase()} +${val}`)
            .join(', ')
          return bonuses
        }
        return ''
      case 'classes':
        return item.spellcastingAbility ? 'Spellcaster' : ''
      case 'backgrounds':
        return item.source === 'official' ? 'SRD' : 'Custom'
      default:
        return ''
    }
  }

  const handleSelect = useCallback((item: SuggestionItem) => {
    onChange(item.name)
    onSelect?.(item)
    setIsOpen(false)
    setHighlightedIndex(-1)
  }, [onChange, onSelect])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown') {
        setIsOpen(true)
        e.preventDefault()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0)
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
          handleSelect(suggestions[highlightedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setHighlightedIndex(-1)
        break
    }
  }, [isOpen, suggestions, highlightedIndex, handleSelect])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        listRef.current &&
        !listRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-muted-foreground mb-2">
          {label} {required && <span className="text-destructive">*</span>}
        </label>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-9 pr-8"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          )}
        </button>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={listRef}
          className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto rounded-lg border border-border bg-card shadow-lg"
        >
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : suggestions.length === 0 ? (
            <div className="px-3 py-4 text-center text-muted-foreground text-sm">
              {value ? 'No matches found. You can use a custom value.' : 'Type to search SRD...'}
            </div>
          ) : (
            <ul role="listbox">
              {suggestions.map((item, index) => (
                <li
                  key={item.id}
                  role="option"
                  aria-selected={highlightedIndex === index}
                  onClick={() => handleSelect(item)}
                  className={`px-3 py-2 cursor-pointer transition-colors ${
                    highlightedIndex === index
                      ? 'bg-primary/10 text-foreground'
                      : 'hover:bg-muted'
                  } ${value === item.name ? 'bg-success/5' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {value === item.name && (
                        <Check className="h-4 w-4 text-success" />
                      )}
                      <span className="font-medium text-foreground">{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <div className="text-xs text-muted-foreground mt-0.5 ml-6">
                      {item.description}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
