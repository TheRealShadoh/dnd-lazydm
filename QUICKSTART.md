# Quick Start Guide

Get your D&D LazyDM up and running in 5 minutes.

## Prerequisites

- Node.js 20+ installed
- npm or yarn
- Git

## Development Setup

### 1. Clone and Install

```bash
git clone https://github.com/TheRealShadoh/dnd-lazydm.git
cd dnd-lazydm
npm install
```

### 2. Configure Environment (Optional)

For local development, D&D Beyond integration is optional:

```bash
cp .env.example .env.local
# Edit .env.local if you want D&D Beyond integration
```

### 3. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

### 4. Explore the App

- **Homepage** - Campaign selector
- **Admin Panel** - http://localhost:3000/admin (create campaigns, scenes, monsters)
- **VTT** - Virtual Tabletop for battle maps
- **Dice Roller** - Click the 🎲 button (bottom-right)

## Creating Your First Campaign

### Option 1: Use the Admin UI

1. Go to http://localhost:3000/admin
2. Click "New Campaign"
3. Fill in campaign details
4. Add scenes and monsters

### Option 2: Use the CLI (Coming Soon)

```bash
npm run new-campaign
```

## Project Structure

```
dnd-lazydm/
├── src/
│   ├── app/                    # Next.js pages and API routes
│   │   ├── campaigns/          # Campaign content (MDX)
│   │   ├── admin/              # Admin interface
│   │   ├── api/                # API endpoints
│   │   └── vtt/                # Virtual Tabletop
│   ├── components/             # React components
│   └── lib/                    # Utilities and stores
├── public/
│   └── campaigns/              # Campaign images
└── package.json
```

## Common Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Run production build
npm run lint         # Run ESLint
```

## Adding Content

### Create a New Campaign

1. Admin Panel → New Campaign
2. Or manually create: `src/app/campaigns/my-campaign/`
3. Add `campaign.json` with metadata
4. Create `page.mdx` for campaign homepage

### Add a Scene

1. Admin Panel → Your Campaign → Add Scene
2. Or create: `src/app/campaigns/my-campaign/scenes/scene-name/page.mdx`

### Add Campaign Images

Place images in: `public/campaigns/my-campaign/img/`

## Features Overview

### Dice Roller
- Click any dice notation to roll (e.g., 1d20, 2d6+3)
- Right-click for advantage/disadvantage
- History persisted in localStorage

### Virtual Tabletop (VTT)
- Drag battle maps from campaign images
- Create tokens (monsters, players)
- Track HP, AC, initiative
- Measure distances
- Auto-saves to localStorage

### D&D Beyond Integration
- Import characters via CobaltSession cookie
- Sync character data
- PDF character sheet import

### Campaign Management
- Multiple campaigns
- MDX-based content (Markdown + React)
- Custom themes per campaign
- Scene navigation

## Troubleshooting

### Port 3000 already in use
```bash
lsof -i :3000          # Find process
kill -9 <PID>          # Kill it
# Or use different port:
npm run dev -- -p 3001
```

### Images not loading
- Check path: `/campaigns/campaign-name/img/filename.jpg`
- Verify file is in `public/campaigns/`

### Dice widget not showing
- Click the 🎲 button in bottom-right corner
- Check browser console for errors

### Build errors
```bash
rm -rf .next node_modules
npm install
npm run build
```

## Next Steps

- Read `README.md` for detailed features
- Check `PRODUCTION_AUDIT.md` before deploying
- See `DEPLOY.md` for deployment guide

## ⚠️ Important Notes

**For Local Development:** This setup is fine.

**For Production:** You MUST:
1. Read `SECURITY_NOTICE.md`
2. Implement authentication
3. Review `PRODUCTION_AUDIT.md`
4. Follow `DEPLOY.md` checklist

## Getting Help

- Check the documentation files
- Review example campaigns in `src/app/campaigns/`
- Create an issue on GitHub

## What's Next?

1. Create your first campaign
2. Import your D&D Beyond characters (optional)
3. Add scenes and monsters
4. Test the VTT with a battle map
5. Run your first session!

---

Happy DMing! 🎲🐉
