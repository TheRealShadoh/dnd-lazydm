# SRD Reference Builder Implementation

## Overview

The SRD Reference Builder is a comprehensive system for managing D&D 5e reference data (Systems Reference Document). It provides:

1. **Official Data**: Fetches official D&D 5e data from the Open5e API
2. **Custom Data**: Allows adding custom monsters, spells, items, races, classes, and backgrounds
3. **Unified System**: All player and monster creation uses the same underlying SRD database
4. **Search & Filter**: Full-text search across all data
5. **Management Interface**: Admin panel for viewing, syncing, and managing SRD data

## Architecture

### Core Components

#### `/src/lib/srd/models.ts`
TypeScript interfaces for all SRD data types:
- `SRDMonster`: Monster stat blocks with abilities, actions, traits
- `SRDRace`: Race definitions with ability bonuses, languages
- `SRDClass`: Class definitions with hit dice, proficiencies
- `SRDSpell`: Spell data with level, components, descriptions
- `SRDItem`: Equipment, weapons, armor
- `SRDBackgroundOption`: Character backgrounds
- `SRDDatabase`: Complete database structure with official + custom entries

#### `/src/lib/srd/schemas.ts`
Zod validation schemas for all data types. Ensures data integrity on create/update operations.

#### `/src/lib/srd/storage.ts`
File-based storage layer:
- Load/save SRD database from `src/data/srd/`
- Separate directories for official and custom data
- Functions for adding, updating, removing entries
- Search functionality across all data types

#### `/src/lib/srd/api-client.ts`
Open5e API integration:
- Fetches official monsters, races, classes, spells, items, backgrounds
- Converts Open5e API format to SRD format
- Handles pagination and rate limiting

#### `/src/lib/srd/sync.ts`
Data synchronization manager:
- Full sync of all official data from Open5e
- Incremental sync for specific data types
- Tracks last sync date and metadata
- Automatic sync on first initialization

### API Routes

#### `GET /api/srd`
Search and list SRD entries.

**Parameters:**
- `type` (required): One of `monsters`, `races`, `classes`, `spells`, `items`, `backgrounds`
- `query` (optional): Search query
- `source` (optional): `official`, `custom`, or `all` (default: `all`)
- `limit` (optional): Max results (default: 100, max: 1000)

**Example:**
```bash
GET /api/srd?type=monsters&query=dragon&source=official
GET /api/srd?type=spells&query=fireball&limit=50
```

#### `POST /api/srd/sync`
Trigger a sync from Open5e API.

**Body:**
```json
{
  "type": "monsters",  // optional - sync specific type
  "force": true         // optional - force sync even if recent
}
```

**Response:**
```json
{
  "success": true,
  "timestamp": "2025-11-26T10:30:00.000Z",
  "message": "SRD data synced successfully",
  "counts": {
    "monsters": 2547,
    "races": 45,
    "classes": 13,
    "spells": 567,
    "items": 234,
    "backgrounds": 30
  }
}
```

#### `GET /api/srd/sync`
Get current sync status.

**Response:**
```json
{
  "lastSyncDate": "2025-11-26T10:30:00.000Z",
  "ageHours": 2,
  "needsSync": false,
  "counts": { "monsters": 2547, ... },
  "customCounts": { "monsters": 5, ... }
}
```

#### `POST /api/srd/custom`
Add a new custom entry.

**Body:**
```json
{
  "type": "monsters",
  "entry": {
    "name": "Custom Dragon",
    "ac": 18,
    "hp": 200,
    "speed": "40 ft., fly 80 ft.",
    "abilities": {
      "strength": 20,
      "dexterity": 14,
      "constitution": 18,
      "intelligence": 16,
      "wisdom": 15,
      "charisma": 18
    },
    "challengeRating": 13,
    "traits": [...],
    "actions": [...]
  }
}
```

#### `PUT /api/srd/custom?id=xxx&type=monsters`
Update an existing custom entry.

