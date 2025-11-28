'use client'

import { Suspense, useState, useEffect, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { MainNav } from '@/components/layout/MainNav'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { MonsterStatBlock } from '@/components/srd/MonsterStatBlock'
import { SpellCard } from '@/components/srd/SpellCard'
import { RaceCard } from '@/components/srd/RaceCard'
import { ClassCard } from '@/components/srd/ClassCard'
import { BackgroundCard } from '@/components/srd/BackgroundCard'
import { ItemCard } from '@/components/srd/ItemCard'
import { PropertyBadge, ChallengeRatingBadge, SpellLevelBadge, SpellSchoolBadge } from '@/components/srd/shared'
import { MonsterFilters, SpellFilters } from '@/components/srd/filters'
import type { MonsterFilterValues, SpellFilterValues } from '@/components/srd/filters'
import {
  Search,
  Loader2,
  Skull,
  Sparkles,
  Users,
  Shield,
  Package,
  BookOpen,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react'
import type { SRDMonster, SRDSpell, SRDRace, SRDClass, SRDItem, SRDBackgroundOption, SRDDataType } from '@/lib/srd/models'

type SRDEntry = SRDMonster | SRDSpell | SRDRace | SRDClass | SRDItem | SRDBackgroundOption

const TYPE_TABS = [
  { id: 'all', label: 'All', icon: Search },
  { id: 'monsters', label: 'Monsters', icon: Skull },
  { id: 'spells', label: 'Spells', icon: Sparkles },
  { id: 'races', label: 'Races', icon: Users },
  { id: 'classes', label: 'Classes', icon: Shield },
  { id: 'items', label: 'Items', icon: Package },
  { id: 'backgrounds', label: 'Backgrounds', icon: BookOpen },
] as const

const ITEMS_PER_PAGE = 24

export default function SRDBrowserPage() {
  return (
    <Suspense fallback={<SRDBrowserSkeleton />}>
      <SRDBrowserContent />
    </Suspense>
  )
}

function SRDBrowserSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <main className="container max-w-7xl mx-auto py-8 px-4">
        <PageHeader
          title="SRD Reference"
          description="Search and browse the D&D 5e Systems Reference Document"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'SRD Reference' },
          ]}
        />
        <Card variant="fantasy" className="mt-6">
          <CardContent className="p-4">
            <div className="h-12 bg-muted rounded animate-pulse" />
          </CardContent>
        </Card>
        <div className="flex gap-2 mt-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-8 w-24 bg-muted rounded animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} variant="fantasy" className="h-32 animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}

function SRDBrowserContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // State from URL params
  const initialType = (searchParams.get('type') as SRDDataType | 'all') || 'all'
  const initialQuery = searchParams.get('q') || ''
  const initialPage = parseInt(searchParams.get('page') || '1', 10)

  const [activeType, setActiveType] = useState<SRDDataType | 'all'>(initialType)
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [results, setResults] = useState<SRDEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<SRDEntry | null>(null)
  const [totalResults, setTotalResults] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [monsterFilters, setMonsterFilters] = useState<MonsterFilterValues>({})
  const [spellFilters, setSpellFilters] = useState<SpellFilterValues>({})

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
      setCurrentPage(1) // Reset to page 1 on new search
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams()
    if (activeType !== 'all') params.set('type', activeType)
    if (debouncedQuery) params.set('q', debouncedQuery)
    if (currentPage > 1) params.set('page', currentPage.toString())

    const newUrl = params.toString() ? `/srd?${params}` : '/srd'
    router.replace(newUrl, { scroll: false })
  }, [activeType, debouncedQuery, currentPage, router])

  // Fetch data with server-side filtering
  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const typesToFetch: SRDDataType[] =
          activeType === 'all'
            ? ['monsters', 'spells', 'races', 'classes', 'items', 'backgrounds']
            : [activeType]

        const allResults: SRDEntry[] = []

        for (const type of typesToFetch) {
          const params = new URLSearchParams({
            type,
            query: debouncedQuery,
            source: 'all',
            limit: '1000',
          })

          // Add monster-specific filters to API call
          if (type === 'monsters') {
            if (monsterFilters.crMin !== undefined) params.set('cr_min', monsterFilters.crMin.toString())
            if (monsterFilters.crMax !== undefined) params.set('cr_max', monsterFilters.crMax.toString())
            if (monsterFilters.size) params.set('size', monsterFilters.size)
            if (monsterFilters.monsterType) params.set('monster_type', monsterFilters.monsterType)
          }

          // Add spell-specific filters to API call
          if (type === 'spells') {
            if (spellFilters.level !== undefined) params.set('spell_level', spellFilters.level.toString())
            if (spellFilters.school) params.set('school', spellFilters.school)
            if (spellFilters.spellClass) params.set('spell_class', spellFilters.spellClass)
            if (spellFilters.ritual) params.set('ritual_only', 'true')
            if (spellFilters.concentration) params.set('concentration_only', 'true')
          }

          const response = await fetch(`/api/srd?${params}`)
          if (response.ok) {
            const data = await response.json()
            allResults.push(...data.results.map((r: SRDEntry) => ({ ...r, _type: type })))
          }
        }

        // Sort alphabetically by name
        allResults.sort((a, b) => a.name.localeCompare(b.name))

        setTotalResults(allResults.length)
        setResults(allResults)
      } catch (error) {
        console.error('Error fetching SRD data:', error)
        setResults([])
        setTotalResults(0)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [activeType, debouncedQuery, monsterFilters, spellFilters])

  // Paginated results
  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return results.slice(start, start + ITEMS_PER_PAGE)
  }, [results, currentPage])

  const totalPages = Math.ceil(totalResults / ITEMS_PER_PAGE)

  const handleTypeChange = (type: SRDDataType | 'all') => {
    setActiveType(type)
    setCurrentPage(1)
    setSelectedEntry(null)
  }

  const getEntryType = (entry: SRDEntry): SRDDataType => {
    return (entry as any)._type || 'monsters'
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <main className="container max-w-7xl mx-auto py-8 px-4">
        <PageHeader
          title="SRD Reference"
          description="Search and browse the D&D 5e Systems Reference Document"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'SRD Reference' },
          ]}
        />

        {/* Search Bar */}
        <Card variant="fantasy" className="mt-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search monsters, spells, races, classes, items, backgrounds..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-lg h-12"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Type Tabs and Filter Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
          <div className="flex flex-wrap gap-2">
            {TYPE_TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeType === tab.id
              return (
                <Button
                  key={tab.id}
                  variant={isActive ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleTypeChange(tab.id as SRDDataType | 'all')}
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </Button>
              )
            })}
          </div>

          {/* Filter Toggle - only show for monsters/spells */}
          {(activeType === 'monsters' || activeType === 'spells') && (
            <Button
              variant={showFilters ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && activeType === 'monsters' && (
          <div className="mt-4">
            <MonsterFilters
              values={monsterFilters}
              onChange={(filters) => {
                setMonsterFilters(filters)
                setCurrentPage(1)
              }}
              onClear={() => {
                setMonsterFilters({})
                setCurrentPage(1)
              }}
            />
          </div>
        )}

        {showFilters && activeType === 'spells' && (
          <div className="mt-4">
            <SpellFilters
              values={spellFilters}
              onChange={(filters) => {
                setSpellFilters(filters)
                setCurrentPage(1)
              }}
              onClear={() => {
                setSpellFilters({})
                setCurrentPage(1)
              }}
            />
          </div>
        )}

        {/* Results Info */}
        <div className="flex items-center justify-between mt-6 mb-4">
          <p className="text-sm text-muted-foreground">
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching...
              </span>
            ) : (
              <>
                Found <span className="font-semibold text-foreground">{totalResults}</span> results
                {debouncedQuery && (
                  <> for &quot;<span className="text-primary">{debouncedQuery}</span>&quot;</>
                )}
              </>
            )}
          </p>

          {/* Pagination Info */}
          {totalPages > 1 && (
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>
          )}
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading ? (
            // Skeleton loading
            Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} variant="fantasy" className="h-32 animate-pulse">
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))
          ) : paginatedResults.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No results found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            paginatedResults.map((entry) => (
              <ResultCard
                key={`${getEntryType(entry)}-${entry.id}`}
                entry={entry}
                type={getEntryType(entry)}
                onClick={() => setSelectedEntry(entry)}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex gap-1">
              {generatePageNumbers(currentPage, totalPages).map((page, idx) =>
                page === '...' ? (
                  <span key={`ellipsis-${idx}`} className="px-2 py-1 text-muted-foreground">
                    ...
                  </span>
                ) : (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(page as number)}
                    className="w-10"
                  >
                    {page}
                  </Button>
                )
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Detail Modal */}
        {selectedEntry && (
          <DetailModal
            entry={selectedEntry}
            type={getEntryType(selectedEntry)}
            onClose={() => setSelectedEntry(null)}
          />
        )}
      </main>
    </div>
  )
}

