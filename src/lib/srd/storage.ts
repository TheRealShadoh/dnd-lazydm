/**
 * SRD Data Storage Layer
 * Handles file system operations for SRD database
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import {
  SRDDatabase,
  SRDDataType,
  SRDMonster,
  SRDRace,
  SRDClass,
  SRDSpell,
  SRDItem,
  SRDBackgroundOption,
  SRDMetadata,
} from './models';

const SRD_DATA_DIR = join(process.cwd(), 'src', 'data', 'srd');
const OFFICIAL_DIR = join(SRD_DATA_DIR, 'official');
const CUSTOM_DIR = join(SRD_DATA_DIR, 'custom');

// Ensure directories exist
function ensureDirectories() {
  try {
    mkdirSync(OFFICIAL_DIR, { recursive: true });
    mkdirSync(CUSTOM_DIR, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
}

// Get file path for a data type
function getFilePath(type: SRDDataType, source: 'official' | 'custom'): string {
  const dir = source === 'official' ? OFFICIAL_DIR : CUSTOM_DIR;
  return join(dir, `${type}.json`);
}

// Get metadata file path
function getMetadataPath(): string {
  return join(OFFICIAL_DIR, 'metadata.json');
}

// Read JSON file safely
function readJSONFile<T>(filePath: string, defaultValue: T): T {
  try {
    const content = readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return defaultValue;
  }
}

// Write JSON file
function writeJSONFile<T>(filePath: string, data: T): void {
  ensureDirectories();
  writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// Initialize empty database structure
function initializeEmptyDatabase(): SRDDatabase {
  return {
    monsters: { official: [], custom: [] },
    races: { official: [], custom: [] },
    classes: { official: [], custom: [] },
    spells: { official: [], custom: [] },
    items: { official: [], custom: [] },
    backgrounds: { official: [], custom: [] },
    metadata: {
      lastSyncDate: new Date().toISOString(),
      lastSyncTimestamp: Date.now(),
      apiVersion: '1.0',
      sourceUrl: 'https://api.open5e.com',
      officialEntryCount: {
        monsters: 0,
        races: 0,
        classes: 0,
        spells: 0,
        items: 0,
        backgrounds: 0,
      },
      customEntryCount: {
        monsters: 0,
        races: 0,
        classes: 0,
        spells: 0,
        items: 0,
        backgrounds: 0,
      },
    },
  };
}

// Load entire SRD database
export function loadSRDDatabase(): SRDDatabase {
  ensureDirectories();

  const db = initializeEmptyDatabase();

  // Load official data
  const officialMonsters = readJSONFile<SRDMonster[]>(
    getFilePath('monsters', 'official'),
    []
  );
  const officialRaces = readJSONFile<SRDRace[]>(
    getFilePath('races', 'official'),
    []
  );
  const officialClasses = readJSONFile<SRDClass[]>(
    getFilePath('classes', 'official'),
    []
  );
  const officialSpells = readJSONFile<SRDSpell[]>(
    getFilePath('spells', 'official'),
    []
  );
  const officialItems = readJSONFile<SRDItem[]>(
    getFilePath('items', 'official'),
    []
  );
  const officialBackgrounds = readJSONFile<SRDBackgroundOption[]>(
    getFilePath('backgrounds', 'official'),
    []
  );

  // Load custom data
  const customMonsters = readJSONFile<SRDMonster[]>(
    getFilePath('monsters', 'custom'),
    []
  );
  const customRaces = readJSONFile<SRDRace[]>(
    getFilePath('races', 'custom'),
    []
  );
  const customClasses = readJSONFile<SRDClass[]>(
    getFilePath('classes', 'custom'),
    []
  );
  const customSpells = readJSONFile<SRDSpell[]>(
    getFilePath('spells', 'custom'),
    []
  );
  const customItems = readJSONFile<SRDItem[]>(
    getFilePath('items', 'custom'),
    []
  );
  const customBackgrounds = readJSONFile<SRDBackgroundOption[]>(
    getFilePath('backgrounds', 'custom'),
    []
  );

  // Load metadata
  const metadata = readJSONFile<SRDMetadata>(
    getMetadataPath(),
    db.metadata
  );

  return {
    monsters: { official: officialMonsters, custom: customMonsters },
    races: { official: officialRaces, custom: customRaces },
    classes: { official: officialClasses, custom: customClasses },
    spells: { official: officialSpells, custom: customSpells },
    items: { official: officialItems, custom: customItems },
    backgrounds: { official: officialBackgrounds, custom: customBackgrounds },
    metadata,
  };
}

// Save entire SRD database
export function saveSRDDatabase(db: SRDDatabase): void {
  writeJSONFile(getFilePath('monsters', 'official'), db.monsters.official);
  writeJSONFile(getFilePath('races', 'official'), db.races.official);
  writeJSONFile(getFilePath('classes', 'official'), db.classes.official);
  writeJSONFile(getFilePath('spells', 'official'), db.spells.official);
  writeJSONFile(getFilePath('items', 'official'), db.items.official);
  writeJSONFile(getFilePath('backgrounds', 'official'), db.backgrounds.official);

  writeJSONFile(getFilePath('monsters', 'custom'), db.monsters.custom);
  writeJSONFile(getFilePath('races', 'custom'), db.races.custom);
  writeJSONFile(getFilePath('classes', 'custom'), db.classes.custom);
  writeJSONFile(getFilePath('spells', 'custom'), db.spells.custom);
  writeJSONFile(getFilePath('items', 'custom'), db.items.custom);
  writeJSONFile(getFilePath('backgrounds', 'custom'), db.backgrounds.custom);

  writeJSONFile(getMetadataPath(), db.metadata);
}

// Save specific data type
export function saveDataType<T>(
  type: SRDDataType,
  source: 'official' | 'custom',
  data: T[]
): void {
  writeJSONFile(getFilePath(type, source), data);
}

// Add entry to custom data
export function addCustomEntry<T extends { id?: string; createdAt?: string; updatedAt?: string }>(
  type: SRDDataType,
  entry: T
): void {
  const db = loadSRDDatabase();
  const now = new Date().toISOString();

  const customData = (db as any)[type].custom as T[];
  const newEntry = {
    ...entry,
    id: entry.id || `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: entry.createdAt || now,
    updatedAt: now,
  } as T;

  customData.push(newEntry);
  saveDataType(type, 'custom', customData);

  // Update counts
  db.metadata.customEntryCount[type] += 1;
  writeJSONFile(getMetadataPath(), db.metadata);
}

// Remove custom entry
export function removeCustomEntry(type: SRDDataType, entryId: string): void {
  const db = loadSRDDatabase();
  const customData = (db as Record<SRDDataType, { custom: any[] }>)[type].custom;

  const index = customData.findIndex((e) => e.id === entryId);
  if (index !== -1) {
    customData.splice(index, 1);
    saveDataType(type, 'custom', customData);

    // Update counts
    db.metadata.customEntryCount[type] = Math.max(0, db.metadata.customEntryCount[type] - 1);
    writeJSONFile(getMetadataPath(), db.metadata);
  }
}

// Update custom entry
export function updateCustomEntry<T extends { id?: string; updatedAt?: string }>(
  type: SRDDataType,
  entryId: string,
  updates: Partial<T>
): void {
  const db = loadSRDDatabase();
  const customData = (db as any)[type].custom as T[];

  const entry = customData.find((e) => e.id === entryId);
  if (entry) {
    Object.assign(entry, { ...updates, updatedAt: new Date().toISOString() });
    saveDataType(type, 'custom', customData);
  }
}

// Get all entries of a type (both official and custom)
export function getAllEntries<T>(type: SRDDataType): { official: T[]; custom: T[] } {
  const db = loadSRDDatabase();
  return (db as any)[type] as { official: T[]; custom: T[] };
}

// Search entries across both sources
export function searchEntries<T extends { name: string }>(
  type: SRDDataType,
  query: string
): { official: T[]; custom: T[] } {
  const { official, custom } = getAllEntries<T>(type);
  const lowerQuery = query.toLowerCase();

  return {
    official: official.filter((e) =>
      e.name.toLowerCase().includes(lowerQuery)
    ),
    custom: custom.filter((e) =>
      e.name.toLowerCase().includes(lowerQuery)
    ),
  };
}

// Update metadata
export function updateMetadata(updates: Partial<SRDMetadata>): void {
  const db = loadSRDDatabase();
  db.metadata = { ...db.metadata, ...updates };
  writeJSONFile(getMetadataPath(), db.metadata);
}

// Get metadata
export function getMetadata(): SRDMetadata {
  const db = loadSRDDatabase();
  return db.metadata;
}
