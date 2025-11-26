/**
 * SRD Data Sync Manager
 * Coordinates fetching, caching, and updating SRD data
 */

import { SRDDatabase } from './models';
import * as apiClient from './api-client';
import * as storage from './storage';

interface SyncResult {
  success: boolean;
  timestamp: string;
  message: string;
  counts?: {
    monsters: number;
    races: number;
    classes: number;
    spells: number;
    items: number;
    backgrounds: number;
  };
  error?: string;
}

// Check if sync is needed (e.g., older than 7 days)
function shouldSync(db: SRDDatabase, maxAgeHours: number = 168): boolean {
  const now = Date.now();
  const lastSync = db.metadata.lastSyncTimestamp;
  const ageHours = (now - lastSync) / (1000 * 60 * 60);

  return ageHours > maxAgeHours || db.metadata.officialEntryCount.monsters === 0;
}

// Full sync from Open5e API
export async function syncSRDData(forceSync: boolean = false): Promise<SyncResult> {
  try {
    const db = storage.loadSRDDatabase();

    if (!forceSync && !shouldSync(db)) {
      return {
        success: true,
        timestamp: new Date().toISOString(),
        message: 'SRD data is up-to-date. No sync needed.',
        counts: db.metadata.officialEntryCount,
      };
    }

    console.log('Starting SRD data sync...');

    // Fetch all official data from Open5e
    const officialData = await apiClient.fetchAllOfficialData();

    // Update database with official data
    db.monsters.official = officialData.monsters;
    db.races.official = officialData.races;
    db.classes.official = officialData.classes;
    db.spells.official = officialData.spells;
    db.items.official = officialData.items;
    db.backgrounds.official = officialData.backgrounds;

    // Update metadata
    const now = new Date().toISOString();
    db.metadata.lastSyncDate = now;
    db.metadata.lastSyncTimestamp = Date.now();
    db.metadata.officialEntryCount = {
      monsters: officialData.monsters.length,
      races: officialData.races.length,
      classes: officialData.classes.length,
      spells: officialData.spells.length,
      items: officialData.items.length,
      backgrounds: officialData.backgrounds.length,
    };

    // Save updated database
    storage.saveSRDDatabase(db);

    return {
      success: true,
      timestamp: now,
      message: 'SRD data synced successfully from Open5e API',
      counts: db.metadata.officialEntryCount,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('SRD sync failed:', errorMessage);

    return {
      success: false,
      timestamp: new Date().toISOString(),
      message: 'Failed to sync SRD data',
      error: errorMessage,
    };
  }
}

// Incremental sync for a specific data type
export async function syncDataType(
  type: 'monsters' | 'races' | 'classes' | 'spells' | 'items' | 'backgrounds'
): Promise<SyncResult> {
  try {
    const db = storage.loadSRDDatabase();

    let count = 0;
    switch (type) {
      case 'monsters': {
        const data = await apiClient.fetchMonsters();
        db.monsters.official = data;
        count = data.length;
        break;
      }
      case 'races': {
        const data = await apiClient.fetchRaces();
        db.races.official = data;
        count = data.length;
        break;
      }
      case 'classes': {
        const data = await apiClient.fetchClasses();
        db.classes.official = data;
        count = data.length;
        break;
      }
      case 'spells': {
        const data = await apiClient.fetchSpells();
        db.spells.official = data;
        count = data.length;
        break;
      }
      case 'items': {
        const weapons = await apiClient.fetchWeapons();
        const armor = await apiClient.fetchArmor();
        db.items.official = [...weapons, ...armor];
        count = db.items.official.length;
        break;
      }
      case 'backgrounds': {
        const data = await apiClient.fetchBackgrounds();
        db.backgrounds.official = data;
        count = data.length;
        break;
      }
    }

    // Update metadata
    const now = new Date().toISOString();
    db.metadata.lastSyncDate = now;
    db.metadata.lastSyncTimestamp = Date.now();
    db.metadata.officialEntryCount[type] = count;

    // Save updated database
    storage.saveSRDDatabase(db);

    return {
      success: true,
      timestamp: now,
      message: `${type} synced successfully`,
      counts: db.metadata.officialEntryCount,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Failed to sync ${type}:`, errorMessage);

    return {
      success: false,
      timestamp: new Date().toISOString(),
      message: `Failed to sync ${type}`,
      error: errorMessage,
    };
  }
}

// Get sync status
export function getSyncStatus() {
  const db = storage.loadSRDDatabase();
  const now = Date.now();
  const lastSync = db.metadata.lastSyncTimestamp;
  const ageHours = Math.round((now - lastSync) / (1000 * 60 * 60));

  return {
    lastSyncDate: db.metadata.lastSyncDate,
    ageHours,
    needsSync: shouldSync(db),
    counts: db.metadata.officialEntryCount,
    customCounts: db.metadata.customEntryCount,
  };
}

// Initialize SRD database (called on first setup)
export async function initializeSRDDatabase(): Promise<SyncResult> {
  const db = storage.loadSRDDatabase();

  if (db.metadata.officialEntryCount.monsters > 0) {
    return {
      success: true,
      timestamp: new Date().toISOString(),
      message: 'SRD database already initialized',
      counts: db.metadata.officialEntryCount,
    };
  }

  return syncSRDData(true);
}
