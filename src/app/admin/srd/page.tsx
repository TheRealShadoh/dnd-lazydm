/**
 * SRD Management Admin Page
 * View and manage SRD reference data
 */

'use client';

import { useEffect, useState } from 'react';
import { useSRDSync, useSRDData } from '@/lib/hooks/useSRDData';
import { SRDSelector } from '@/components/srd/SRDSelector';
import type { SRDDataType } from '@/lib/srd/models';

type SyncStatus = {
  lastSyncDate: string;
  ageHours: number;
  needsSync: boolean;
  counts: Record<SRDDataType, number>;
  customCounts: Record<SRDDataType, number>;
};

export default function SRDAdminPage() {
  const { sync, checkStatus, syncing, syncError } = useSRDSync();
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [selectedType, setSelectedType] = useState<SRDDataType>('monsters');
  const { results, loading: dataLoading, search } = useSRDData(selectedType);

  // Initialize SRD database if needed
  useEffect(() => {
    async function init() {
      try {
        const status = await checkStatus();
        setSyncStatus(status);

        // If not initialized, try to initialize
        if (!status || status.counts.monsters === 0) {
          const result = await sync(true);
          const newStatus = await checkStatus();
          setSyncStatus(newStatus);
        }
      } catch (error) {
        console.error('Failed to initialize SRD:', error);
      } finally {
        setInitializing(false);
      }
    }

    init();
  }, [sync, checkStatus]);

  // Load data for selected type
  useEffect(() => {
    search('');
  }, [selectedType, search]);

  const handleSync = async (force: boolean = false) => {
    try {
      await sync(force);
      const newStatus = await checkStatus();
      setSyncStatus(newStatus);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  const dataTypes: SRDDataType[] = ['monsters', 'races', 'classes', 'spells', 'items', 'backgrounds'];

  if (initializing) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">SRD Reference Manager</h1>
        <div className="bg-gray-800 p-4 rounded-lg">Loading SRD data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">SRD Reference Manager</h1>
        <p className="text-gray-400">
          Manage D&D 5e Systems Reference Document data
        </p>
      </div>

      {/* Sync Status and Controls */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold">Sync Status</h2>

        {syncStatus && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400">Last Sync</label>
              <p className="text-white">
                {syncStatus.ageHours < 1
                  ? 'Just now'
                  : `${syncStatus.ageHours} hours ago`}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(syncStatus.lastSyncDate).toLocaleString()}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-400">Status</label>
              <p className="text-white">
                {syncStatus.needsSync ? (
                  <span className="text-yellow-400">Update available</span>
                ) : (
                  <span className="text-green-400">Up to date</span>
                )}
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => handleSync(false)}
            disabled={syncing}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600
                       text-white rounded-lg transition-colors"
          >
            {syncing ? 'Syncing...' : 'Sync Data'}
          </button>
          <button
            onClick={() => handleSync(true)}
            disabled={syncing}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600
                       text-white rounded-lg transition-colors"
          >
            Force Sync
          </button>
        </div>

        {syncError && (
          <div className="bg-red-900 border border-red-700 rounded p-3 text-red-200 text-sm">
            {syncError}
          </div>
        )}
      </div>

      {/* Data Summary */}
      {syncStatus && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Data Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {dataTypes.map((type) => (
              <div key={type} className="bg-gray-700 rounded p-3">
                <p className="text-sm text-gray-400 capitalize">{type}</p>
                <p className="text-lg font-bold text-white">
                  {syncStatus.counts[type]}
                </p>
                {syncStatus.customCounts[type] > 0 && (
                  <p className="text-xs text-purple-400">
                    + {syncStatus.customCounts[type]} custom
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Browse Data */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold">Browse Data</h2>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Data Type
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as SRDDataType)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white
                       focus:border-purple-500 focus:outline-none"
          >
            {dataTypes.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {dataLoading && (
          <div className="text-gray-400">Loading {selectedType}...</div>
        )}

        {results && (
          <div>
            <p className="text-sm text-gray-400 mb-3">
              Total: {results.official.length + results.custom.length} (
              {results.official.length} official, {results.custom.length}{' '}
              custom)
            </p>

            {/* Official Entries */}
            {results.official.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">
                  Official ({results.official.length})
                </h3>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {results.official.slice(0, 20).map((entry: any) => (
                    <div
                      key={entry.id}
                      className="px-2 py-1 bg-gray-700 rounded text-sm text-gray-200"
                    >
                      {entry.name}
                    </div>
                  ))}
                  {results.official.length > 20 && (
                    <div className="px-2 py-1 text-xs text-gray-500">
                      ... and {results.official.length - 20} more
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Custom Entries */}
            {results.custom.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-purple-400 mb-2">
                  Custom ({results.custom.length})
                </h3>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {results.custom.map((entry: any) => (
                    <div
                      key={entry.id}
                      className="px-2 py-1 bg-purple-900 bg-opacity-30 rounded text-sm text-purple-200"
                    >
                      {entry.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
