# DM Campaign Manager - React/Next.js Version

A modern React-based D&D campaign management system built with Next.js, TypeScript, and Tailwind CSS.

## Features

✅ **Implemented:**
- Modern Next.js 15 with App Router
- TypeScript for type safety
- Tailwind CSS with custom purple/pink theme
- Dice Roller system with Zustand state management
  - Clickable dice notation (`<Dice value="1d20+5" />`)
  - Floating dice widget with history
  - Persistent state (localStorage)
  - Critical and max damage detection
- Image Lightbox with zoom support
- MDX support for content (Markdown + JSX components)
- Dark mode by default
- Responsive design

🚧 **In Progress:**
- Court of Thorns & Mire campaign migration
- Additional MDX components (MonsterStatBlock, SkillCheck, Admonition)
- Relationship tracker for Romantasy mechanics
- Campaign creation CLI tool

## Project Structure

```
dnd-react/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout + DiceWidget
│   │   ├── page.tsx            # Homepage (campaign selector)
│   │   └── campaigns/
│   │       └── court-of-thorns-mire/
│   │           ├── page.mdx    # Campaign homepage
│   │           ├── scenes/     # Scene files (MDX)
│   │           └── reference/  # Monsters, mechanics
│   ├── components/
│   │   ├── dice/
│   │   │   ├── DiceNotation.tsx   # Clickable dice component
│   │   │   └── DiceWidget.tsx     # Floating dice roller
│   │   ├── lightbox/
│   │   │   └── ImageLightbox.tsx  # Image lightbox wrapper
│   │   └── mdx/
│   │       └── MDXComponents.tsx  # MDX component registry
│   └── lib/
│       ├── stores/
│       │   └── diceStore.ts       # Zustand dice state
│       └── utils/
│           └── rollDice.ts        # Dice rolling logic
├── public/
│   └── campaigns/
│       └── court-of-thorns-mire/
│           └── img/               # Campaign images
├── next.config.ts                 # Next.js config + MDX
├── tailwind.config.ts             # Tailwind + purple theme
└── package.json
```

## Getting Started

### Install Dependencies

```bash
cd /c/Users/chris/git/dnd-react
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Tech Stack

- **Framework:** Next.js 15 (React 18)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Custom CSS
- **State Management:** Zustand
- **Content:** MDX (Markdown + JSX)
- **Image Lightbox:** yet-another-react-lightbox
- **Animations:** Framer Motion

## Usage

### Adding Dice Notation in MDX

```mdx
Roll <Dice value="1d20+5" /> for attack!

The damage is <Dice value="2d6+3" />.
```

### Adding Images with Lightbox

```mdx
<ImageLightbox
  src="/campaigns/court-of-thorns-mire/img/onebed.jpg"
  alt="The One Bed Trope"
  caption="Click to enlarge"
  width={800}
  height={600}
/>
```

### Dice Widget Features

- Click the 🎲 button (bottom-right) to open the dice roller
- Quick-roll buttons for common dice (d20, d4, d6, etc.)
- Custom formula input (supports XdY+Z format)
- Roll history (last 50 rolls, persisted in localStorage)
- Critical and max damage detection
- Sound toggle (sound files not yet implemented)

## Next Steps

1. **Complete Campaign Migration:**
   - Migrate all 6 scenes from MkDocs to MDX
   - Convert monster stat blocks
   - Convert romantasy mechanics reference

2. **Create Additional MDX Components:**
   - `<MonsterStatBlock>` - Pre-formatted stat blocks
   - `<SkillCheck>` - DC check formatting
   - `<Admonition>` - Info/warning/tip boxes
   - `<RelationshipTracker>` - DM tool for tracking NPC relationships

3. **Build Campaign Creation CLI:**
   - `npm run new-campaign` command
   - Interactive prompts for campaign details
   - Auto-generate folder structure and template files

4. **Add Relationship Tracking:**
   - Zustand store for NPC relationships
   - UI for DMs to track trust/attraction scores
   - Export/import functionality

5. **Polish & Deploy:**
   - Add dice sound effects
   - Optimize images
   - Deploy to Vercel
   - Update documentation

## Migrating from MkDocs

### Key Differences

| Feature | MkDocs | Next.js React |
|---------|--------|---------------|
| Content Format | Markdown | MDX (Markdown + JSX) |
| Dice Notation | Auto-detected with JS | `<Dice value="1d20" />` component |
| Images | `![](path)` | `<ImageLightbox src="path" />` |
| Navigation | YAML config | File-based routing |
| State | Custom localStorage JS | Zustand stores |

### Migration Process

1. Copy campaign images to `public/campaigns/[campaign-name]/img/`
2. Create campaign folder in `src/app/campaigns/[campaign-name]/`
3. Convert `.md` files to `.mdx`
4. Replace dice notation with `<Dice>` components
5. Replace images with `<ImageLightbox>` components
6. Test in dev server

## File Naming Conventions

- Routes use kebab-case: `one-bed-trope`, `warded-ruins`
- Components use PascalCase: `DiceNotation.tsx`, `ImageLightbox.tsx`
- Utilities use camelCase: `rollDice.ts`, `parseDiceFormula.ts`

## Contributing

This is a personal DM tool. For questions or suggestions, see the original MkDocs version at `/c/Users/chris/git/dnd-mkdocs`.

## License

MIT
