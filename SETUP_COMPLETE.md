# Setup Complete! 🎉

Your modern React-based D&D Campaign Manager is ready to use!

## ✅ What's Been Built

### Core System
- **Next.js 15** with App Router and TypeScript
- **Tailwind CSS** with custom purple/pink romantasy theme
- **MDX Support** for writing content in Markdown with React components
- **File-based Routing** - just create `.mdx` files to add pages

### Interactive Features

#### 1. Dice Roller System ✅
- **Floating Widget**: Click the 🎲 button (bottom-right) to open
- **Clickable Dice**: Use `<Dice value="1d20+5" />` in MDX files
- **State Persistence**: Zustand store saves to localStorage
  - Last 50 rolls
  - Favorite formulas
  - Sound preferences
- **Features**:
  - Quick-roll buttons (d20, d4, d6, etc.)
  - Custom formula input
  - Roll history with critical/max damage detection
  - Framer Motion animations

#### 2. Image Lightbox ✅
- **Component**: `<ImageLightbox src="..." alt="..." />`
- **Features**:
  - Click to enlarge in fullscreen
  - Zoom support (scroll to zoom)
  - ESC to close, click outside to close
  - Purple-themed close button
  - Next.js Image optimization

#### 3. Campaign Structure ✅
- Campaign images copied to `public/campaigns/court-of-thorns-mire/img/`
- Directory structure created for all 6 scenes
- Reference folders for monsters and mechanics

## 🚀 Your Site is Running!

**Development Server:** http://localhost:3000

The site is currently running with:
- Homepage with campaign selector
- Interactive features showcase
- Dice widget (try clicking the 🎲 button!)

## 📁 Project Structure

```
dnd-react/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout (includes DiceWidget)
│   │   ├── page.tsx                # Homepage ✅
│   │   ├── globals.css             # Tailwind + custom styles
│   │   └── campaigns/
│   │       └── court-of-thorns-mire/
│   │           ├── page.mdx        # 📝 To create
│   │           ├── scenes/         # 📝 6 scenes to migrate
│   │           └── reference/      # 📝 Monsters & mechanics to migrate
│   ├── components/
│   │   ├── dice/
│   │   │   ├── DiceNotation.tsx    # ✅ Clickable dice
│   │   │   └── DiceWidget.tsx      # ✅ Floating roller
│   │   ├── lightbox/
│   │   │   └── ImageLightbox.tsx   # ✅ Image lightbox
│   │   └── mdx/
│   │       └── MDXComponents.tsx   # ✅ MDX component registry
│   └── lib/
│       ├── stores/
│       │   └── diceStore.ts        # ✅ Zustand state
│       └── utils/
│           └── rollDice.ts         # ✅ Dice logic
├── public/
│   └── campaigns/
│       └── court-of-thorns-mire/
│           └── img/                # ✅ All campaign images
├── README.md                       # ✅ Full documentation
└── package.json
```

## 🎯 Next Steps

### 1. Creating Campaign Content (Super Simple!)

To add the Court of Thorns campaign, you just need to create MDX files. Here's an example:

**Create: `src/app/campaigns/court-of-thorns-mire/page.mdx`**

```mdx
# The Court of Thorns and Mire

A Romantasy one-shot adventure combining combat, puzzles, and heart-wrenching choices.

## Synopsis

Hunt for survival on the snowy northern fringe when a winged creature steals a baron's daughter.
Guided by Seraphine, a disgraced Royal Ranger, venture into Fae-claimed Wastelands.

## Campaign Details

- **Level:** 4
- **Players:** 2-4
- **Duration:** 4-6 hours
- **Genre:** Romantasy, Fae, Romance

## Scenes

1. [The One Bed Trope](./scenes/one-bed-trope)
2. [The Warded Ruins](./scenes/warded-ruins)
3. [The Mire Ambush](./scenes/mire-ambush)
4. [The Whisper of the Sphinx](./scenes/sphinx-riddle)
5. [The Beast and the Bond](./scenes/boss-fight)
6. [The Choice of the Heart](./scenes/aftermath)

[**Start Campaign →**](./scenes/one-bed-trope)
```

**Create: `src/app/campaigns/court-of-thorns-mire/scenes/one-bed-trope/page.mdx`**

```mdx
# Scene 1: The One Bed Trope

<ImageLightbox
  src="/campaigns/court-of-thorns-mire/img/onebed.jpg"
  alt="The One Bed Trope"
  width={800}
  height={600}
/>

You cross the **Iron Bridge** and night quickly falls. Seraphine leads you to a
crumbling hunting shack. There is only one bedroll.

Roll <Dice value="1d20" /> for Perception to notice Fae magic in the area.

Make a <Dice value="DC 13" /> Survival check to prepare shelter.

## DM Guidance

**Inspiration Awards:**
- Lean into tension (charged dialogue): Attraction +1
- Selfless offer (give up bedroll): Trust +1, Attraction +1

---

**Next:** [Scene 2: The Warded Ruins](../warded-ruins)
```