#### `DELETE /api/srd/custom?id=xxx&type=monsters`
Delete a custom entry.

#### `POST /api/srd/init`
Initialize the SRD database (fetches all official data).

#### `GET /api/srd/init`
Check if SRD database is initialized.

### Frontend Hooks

#### `useSRDData<T>(type)`
Generic hook for searching SRD data.

```typescript
const { results, loading, error, search } = useSRDData('monsters');

// Initial search for "dragon"
await search('dragon');

// Later, search for something else
await search('goblin', 'custom');
```

#### `useMonsters()`, `useRaces()`, `useClasses()`, `useSpells()`, `useItems()`, `useBackgrounds()`
Specialized hooks for each data type.

```typescript
const { results, loading, error, search } = useMonsters();
await search('dragon');

if (results) {
  const allMonsters = [...results.official, ...results.custom];
}
```

#### `useSRDSync()`
Hook for syncing SRD data.

```typescript
const { sync, checkStatus, syncing, syncError, lastSync } = useSRDSync();

// Trigger sync
await sync(false);

// Check status
const status = await checkStatus();
```

#### `useSRDCustomEntry(type)`
Hook for managing custom entries.

```typescript
const { add, update, remove, loading, error } = useSRDCustomEntry('monsters');

// Add custom monster
await add({
  name: "Custom Creature",
  ac: 15,
  hp: 50,
  // ... other fields
});

// Update
await update(entryId, { name: "Updated Name" });

// Remove
await remove(entryId);
```

### UI Components

#### `<SRDSelector />`
Generic component for selecting from SRD data.

**Props:**
- `type`: Data type (`monsters`, `races`, etc.)
- `value`: Currently selected value
- `onChange`: Callback with (selectedName, selectedData)
- `placeholder`: Placeholder text
- `includeCustom`: Include custom entries (default: true)
- `searchable`: Enable search (default: true)

**Usage:**
```tsx
const [selectedRace, setSelectedRace] = useState('');

<SRDSelector
  type="races"
  value={selectedRace}
  onChange={(name, data) => {
    setSelectedRace(name);
    applyRaceAbilities(data);
  }}
/>
```

### Admin Interface

#### `/admin/srd`
SRD management dashboard:
- View sync status and metadata
- Trigger manual syncs
- Browse all official and custom entries
- See data counts per type

## Integration with Monster/Player Creation

### Monster Creation
The monster creation system now:
1. Accepts either a new custom monster or references an existing SRD monster
2. Creates/updates custom monsters in the SRD database
3. Generates MDX content for the campaign

**New fields:**
- `fromSRD`: (boolean) Use an existing SRD monster
- `srdMonsterName`: (string) Name of SRD monster to use

### Player Creation
The player creation system can now:
1. Reference SRD races via `<SRDSelector type="races" />`
2. Reference SRD classes via `<SRDSelector type="classes" />`
3. Reference SRD backgrounds via `<SRDSelector type="backgrounds" />`
4. Search for spells from SRD via `<SRDSelector type="spells" />`

## Data Storage

### Directory Structure
```
src/data/srd/
├── official/
│   ├── monsters.json      # 2500+ official monsters
│   ├── races.json         # 45+ official races
│   ├── classes.json       # 13 official classes
│   ├── spells.json        # 500+ official spells
│   ├── items.json         # 1000+ official items
│   ├── backgrounds.json   # 30+ official backgrounds
│   └── metadata.json      # Sync status, counts, timestamps
└── custom/
    ├── monsters.json      # User-created monsters
    ├── races.json
    ├── classes.json
    ├── spells.json
    ├── items.json
    └── backgrounds.json
```

### Data Format
Each entry includes:
- `id`: Unique identifier (auto-generated or `open5e_slug`)
- `name`: Display name
- `source`: `'official'` or `'custom'`
- `createdAt`: ISO timestamp
- `updatedAt`: ISO timestamp
- Type-specific fields (abilities, traits, actions, etc.)

