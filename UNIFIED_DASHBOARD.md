# Unified Dashboard Implementation

## Overview

The DND LazyDM application now features a **Unified Dashboard** that combines the previous separate player dashboard and admin campaign manager into a single, comprehensive interface. This provides a seamless experience for all users, regardless of their role.

## What Changed

### Before
- `/dashboard` - Player-focused view showing only campaigns where user has access
- `/admin` - Admin-only campaign management interface
- Separate, disconnected experiences
- Limited data flow between views
- No SRD integration visibility

### After
- `/dashboard` - **Unified Dashboard** for all users
- `/admin` - Redirects to `/dashboard` (backward compatibility)
- Single source of truth for campaign management
- Comprehensive data aggregation
- SRD status integration
- Role-based access control built-in

## Key Features

### 1. **Comprehensive Campaign Statistics**
The dashboard now loads and displays complete statistics for each campaign:
- **Scene Count** - Number of scenes per campaign
- **Monster Count** - Number of monsters per campaign
- **Character Count** - Number of characters per campaign
- **Aggregate Stats** - Total counts across all campaigns

### 2. **Dual-View Tabs**
- **"My Campaigns"** - Shows only campaigns where user is Owner, DM, or Player
- **"All Campaigns"** - Shows all campaigns (with Admin badge if admin)
  - Includes unassigned campaigns for admins
  - Shows role badges for each campaign

### 3. **Role-Based Access Display**
Each campaign card shows the user's role:
- **Owner** - Purple badge, full admin access
- **DM** - Purple badge, campaign management access
- **Player** - Blue badge, player-level access
- **Admin** - Gray badge, system admin viewing campaign
- **Unassigned (Admin)** - Orange badge, campaign has no owner

### 4. **SRD Integration Banner**
Displays current SRD database status:
- Monster, spell, and item counts
- Last sync time
- Quick link to SRD management interface
- Visibility into reference data availability

### 5. **Quick Actions Bar**
Context-aware buttons for:
- **New Campaign** - Create a new campaign
- **New Scene** - Add scene to first owned campaign (if available)
- **New Monster** - Add monster to first owned campaign (if available)
- **Virtual Tabletop** - Quick access to VTT

### 6. **Enhanced Campaign Cards**
Each campaign card displays:
- **Thumbnail** - Campaign artwork with hover effects
- **Role Badge** - User's role in the campaign
- **Campaign Metadata** - Level, players, genre, description
- **Live Statistics** - Scene/character/monster counts
- **Dual Actions** - "View" (player view) and "Manage" (admin view)

## Data Flow Architecture

### Data Sources
The unified dashboard pulls data from multiple API endpoints:

```typescript
// Campaign metadata and access control
GET /api/campaigns
  → Returns all campaigns with access control info

// Per-campaign statistics (for each campaign)
GET /api/campaigns/[slug]/scenes/list
  → Returns all scenes for campaign

GET /api/campaigns/[slug]/monsters/list
  → Returns all monsters for campaign

GET /api/campaigns/[slug]/characters
  → Returns all characters for campaign

// SRD status
GET /api/srd/sync
  → Returns SRD database sync status and counts
```

### Data Aggregation
All data flows into a unified `CampaignStats[]` array:

```typescript
interface CampaignStats {
  campaign: CampaignMetadata
  role: string  // User's role in this campaign
  scenes: Scene[]
  monsters: Monster[]
  characters: Character[]
  sceneCount: number
  monsterCount: number
  characterCount: number
}
```

### Performance Considerations
- **Parallel Loading** - All campaign stats loaded concurrently
- **Error Isolation** - Failures in one campaign don't break others
- **Graceful Degradation** - Missing data shows as 0 counts
- **Loading States** - Spinner during initial data fetch
- **Error States** - User-friendly error messages with retry

## User Experience Improvements

### For Players
- See all campaigns where they have access
- View their character assignments per campaign
- Quick navigation to campaign player view
- Clear role indicators

### For DMs
- Manage owned campaigns
- See campaign statistics at a glance
- Quick-add scenes and monsters
- Access both player and admin views

### For Admins
- View all campaigns system-wide
- Identify unassigned campaigns
- Manage access control
- Monitor SRD database status

## Technical Implementation

### Component Structure
```
UnifiedDashboard (Client Component)
├── useSession() - NextAuth session management
├── useState() - Local state management
│   ├── campaigns: CampaignStats[]
│   ├── loading: boolean
│   ├── error: string | null
│   ├── activeTab: 'overview' | 'all'
│   └── srdStatus: SRDStatus | null
└── useEffect() - Data loading
    ├── Load campaigns from API
    ├── Determine user roles
    ├── Load stats for each campaign
    └── Load SRD status
```

