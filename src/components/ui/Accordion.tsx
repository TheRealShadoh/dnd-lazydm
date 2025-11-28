'use client'

import * as React from 'react'
import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

// Modern Radix-based Accordion components
const AccordionRoot = AccordionPrimitive.Root

const AccordionItemPrimitive = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn(
      'border border-border rounded-lg overflow-hidden',
      'data-[state=open]:border-primary/30',
      'transition-colors duration-200',
      className
    )}
    {...props}
  />
))
AccordionItemPrimitive.displayName = 'AccordionItemPrimitive'

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> & {
    badge?: string | number
  }
>(({ className, children, badge, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        'flex flex-1 items-center justify-between py-3 px-4',
        'bg-muted/50 hover:bg-muted',
        'font-medium transition-all',
        'text-left',
        '[&[data-state=open]>svg]:rotate-180',
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-3">
        <span className="font-semibold text-foreground">{children}</span>
        {badge !== undefined && (
          <span className="px-2 py-0.5 bg-primary/20 text-primary rounded text-xs font-medium">
            {badge}
          </span>
        )}
      </div>
      <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn('p-4 bg-card', className)}>{children}</div>
  </AccordionPrimitive.Content>
))
AccordionContent.displayName = AccordionPrimitive.Content.displayName

// =====================================================
// Legacy Compatibility Components
// These match the old API for backward compatibility
// =====================================================

interface AccordionItemProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  badge?: string | number
}

/**
 * Legacy AccordionItem - standalone accordion that doesn't need a parent Accordion
 * For backward compatibility with existing code
 */
function AccordionItem({ title, children, defaultOpen = false, badge }: AccordionItemProps) {
  return (
    <AccordionRoot type="single" collapsible defaultValue={defaultOpen ? 'item' : undefined}>
      <AccordionItemPrimitive value="item">
        <AccordionTrigger badge={badge}>{title}</AccordionTrigger>
        <AccordionContent>{children}</AccordionContent>
      </AccordionItemPrimitive>
    </AccordionRoot>
  )
}

interface AccordionProps {
  children: React.ReactNode
  className?: string
}

/**
 * Legacy Accordion wrapper - just wraps children in a div with spacing
 * For backward compatibility with existing code that uses Accordion + AccordionItem
 */
function Accordion({ children, className = '' }: AccordionProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {children}
    </div>
  )
}

// Export both legacy and modern versions
export {
  // Legacy (default exports for backward compatibility)
  Accordion,
  AccordionItem,
  // Modern Radix-based exports (for new code)
  AccordionRoot,
  AccordionItemPrimitive,
  AccordionTrigger,
  AccordionContent,
}
