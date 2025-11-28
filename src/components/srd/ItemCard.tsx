'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { PropertyBadge, RarityBadge } from './shared'
import { Package, Coins, Scale, Sparkles } from 'lucide-react'
import type { SRDItem } from '@/lib/srd/models'

interface ItemCardProps {
  item: SRDItem
  variant?: 'full' | 'compact' | 'preview'
  className?: string
  onClick?: () => void
}

export function ItemCard({
  item,
  variant = 'full',
  className = '',
  onClick,
}: ItemCardProps) {
  if (variant === 'preview') {
    return <ItemPreview item={item} className={className} onClick={onClick} />
  }

  if (variant === 'compact') {
    return <ItemCompact item={item} className={className} onClick={onClick} />
  }

  return (
    <Card variant="fantasy" className={`overflow-hidden ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Package className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-2xl font-display text-primary">
              {item.name}
            </CardTitle>
            <div className="flex flex-wrap gap-2 mt-1">
              {item.type && (
                <PropertyBadge variant="type" size="sm">
                  {item.type}
                </PropertyBadge>
              )}
              {item.rarity && <RarityBadge rarity={item.rarity} size="sm" />}
              <PropertyBadge variant={item.source === 'official' ? 'default' : 'primary'} size="sm">
                {item.source === 'official' ? 'Official SRD' : 'Custom'}
              </PropertyBadge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Cost & Weight */}
        {(item.cost || item.weight) && (
          <div className="flex gap-6 py-3 border-y border-border">
            {item.cost && (
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-warning" />
                <div>
                  <div className="text-xs text-muted-foreground">Cost</div>
                  <div className="font-semibold text-foreground">{item.cost}</div>
                </div>
              </div>
            )}
            {item.weight && (
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">Weight</div>
                  <div className="font-semibold text-foreground">{item.weight} lb.</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Properties */}
        {item.properties && item.properties.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2">Properties</h4>
            <div className="flex flex-wrap gap-1">
              {item.properties.map((prop) => (
                <PropertyBadge key={prop} variant="info" size="sm">
                  {prop}
                </PropertyBadge>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {item.description && (
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2">Description</h4>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {item.description}
            </p>
          </div>
        )}

        {/* Magical Properties */}
        {item.magicalProperties && (
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <h4 className="text-sm font-semibold text-primary mb-2 flex items-center gap-1">
              <Sparkles className="h-4 w-4" />
              Magical Properties
            </h4>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {item.magicalProperties}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ItemCompact({ item, className, onClick }: { item: SRDItem; className?: string; onClick?: () => void }) {
  return (
    <Card
      variant="fantasy"
      className={`p-4 hover:border-primary/50 transition-colors cursor-pointer ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Package className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{item.name}</h3>
          <div className="flex flex-wrap gap-1 mt-1">
            {item.type && <PropertyBadge variant="type" size="sm">{item.type}</PropertyBadge>}
            {item.rarity && <RarityBadge rarity={item.rarity} size="sm" />}
          </div>
        </div>
      </div>
      {item.description && (
        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{item.description}</p>
      )}
    </Card>
  )
}

function ItemPreview({ item, className, onClick }: { item: SRDItem; className?: string; onClick?: () => void }) {
  return (
    <Card
      variant="fantasy"
      className={`p-4 hover:border-primary/50 transition-all cursor-pointer ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 mb-2">
        <Package className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-foreground truncate flex-1">{item.name}</h3>
      </div>
      <div className="flex flex-wrap gap-1 mb-2">
        {item.type && <PropertyBadge variant="type" size="sm">{item.type}</PropertyBadge>}
        {item.rarity && <RarityBadge rarity={item.rarity} size="sm" />}
      </div>
      {(item.cost || item.weight) && (
        <div className="text-xs text-muted-foreground">
          {item.cost && <span>{item.cost}</span>}
          {item.cost && item.weight && <span className="mx-1">•</span>}
          {item.weight && <span>{item.weight} lb.</span>}
        </div>
      )}
    </Card>
  )
}
