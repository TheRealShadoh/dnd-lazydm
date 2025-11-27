'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface SidebarItem {
  href: string
  label: string
  icon?: React.ReactNode
  badge?: string | number
}

interface SidebarSection {
  title?: string
  items: SidebarItem[]
}

interface SidebarProps {
  sections: SidebarSection[]
  header?: React.ReactNode
  footer?: React.ReactNode
  className?: string
  collapsible?: boolean
  defaultCollapsed?: boolean
}

export function Sidebar({
  sections,
  header,
  footer,
  className,
  collapsible = true,
  defaultCollapsed = false,
}: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed)

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-border bg-card/50 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Header */}
      {header && (
        <div className={cn('border-b border-border p-4', collapsed && 'px-2')}>
          {collapsed ? (
            <div className="flex justify-center">{/* Collapsed header icon */}</div>
          ) : (
            header
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-4">
            {section.title && !collapsed && (
              <h3 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {section.title}
              </h3>
            )}
            <div className="space-y-1 px-2">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary border-l-2 border-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                      collapsed && 'justify-center px-0'
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    {item.icon && (
                      <span className="flex-shrink-0">{item.icon}</span>
                    )}
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge !== undefined && (
                          <span className="px-2 py-0.5 bg-primary/20 text-primary rounded text-xs font-medium">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      {footer && !collapsed && (
        <div className="border-t border-border p-4">{footer}</div>
      )}

      {/* Collapse Toggle */}
      {collapsible && (
        <div className="border-t border-border p-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}
    </aside>
  )
}

// Campaign-specific sidebar variant
interface CampaignSidebarProps {
  campaignName: string
  campaignId: string
  scenes?: Array<{ slug: string; title: string; type?: string }>
  className?: string
}

export function CampaignSidebar({
  campaignName,
  campaignId,
  scenes = [],
  className,
}: CampaignSidebarProps) {
  const pathname = usePathname()
  const basePath = `/campaigns/${campaignId}`

  return (
    <aside
      className={cn(
        'flex flex-col w-64 border-r border-border bg-card/50',
        className
      )}
    >
      {/* Campaign Header */}
      <div className="border-b border-border p-4">
        <Link
          href={basePath}
          className="block hover:opacity-80 transition-opacity"
        >
          <h2 className="font-display text-lg font-bold text-primary truncate">
            {campaignName}
          </h2>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {/* Scenes Section */}
        {scenes.length > 0 && (
          <div className="mb-4">
            <h3 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Scenes
            </h3>
            <div className="space-y-1 px-2">
              {scenes.map((scene) => {
                const href = `${basePath}/scenes/${scene.slug}`
                const isActive = pathname === href
                return (
                  <Link
                    key={scene.slug}
                    href={href}
                    className={cn(
                      'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary border-l-2 border-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    )}
                  >
                    <span className="truncate">{scene.title}</span>
                    {scene.type && (
                      <span className="ml-auto text-xs text-muted-foreground capitalize">
                        {scene.type}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Reference Section */}
        <div className="mb-4">
          <h3 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Reference
          </h3>
          <div className="space-y-1 px-2">
            <Link
              href={`${basePath}/reference/monsters`}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                pathname.includes('/reference/monsters')
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              Monsters
            </Link>
            <Link
              href={`${basePath}/characters`}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                pathname.includes('/characters')
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              Characters
            </Link>
          </div>
        </div>
      </nav>
    </aside>
  )
}
