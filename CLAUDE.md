# CLAUDE.md - Project Guidelines for AI Assistants

This file provides context and guidelines for AI assistants working on the LazyDM project.

## Project Overview

LazyDM is a D&D campaign management web application built with:
- **Next.js 15** (App Router)
- **React 18** with TypeScript
- **Tailwind CSS** with CSS variables for theming
- **Radix UI** primitives (via shadcn/ui patterns)
- **Framer Motion** for animations
- **NextAuth.js** for authentication

## Style Guide

**IMPORTANT: Always follow the style guide at `docs/STYLE_GUIDE.md` when making UI changes.**

### Key Styling Rules

1. **Use the design system components** - Don't create custom styled elements when a component exists:
   - `Button` from `@/components/ui/Button`
   - `Card`, `CardHeader`, `CardContent`, etc. from `@/components/ui/Card`
   - `Input`, `Label`, `Textarea` from `@/components/ui/`
   - `Dialog`, `AlertDialog`, `DropdownMenu` from `@/components/ui/`

2. **Use semantic color classes** - Never use hardcoded colors:
   ```tsx
   // GOOD
   className="text-primary bg-card border-border"
   className="text-muted-foreground bg-muted"
   className="text-destructive bg-destructive/10"

   // BAD
   className="text-purple-500 bg-gray-900 border-gray-700"
   ```

3. **Use the font system**:
   - `font-display` - Headings, titles (Cinzel)
   - `font-heading` - Hero/decorative titles (Cinzel Decorative)
   - `font-body` - Body text (Crimson Text)
   - `font-ui` - UI elements, buttons (Alegreya Sans)
   - `font-mono` - Code, dice notation (Fira Code)

4. **Page structure pattern**:
   ```tsx
   export default function PageName() {
     return (
       <div className="min-h-screen bg-background">
         <MainNav />
         <main className="container max-w-7xl mx-auto py-8 px-4">
           <PageHeader title="Title" />
           {/* Content */}
         </main>
       </div>
     )
   }
   ```

5. **Use Lucide icons** - Import from `lucide-react`, standard sizes are `h-4 w-4`, `h-5 w-5`, `h-6 w-6`

6. **Loading states** - Use `Loader2` with `animate-spin text-primary`

7. **Card variants**:
   - `variant="default"` - Standard cards
   - `variant="fantasy"` - Decorative fantasy-styled cards
   - `variant="gold"` - Special/premium content

### Component Imports

```tsx
// Layout
import { MainNav } from '@/components/layout/MainNav'
import { PageHeader } from '@/components/layout/PageHeader'

// UI Components
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'

// Icons
import { Loader2, Plus, Edit2, Trash2, Eye } from 'lucide-react'

// Utils
import { cn } from '@/lib/utils'
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── admin/             # Admin pages (campaign management)
│   ├── campaigns/         # Campaign view pages
│   ├── dashboard/         # User dashboard
│   ├── login/             # Auth pages
│   └── vtt/               # Virtual tabletop
├── components/
│   ├── ui/                # Base UI components (shadcn-style)
│   ├── layout/            # Layout components (MainNav, PageHeader)
│   ├── auth/              # Auth components
│   ├── dice/              # Dice rolling components
│   ├── vtt/               # VTT components
│   └── characters/        # Character components
├── lib/
│   ├── theme/             # Theme system
│   ├── stores/            # Zustand stores
│   └── utils/             # Utility functions
└── hooks/                 # Custom React hooks
```

## Theme System

The app supports campaign-specific theming:

```tsx
import { useCampaignTheme } from '@/lib/theme'

// Campaigns can set custom colors that cascade through the UI
const { setTheme } = useCampaignTheme()
setTheme({
  primary: '#8B5CF6',
  secondary: '#6D28D9',
  preset: 'dark-fantasy'
})
```

## Common Patterns

### API Calls
```tsx
const response = await fetch(`/api/campaigns/${campaignId}/scenes`)
if (!response.ok) throw new Error('Failed to load')
const data = await response.json()
```

### Toast Notifications
```tsx
import { useToast } from '@/hooks/useToast'

const toast = useToast()
toast.success('Item created')
toast.error('Failed to save')
toast.info('Processing...')
```

### Confirmation Dialogs
```tsx
import { useConfirm } from '@/hooks/useConfirm'

const { confirm } = useConfirm()
const confirmed = await confirm({
  title: 'Delete Item',
  message: 'Are you sure?',
  confirmText: 'Delete',
  variant: 'danger'
})
```

## Testing

- Run `npm run build` to verify no TypeScript/build errors
- Run `npm run lint` for linting
- Test in Docker with `docker-compose up`

## Don't

- Don't use hardcoded colors (use CSS variables via Tailwind)
- Don't create new UI components when one exists in `@/components/ui/`
- Don't add UserMenu to layouts (it's in MainNav)
- Don't use `<img>` tags (use Next.js `Image` component)
- Don't skip the `MainNav` component on authenticated pages
