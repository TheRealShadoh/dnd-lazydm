# LazyDM Style Guide

This document outlines the design system and styling conventions for the LazyDM D&D campaign management application.

## Design Philosophy

LazyDM uses a **Fantasy & Immersive** design inspired by D&D Beyond, featuring:
- Dark theme with rich textures and ornate borders
- Glowing effects and magical aesthetics
- Campaign-specific color theming
- Mobile-first responsive design

---

## Typography

### Font Families

```css
font-display   /* Cinzel - Titles, headings, important UI elements */
font-heading   /* Cinzel Decorative - Hero titles, decorative headings */
font-body      /* Crimson Text - Body text, paragraphs, descriptions */
font-ui        /* Alegreya Sans - UI elements, buttons, labels */
font-mono      /* Fira Code - Code, dice notation, technical values */
```

### Usage Examples

```tsx
<h1 className="font-heading text-4xl">Campaign Title</h1>
<h2 className="font-display text-2xl">Section Heading</h2>
<p className="font-body">Description text goes here...</p>
<span className="font-ui text-sm">Button Label</span>
<code className="font-mono">2d6+3</code>
```

---

## Color System

### Semantic Colors (CSS Variables)

```css
--primary          /* Main brand color (purple by default) */
--primary-foreground
--primary-light
--primary-dark

--secondary        /* Secondary accent color */
--secondary-foreground

--accent           /* Highlight color */
--destructive      /* Error, danger, delete actions */
--success          /* Success states, positive values */
--warning          /* Warning states, caution */
--info             /* Informational states */

--background       /* Page background */
--foreground       /* Primary text color */
--card             /* Card/panel backgrounds */
--muted            /* Muted backgrounds */
--muted-foreground /* Muted text */
--border           /* Border color */
```

### Usage with Tailwind

```tsx
// Text colors
<span className="text-primary">Primary text</span>
<span className="text-muted-foreground">Muted text</span>
<span className="text-destructive">Error text</span>
<span className="text-success">Success text</span>

// Background colors
<div className="bg-card">Card background</div>
<div className="bg-muted">Muted background</div>
<div className="bg-primary/10">10% primary overlay</div>

// Borders
<div className="border border-border">Standard border</div>
<div className="border-primary/50">Primary accent border</div>
```

---

## Components

### Buttons

Use the `Button` component from `@/components/ui/Button`:

```tsx
import { Button } from '@/components/ui/Button'

// Variants
<Button variant="primary">Primary Action</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>
<Button variant="gold">Special Action</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon Only</Button>
```

### Cards

Use the `Card` component from `@/components/ui/Card`:

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card'

// Variants
<Card variant="default">Standard card</Card>
<Card variant="fantasy">Fantasy styled with ornate borders</Card>
<Card variant="gold">Gold accent card</Card>
<Card variant="elevated">Elevated shadow card</Card>

// Full structure
<Card variant="fantasy">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Optional description</CardDescription>
  </CardHeader>
  <CardContent>
    Main content here
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Form Inputs

```tsx
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/Select'

<div className="space-y-2">
  <Label htmlFor="name">Name</Label>
  <Input id="name" placeholder="Enter name" />
</div>

<div className="space-y-2">
  <Label htmlFor="description">Description</Label>
  <Textarea id="description" placeholder="Enter description" />
</div>
```

### Dialogs & Modals

```tsx
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog'

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description text</DialogDescription>
    </DialogHeader>
    {/* Content */}
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button variant="primary">Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Navigation

```tsx
import { MainNav } from '@/components/layout/MainNav'
import { PageHeader } from '@/components/layout/PageHeader'

// MainNav is included automatically with user menu
<MainNav />

// PageHeader with breadcrumbs
<PageHeader
  title="Page Title"
  description="Optional page description"
  breadcrumbs={[
    { label: 'Home', href: '/' },
    { label: 'Section', href: '/section' },
    { label: 'Current Page' },
  ]}
  actions={<Button>Action</Button>}
/>
```

---

## Layout Patterns

### Page Structure

```tsx
export default function PageName() {
  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <main className="container max-w-7xl mx-auto py-8 px-4">
        <PageHeader title="Page Title" />
        {/* Page content */}
      </main>
    </div>
  )
}
```

### Loading States

```tsx
import { Loader2 } from 'lucide-react'

<div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
  <div className="text-center space-y-4">
    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
    <p className="text-muted-foreground font-ui">Loading...</p>
  </div>
</div>
```

### Error States

```tsx
<Card variant="fantasy" className="max-w-md text-center">
  <CardContent className="pt-6">
    <div className="w-16 h-16 mb-4 mx-auto rounded-full bg-destructive/20 flex items-center justify-center">
      <X className="w-8 h-8 text-destructive" />
    </div>
    <p className="text-muted-foreground mb-4">Error message here</p>
    <Button variant="primary">Retry</Button>
  </CardContent>