// Result Card Component
function ResultCard({
  entry,
  type,
  onClick,
}: {
  entry: SRDEntry
  type: SRDDataType
  onClick: () => void
}) {
  if (type === 'monsters') {
    const monster = entry as SRDMonster
    return (
      <Card
        variant="fantasy"
        className="p-4 hover:border-primary/50 transition-colors cursor-pointer"
        onClick={onClick}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{monster.name}</h3>
            <p className="text-xs text-muted-foreground">
              {monster.size} {monster.type}
            </p>
          </div>
          <ChallengeRatingBadge cr={monster.challengeRating} showXP={false} size="sm" />
        </div>
        <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
          <span>AC {monster.ac}</span>
          <span>HP {monster.hp}</span>
        </div>
      </Card>
    )
  }

  if (type === 'spells') {
    const spell = entry as SRDSpell
    return (
      <Card
        variant="fantasy"
        className="p-4 hover:border-primary/50 transition-colors cursor-pointer"
        onClick={onClick}
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-foreground truncate flex-1">{spell.name}</h3>
          <SpellLevelBadge level={spell.level} size="sm" />
        </div>
        {spell.school && <SpellSchoolBadge school={spell.school} size="sm" className="mt-1" />}
        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{spell.description}</p>
      </Card>
    )
  }

  if (type === 'races') {
    const race = entry as SRDRace
    return (
      <Card
        variant="fantasy"
        className="p-4 hover:border-primary/50 transition-colors cursor-pointer"
        onClick={onClick}
      >
        <h3 className="font-semibold text-foreground truncate">{race.name}</h3>
        <div className="mt-2 text-xs text-muted-foreground">
          {race.size && <span>Size: {race.size}</span>}
          {race.speed && <span className="ml-3">Speed: {race.speed} ft.</span>}
        </div>
        {race.abilityScoreBonuses && Object.keys(race.abilityScoreBonuses).length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {Object.entries(race.abilityScoreBonuses).map(([ability, bonus]) => (
              <PropertyBadge key={ability} variant="primary" size="sm">
                {ability.slice(0, 3).toUpperCase()} +{bonus}
              </PropertyBadge>
            ))}
          </div>
        )}
      </Card>
    )
  }

  if (type === 'classes') {
    const cls = entry as SRDClass
    return (
      <Card
        variant="fantasy"
        className="p-4 hover:border-primary/50 transition-colors cursor-pointer"
        onClick={onClick}
      >
        <h3 className="font-semibold text-foreground truncate">{cls.name}</h3>
        {cls.hitDice && (
          <p className="text-xs text-muted-foreground mt-1">Hit Dice: {cls.hitDice}</p>
        )}
        {cls.savingThrowProficiencies && cls.savingThrowProficiencies.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {cls.savingThrowProficiencies.map((save) => (
              <PropertyBadge key={save} variant="info" size="sm">
                {save}
              </PropertyBadge>
            ))}
          </div>
        )}
      </Card>
    )
  }

  if (type === 'items') {
    const item = entry as SRDItem
    return (
      <Card
        variant="fantasy"
        className="p-4 hover:border-primary/50 transition-colors cursor-pointer"
        onClick={onClick}
      >
        <h3 className="font-semibold text-foreground truncate">{item.name}</h3>
        <div className="mt-1 flex flex-wrap gap-1">
          {item.type && <PropertyBadge variant="type" size="sm">{item.type}</PropertyBadge>}
          {item.rarity && <PropertyBadge variant="rarity" size="sm">{item.rarity}</PropertyBadge>}
        </div>
        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{item.description}</p>
      </Card>
    )
  }

  if (type === 'backgrounds') {
    const bg = entry as SRDBackgroundOption
    return (
      <Card
        variant="fantasy"
        className="p-4 hover:border-primary/50 transition-colors cursor-pointer"
        onClick={onClick}
      >
        <h3 className="font-semibold text-foreground truncate">{bg.name}</h3>
        {bg.skillProficiencies && bg.skillProficiencies.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {bg.skillProficiencies.slice(0, 2).map((skill) => (
              <PropertyBadge key={skill} variant="success" size="sm">
                {skill}
              </PropertyBadge>
            ))}
          </div>
        )}
        {bg.description && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{bg.description}</p>
        )}
      </Card>
    )
  }

  // Fallback
  return (
    <Card
      variant="fantasy"
      className="p-4 hover:border-primary/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <h3 className="font-semibold text-foreground truncate">{entry.name}</h3>
    </Card>
  )
}

// Detail Modal Component
function DetailModal({
  entry,
  type,
  onClose,
}: {
  entry: SRDEntry
  type: SRDDataType
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-card border border-border shadow-xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content based on type */}
        {type === 'monsters' && <MonsterStatBlock monster={entry as SRDMonster} />}
        {type === 'spells' && <SpellCard spell={entry as SRDSpell} />}
        {type === 'races' && <RaceCard race={entry as SRDRace} />}
        {type === 'classes' && <ClassCard cls={entry as SRDClass} />}
        {type === 'items' && <ItemCard item={entry as SRDItem} />}
        {type === 'backgrounds' && <BackgroundCard background={entry as SRDBackgroundOption} />}
      </div>
    </div>
  )
}

// Helper function for pagination
function generatePageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: (number | '...')[] = []

  if (current <= 4) {
    pages.push(1, 2, 3, 4, 5, '...', total)
  } else if (current >= total - 3) {
    pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total)
  } else {
    pages.push(1, '...', current - 1, current, current + 1, '...', total)
  }

  return pages
}