### State Management
- **Client-side only** - Uses React hooks for state
- **No SSR** - Session-dependent, must run on client
- **Optimistic updates** - Fast UI, background data loading

### Styling
- **Dark theme** - Gray-950 background
- **Purple accents** - Brand color for primary actions
- **Responsive grid** - 1/2/3 columns based on screen size
- **Hover effects** - Scale, shadows, border colors
- **Status colors** - Role-based badge colors

## Routing Changes

### Redirects
- `/admin` → `/dashboard` (client-side redirect)
- Maintains backward compatibility
- Seamless transition for existing users

### URL Structure
```
/dashboard          - Unified dashboard (new)
/admin              - Redirects to dashboard
/admin/campaigns/new            - Still works
/admin/campaigns/[slug]          - Still works (manage view)
/campaigns/[slug]                - Player view
/admin/srd                       - SRD management
```

## Migration Notes

### Breaking Changes
- **None** - All existing routes still functional
- `/admin` now redirects but doesn't break bookmarks
- Campaign management URLs unchanged

### New Features Added
- SRD status visibility
- Aggregate statistics
- Tab-based filtering
- Enhanced campaign cards
- Quick action buttons

### Data Requirements
All existing API endpoints used:
- ✅ `/api/campaigns` - Existing
- ✅ `/api/campaigns/[slug]/scenes/list` - Existing
- ✅ `/api/campaigns/[slug]/monsters/list` - Existing
- ✅ `/api/campaigns/[slug]/characters` - Existing
- ✅ `/api/srd/sync` - New (from SRD feature)

## Future Enhancements

### Potential Additions
1. **Search & Filter** - Search campaigns by name, filter by role
2. **Sorting Options** - Sort by date, name, activity
3. **Recent Activity** - Show recently updated campaigns first
4. **Favorites** - Star/pin frequently accessed campaigns
5. **Bulk Actions** - Select multiple campaigns for operations
6. **Campaign Templates** - Create campaigns from templates
7. **Statistics Graphs** - Visual charts for campaign growth
8. **Activity Timeline** - Recent scenes, characters, monsters added

### Performance Optimizations
1. **Caching** - Cache campaign stats client-side
2. **Pagination** - Lazy load campaigns if count > 50
3. **Virtual Scrolling** - For large campaign lists
4. **Background Sync** - Refresh stats in background

## Testing

### Manual Test Checklist
- [ ] Dashboard loads without errors
- [ ] Campaign cards display correctly
- [ ] Statistics show accurate counts
- [ ] Tab switching works (My Campaigns / All Campaigns)
- [ ] Role badges display correctly
- [ ] SRD status banner shows correct data
- [ ] Quick action buttons link correctly
- [ ] "View" button opens campaign player view
- [ ] "Manage" button opens campaign admin view (if authorized)
- [ ] Admin redirect works (/admin → /dashboard)
- [ ] Responsive layout works on mobile
- [ ] Loading states display properly
- [ ] Error states handle failures gracefully

### User Roles to Test
- [ ] Unauthenticated user → Redirected to login
- [ ] Player with no campaigns → Empty state
- [ ] Player with 1+ campaigns → Shows campaigns
- [ ] DM with owned campaigns → Shows owner badge and manage button
- [ ] Admin user → Sees "All Campaigns (Admin)" tab
- [ ] Admin user → Sees unassigned campaigns

## Deployment

### Docker Build
The unified dashboard is included in the latest Docker build:
```bash
docker compose build
docker compose up -d
```

### Access
- Production: http://localhost:3010/dashboard
- Development: http://localhost:3000/dashboard

### Environment Variables
No new environment variables required. Uses existing:
- `NEXTAUTH_URL` - For authentication
- `NEXTAUTH_SECRET` - For session management

## Support

### Troubleshooting

**Dashboard shows no campaigns**
- Check that campaigns exist in `src/app/campaigns/`
- Verify `campaign.json` files are valid
- Check access control settings

**Statistics show 0 for all counts**
- Verify API endpoints are accessible
- Check browser console for errors
- Ensure campaign files have correct structure

**SRD banner not showing**
- SRD database may not be initialized
- Visit `/admin/srd` to initialize
- Check `/api/srd/sync` endpoint

**Role badges incorrect**
- Verify `access` field in `campaign.json`
- Check user ID matches in access control
- Confirm admin status in user data

## Summary

The unified dashboard successfully combines player and admin views into a single, comprehensive interface. It provides:

✅ **Enhanced Data Flow** - All campaign statistics loaded and displayed
✅ **SRD Integration** - Reference database status visible
✅ **Role-Based UI** - Appropriate actions for each user role
✅ **Improved UX** - Single location for all campaign management
✅ **Backward Compatible** - No breaking changes to existing features

**Access your new unified dashboard at:**
http://localhost:3010/dashboard