That's it! Just create `.mdx` files and the routing happens automatically.

### 2. Converting from MkDocs

For each `.md` file in your MkDocs campaign:

1. **Copy the file content**
2. **Change extension to `.mdx`**
3. **Replace dice notation:**
   - Find: `(1d4 + 2)` or `+4 to hit`
   - Replace with: `<Dice value="1d4+2" />` or `<Dice value="+4" />`

4. **Replace images:**
   ```mdx
   <!-- Old (MkDocs) -->
   ![Battle Map](../img/map.jpg)

   <!-- New (React) -->
   <ImageLightbox
     src="/campaigns/court-of-thorns-mire/img/map.jpg"
     alt="Battle Map"
     caption="Click to enlarge"
   />
   ```

5. **Update links:**
   ```mdx
   <!-- Old -->
   [Next Scene](scene-02.md)

   <!-- New -->
   [Next Scene](../scene-02)
   ```

### 3. Adding New Campaigns

It's super simple:

```bash
# 1. Create campaign folder
mkdir -p src/app/campaigns/my-new-campaign/scenes

# 2. Add images
mkdir -p public/campaigns/my-new-campaign/img
# Copy your images there

# 3. Create page.mdx
# Write your campaign homepage in MDX

# 4. Create scene files
# Add scenes as page.mdx files in scenes/[scene-name]/
```

Or wait for the CLI tool (coming soon):
```bash
npm run new-campaign
# Interactive prompts will guide you!
```

## 🎨 Customization

### Changing Colors

Edit `tailwind.config.ts`:

```typescript
colors: {
  purple: {
    primary: '#ab47bc',  // Change these!
    dark: '#7b1fa2',
  },
}
```

### Adding Custom Dice

Edit `src/lib/stores/diceStore.ts`:

```typescript
favorites: ['1d20', '1d20+5', '2d6+3', '1d4', '1d8', '3d10+7'], // Add more!
```

### Adding Sound Effects

1. Add `dice-roll.mp3` to `public/sounds/`
2. Uncomment line 15 in `src/components/dice/DiceNotation.tsx`:
   ```typescript
   new Audio('/sounds/dice-roll.mp3').play()
   ```

## 📚 Available Components

### In MDX Files

```mdx
<!-- Dice Roller -->
<Dice value="1d20+5" />
<Dice value="2d6" />
<Dice value="DC 15" />

<!-- Image Lightbox -->
<ImageLightbox
  src="/campaigns/campaign-name/img/image.jpg"
  alt="Description"
  caption="Optional caption"
  width={800}
  height={600}
/>
```

### Coming Soon

```mdx
<!-- Monster Stat Block (to be created) -->
<MonsterStatBlock name="Bogge" cr="1/4" />

<!-- Skill Check (to be created) -->
<SkillCheck dc={15} skill="Dexterity" />

<!-- Admonition Boxes (to be created) -->
<Admonition type="info">
  Important DM note here!
</Admonition>
```

## 🔧 Commands

```bash
# Development
npm run dev          # Start dev server (http://localhost:3000)

# Production
npm run build        # Build for production
npm run start        # Run production server

# Linting
npm run lint         # Check for code issues

# Future
npm run new-campaign # Create new campaign (CLI tool)
```

## 🌐 Deployment

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd /c/Users/chris/git/dnd-react
vercel

# Follow prompts
# Your site will be live at https://your-site.vercel.app
```

### Deploy to GitHub Pages

```bash
# Update next.config.ts
# Set basePath and assetPrefix to your repo name

# Build and export
npm run build

# Push to GitHub
# Enable Pages in repo settings
```

## 🐛 Troubleshooting

### Port 3000 already in use
```bash
# Kill the process or use a different port
npm run dev -- -p 3001
```

### Dice widget not showing
- Make sure you clicked the 🎲 button in the bottom-right
- Check browser console for errors
- Verify `DiceWidget` is imported in `src/app/layout.tsx`

### Images not loading
- Verify images are in `public/campaigns/[campaign-name]/img/`
- Use absolute paths: `/campaigns/...` not `../img/...`
- Check file extensions match (case-sensitive on some servers)

### MDX not rendering
- Ensure file extension is `.mdx` not `.md`
- Check `mdx-components.tsx` exists in project root
- Verify `@next/mdx` is installed

## 📖 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [MDX Documentation](https://mdxjs.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand Documentation](https://docs.pmnd.rs/zustand)
- [Framer Motion](https://www.framer.com/motion/)

## 🎉 Summary

You now have:
- ✅ Modern React-based D&D site
- ✅ Working dice roller with state persistence
- ✅ Image lightbox system
- ✅ MDX support for easy content creation
- ✅ Beautiful purple/pink theme
- ✅ Campaign structure ready to fill
- ✅ Development server running

**Next:** Start creating your campaign content by adding MDX files!

Happy DMing! 🎲🐉
