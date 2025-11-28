/**
 * Hook for fetching and caching SRD data in components
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type {
  SRDMonster,
  SRDRace,
  SRDClass,
  SRDSpell,
  SRDItem,
  SRDBackgroundOption,
  SRDDataType,
} from '@/lib/srd/models';

interface SearchResult<T> {
  official: T[];
  custom: T[];
}

export function useSRDData<T>(type: SRDDataType) {
  const [results, setResults] = useState<SearchResult<T> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(
    async (query: string = '', source: 'official' | 'custom' | 'all' = 'all') => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          type,
          query,
          source,
          limit: '1000',
        });

        const response = await fetch(`/api/srd?${params}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error('Failed to search SRD data');
        }

        const data = await response.json();
        setResults({
          official: data.results.filter((r: any) => r.source === 'official'),
          custom: data.results.filter((r: any) => r.source === 'custom'),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setResults(null);
      } finally {
        setLoading(false);
      }
    },
    [type]
  );

  return { results, loading, error, search };
}

export function useMonsters() {
  return useSRDData<SRDMonster>('monsters');
}

export function useRaces() {
  return useSRDData<SRDRace>('races');
}

export function useClasses() {
  return useSRDData<SRDClass>('classes');
}

export function useSpells() {
  return useSRDData<SRDSpell>('spells');
}

export function useItems() {
  return useSRDData<SRDItem>('items');
}

export function useBackgrounds() {
  return useSRDData<SRDBackgroundOption>('backgrounds');
}

/**
 * Hook for syncing SRD data
 */
export function useSRDSync() {
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const sync = useCallback(async (force: boolean = false) => {
    setSyncing(true);
    setSyncError(null);

    try {
      const response = await fetch('/api/srd/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force }),
      });

      if (!response.ok) {
        throw new Error('Failed to sync SRD data');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Sync failed');
      }

      setLastSync(data.timestamp);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setSyncError(message);
      throw err;
    } finally {
      setSyncing(false);
    }
  }, []);

  const checkStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/srd/sync', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to get sync status');
      }

      return await response.json();
    } catch (err) {
      console.error('Error getting sync status:', err);
      return null;
    }
  }, []);

  return { sync, checkStatus, syncing, syncError, lastSync };
}

/**
 * Hook for managing custom SRD entries
 */
export function useSRDCustomEntry(type: SRDDataType) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const add = useCallback(
    async (entry: any) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/srd/custom', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, entry }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to add entry');
        }

        return await response.json();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [type]
  );

  const update = useCallback(
    async (entryId: string, updates: any) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/srd/custom?id=${entryId}&type=${type}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
          }
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to update entry');
        }

        return await response.json();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [type]
  );

  const remove = useCallback(
    async (entryId: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/srd/custom?id=${entryId}&type=${type}`,
          {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
          }
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to remove entry');
        }

        return await response.json();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [type]
  );

  return { add, update, remove, loading, error };
}
