'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { PropertyBadge } from './shared'
import { BookOpen, GraduationCap, MessageSquare, Package } from 'lucide-react'
import type { SRDBackgroundOption } from '@/lib/srd/models'

interface BackgroundCardProps {
  background: SRDBackgroundOption
  variant?: 'full' | 'compact' | 'preview'
  className?: string
  onClick?: () => void
}

export function BackgroundCard({
  background,
  variant = 'full',
  className = '',
  onClick,
}: BackgroundCardProps) {
  if (variant === 'preview') {
    return <BackgroundPreview background={background} className={className} onClick={onClick} />
  }

  if (variant === 'compact') {
    return <BackgroundCompact background={background} className={className} onClick={onClick} />
  }

  return (
    <Card variant="fantasy" className={`overflow-hidden ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-display text-primary">
              {background.name}
            </CardTitle>
            <PropertyBadge variant={background.source === 'official' ? 'default' : 'primary'} size="sm">
              {background.source === 'official' ? 'Official SRD' : 'Custom'}
            </PropertyBadge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Skill Proficiencies */}
        {background.skillProficiencies && background.skillProficiencies.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1">
              <GraduationCap className="h-4 w-4" />
              Skill Proficiencies
            </h4>
            <div className="flex flex-wrap gap-2">
              {background.skillProficiencies.map((skill) => (
                <div
                  key={skill}
                  className="px-3 py-2 bg-success/10 rounded-lg border border-success/20"
                >
                  <div className="text-sm font-semibold text-success">{skill}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {background.languageChoices && background.languageChoices.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              Languages
            </h4>
            <div className="flex flex-wrap gap-1">
              {background.languageChoices.map((lang) => (
                <PropertyBadge key={lang} variant="info" size="sm">
                  {lang}
                </PropertyBadge>
              ))}
            </div>
          </div>
        )}

        {/* Equipment */}
        {background.equipment && background.equipment.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1">
              <Package className="h-4 w-4" />
              Starting Equipment
            </h4>
            <ul className="space-y-1">
              {background.equipment.map((item, idx) => (
                <li key={idx} className="text-sm text-foreground flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Description */}
        {background.description && (
          <div className="pt-3 border-t border-border">
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {background.description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function BackgroundCompact({ background, className, onClick }: { background: SRDBackgroundOption; className?: string; onClick?: () => void }) {
  return (
    <Card
      variant="fantasy"
      className={`p-4 hover:border-primary/50 transition-colors cursor-pointer ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <BookOpen className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{background.name}</h3>
          {background.skillProficiencies && background.skillProficiencies.length > 0 && (
            <div className="text-xs text-muted-foreground">
              Skills: {background.skillProficiencies.join(', ')}
            </div>
          )}
        </div>
      </div>
      {background.description && (
        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{background.description}</p>
      )}
    </Card>
  )
}

function BackgroundPreview({ background, className, onClick }: { background: SRDBackgroundOption; className?: string; onClick?: () => void }) {
  return (
    <Card
      variant="fantasy"
      className={`p-4 hover:border-primary/50 transition-all cursor-pointer ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 mb-2">
        <BookOpen className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-foreground truncate">{background.name}</h3>
      </div>
      {background.skillProficiencies && background.skillProficiencies.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {background.skillProficiencies.map((skill) => (
            <PropertyBadge key={skill} variant="success" size="sm">
              {skill}
            </PropertyBadge>
          ))}
        </div>
      )}
      {background.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">{background.description}</p>
      )}
    </Card>
  )
}