</Card>
```

### Empty States

```tsx
<Card variant="fantasy" className="text-center py-16">
  <CardContent>
    <ScrollText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
    <h3 className="text-xl font-bold font-display text-foreground mb-2">No items yet</h3>
    <p className="text-muted-foreground mb-6">Create your first item to get started</p>
    <Button variant="primary">
      <Plus className="h-4 w-4 mr-2" />
      Create Item
    </Button>
  </CardContent>
</Card>
```

---

## Icons

Use Lucide React icons consistently:

```tsx
import {
  Sword,           // Logo, D&D theme
  Dice6,           // Dice rolling
  ScrollText,      // Campaigns, documents
  Users,           // Characters, party
  Swords,          // Monsters, combat
  Map,             // VTT, maps
  BookOpen,        // SRD, reference
  Plus,            // Add actions
  Edit2,           // Edit actions
  Trash2,          // Delete actions
  Eye,             // View/preview
  Loader2,         // Loading spinner
  ChevronRight,    // Navigation
  X,               // Close, error
  Check,           // Success, confirm
} from 'lucide-react'

// Standard icon sizes
<Icon className="h-4 w-4" />  // Small (buttons, inline)
<Icon className="h-5 w-5" />  // Medium (nav items)
<Icon className="h-6 w-6" />  // Large (headers)
<Icon className="h-12 w-12" /> // XL (empty states, loading)
```

---

## Spacing & Layout

### Standard Spacing Scale

```css
gap-2    /* 8px - tight spacing */
gap-3    /* 12px - compact spacing */
gap-4    /* 16px - default spacing */
gap-6    /* 24px - comfortable spacing */
gap-8    /* 32px - section spacing */
```

### Container Widths

```tsx
<div className="container max-w-7xl mx-auto px-4">
  {/* Standard page content */}
</div>

<div className="max-w-md mx-auto">
  {/* Forms, modals, narrow content */}
</div>

<div className="max-w-2xl mx-auto">
  {/* Article content, medium width */}
</div>
```

---

## Responsive Design

### Breakpoints

```css
sm:  /* 640px+ */
md:  /* 768px+ */
lg:  /* 1024px+ */
xl:  /* 1280px+ */
2xl: /* 1536px+ */
```

### Common Patterns

```tsx
// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// Hide on mobile, show on desktop
<div className="hidden md:flex">

// Show on mobile, hide on desktop
<div className="flex md:hidden">

// Responsive text size
<h1 className="text-3xl md:text-4xl lg:text-5xl">
```

---

## Campaign Theming

Campaigns can override the default theme colors:

```tsx
import { useCampaignTheme } from '@/lib/theme'

// Apply campaign theme
const { setTheme } = useCampaignTheme()

setTheme({
  primary: '#8B5CF6',    // Hex color
  secondary: '#6D28D9',
  preset: 'dark-fantasy' // Optional preset
})
```

### Available Presets

- `default` - Purple/violet theme
- `dark-fantasy` - Deep purple with dark accents
- `high-fantasy` - Bright gold and blue
- `gothic` - Red and black
- `nature` - Green and brown

---

## Shadows & Effects

```tsx
// Fantasy shadows
<div className="shadow-fantasy">Standard fantasy shadow</div>
<div className="shadow-fantasy-lg">Large fantasy shadow</div>
<div className="shadow-glow">Glowing effect</div>
<div className="shadow-gold-glow">Gold glow effect</div>

// Hover effects
<div className="hover:shadow-fantasy-lg transition-shadow">
<div className="hover:shadow-glow transition-shadow">
```

---

## Accessibility

- Always use semantic HTML elements
- Include `aria-label` for icon-only buttons
- Ensure color contrast meets WCAG AA standards
- Support keyboard navigation
- Use `focus-visible` for focus states
- Respect `prefers-reduced-motion`

```tsx
<Button variant="ghost" size="icon" aria-label="Close dialog">
  <X className="h-4 w-4" />
</Button>
```

---

## File Organization

```
src/
├── components/
│   ├── ui/           # Base UI components (Button, Card, Input, etc.)
│   ├── layout/       # Layout components (MainNav, PageHeader, Sidebar)
│   ├── auth/         # Auth components (LoginForm, UserMenu)
│   ├── dice/         # Dice-related components
│   ├── vtt/          # Virtual tabletop components
│   └── characters/   # Character-related components
├── lib/
│   ├── theme/        # Theme system (presets, provider, utilities)
│   └── utils.ts      # Utility functions (cn, etc.)
└── app/
    └── globals.css   # Global styles and CSS variables
```