## Usage Examples

### Syncing Official Data
```typescript
// On first app load
const { sync } = useSRDSync();
await sync(false); // Sync only if older than 7 days

// Or force a fresh sync
await sync(true);
```

### Creating a Custom Monster
```typescript
const { add } = useSRDCustomEntry('monsters');

await add({
  name: "Rust Monster",
  ac: 14,
  hp: 27,
  speed: "40 ft.",
  abilities: {
    strength: 13,
    dexterity: 15,
    constitution: 13,
    intelligence: 2,
    wisdom: 12,
    charisma: 6
  },
  challengeRating: 1/8,
  traits: [
    {
      name: "Antennae",
      description: "The rust monster's antennae detect the scent of metal at a distance of 30 feet."
    }
  ],
  actions: [
    {
      name: "Bite",
      description: "Melee Weapon Attack: +3 to hit, reach 5 ft., one target. Hit: 5 (1d8 + 1) piercing damage."
    }
  ]
});
```

### Adding Race to Character
```tsx
function CharacterCreation() {
  const [selectedRace, setSelectedRace] = useState('');
  const [raceData, setRaceData] = useState(null);

  return (
    <>
      <SRDSelector
        type="races"
        value={selectedRace}
        onChange={(name, data) => {
          setSelectedRace(name);
          setRaceData(data);
          // Apply race bonuses to ability scores
        }}
      />
    </>
  );
}
```

### Searching and Listing Data
```typescript
const { results, search } = useSRDData('spells');

// Search for wizard spells
await search('', 'official'); // Get all official spells
const wizardSpells = results.official.filter(s =>
  s.classes?.includes('Wizard')
);
```

## Future Enhancements

1. **Advanced Search**: Add filters for CR, spell level, ability requirements
2. **Import/Export**: Export custom entries as JSON
3. **Versioning**: Track changes to custom entries
4. **Favorites**: Save frequently-used entries
5. **Integration**: Link SRD data to campaign encounters
6. **PDF Export**: Generate character sheets with SRD data
7. **Translations**: Support multiple languages
8. **API Alternatives**: Support other D&D 5e APIs (D&D Beyond API, etc.)

## Troubleshooting

### Sync Fails
- Check internet connection
- Verify Open5e API is accessible
- Check logs for rate limiting errors
- Try force sync: `await sync(true)`

### Data Not Appearing
- Ensure SRD is initialized: `GET /api/srd/init`
- Check sync status: `GET /api/srd/sync`
- Verify search query: `GET /api/srd?type=monsters&query=test`

### Custom Entries Not Saved
- Verify authentication is working
- Check that entry passes validation: `POST /api/srd/custom`
- Check file permissions in `src/data/srd/`

## API Response Examples

### Search Results
```json
{
  "type": "monsters",
  "query": "dragon",
  "source": "all",
  "total": 42,
  "returned": 20,
  "results": [
    {
      "id": "open5e_ancient-black-dragon",
      "name": "Ancient Black Dragon",
      "source": "official",
      "ac": 22,
      "hp": 367,
      "speed": "40 ft., fly 80 ft., swim 40 ft.",
      "abilities": { ... },
      "challengeRating": 21,
      "traits": [...],
      "actions": [...]
    }
  ]
}
```

### Sync Response
```json
{
  "success": true,
  "timestamp": "2025-11-26T10:30:00.000Z",
  "message": "SRD data synced successfully from Open5e API",
  "counts": {
    "monsters": 2547,
    "races": 45,
    "classes": 13,
    "spells": 567,
    "items": 1234,
    "backgrounds": 30
  }
}
```

## Security

- All SRD modification endpoints require authentication
- Custom entries are marked with `source: 'custom'`
- Data validation using Zod schemas prevents invalid entries
- File system access is restricted to designated SRD directory
