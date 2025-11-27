/**
 * SRD Management Admin Page
 * View and manage SRD reference data
 */

'use client';

import { useEffect, useState } from 'react';
import { useSRDSync, useSRDData } from '@/lib/hooks/useSRDData';
import { MainNav } from '@/components/layout/MainNav';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Loader2, RefreshCw, Database, BookOpen, CheckCircle, AlertTriangle } from 'lucide-react';
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
      <div className="min-h-screen bg-background">
        <MainNav />
        <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground font-ui">Loading SRD data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <main className="container max-w-6xl mx-auto py-8 px-4">
        <PageHeader
          title="SRD Reference Manager"
          description="Manage D&D 5e Systems Reference Document data"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Admin', href: '/admin' },
            { label: 'SRD Manager' },
          ]}
        />

        <div className="space-y-6 mt-8">
          {/* Sync Status and Controls */}
          <Card variant="fantasy">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-primary" />
                Sync Status
              </CardTitle>
              <CardDescription>Monitor and control SRD data synchronization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {syncStatus && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg border border-border">
                    <Label className="text-muted-foreground">Last Sync</Label>
                    <p className="text-foreground font-semibold mt-1">
                      {syncStatus.ageHours < 1
                        ? 'Just now'
                        : `${syncStatus.ageHours} hours ago`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(syncStatus.lastSyncDate).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg border border-border">
                    <Label className="text-muted-foreground">Status</Label>
                    <p className="font-semibold mt-1 flex items-center gap-2">
                      {syncStatus.needsSync ? (
                        <>
                          <AlertTriangle className="h-4 w-4 text-warning" />
                          <span className="text-warning">Update available</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 text-success" />
                          <span className="text-success">Up to date</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="primary"
                  onClick={() => handleSync(false)}
                  disabled={syncing}
                >
                  {syncing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Sync Data
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSync(true)}
                  disabled={syncing}
                >
                  Force Sync
                </Button>
              </div>

              {syncError && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
                  {syncError}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Summary */}
          {syncStatus && (
            <Card variant="fantasy">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  Data Summary
                </CardTitle>
                <CardDescription>Overview of available SRD content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {dataTypes.map((type) => (
                    <div key={type} className="p-4 bg-muted/50 rounded-lg border border-border">
                      <p className="text-sm text-muted-foreground capitalize">{type}</p>
                      <p className="text-2xl font-bold text-foreground">
                        {syncStatus.counts[type]}
                      </p>
                      {syncStatus.customCounts[type] > 0 && (
                        <p className="text-xs text-primary">
                          + {syncStatus.customCounts[type]} custom
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Browse Data */}
          <Card variant="fantasy">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Browse Data
              </CardTitle>
              <CardDescription>Explore and search SRD content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dataType">Data Type</Label>
                <select
                  id="dataType"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as SRDDataType)}
                  className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg
                           focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20
                           text-foreground font-ui"
                >
                  {dataTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {dataLoading && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading {selectedType}...
                </div>
              )}

              {results && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Total: {results.official.length + results.custom.length} (
                    {results.official.length} official, {results.custom.length}{' '}
                    custom)
                  </p>

                  {/* Official Entries */}
                  {results.official.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                        Official ({results.official.length})
                      </h3>
                      <div className="max-h-48 overflow-y-auto space-y-1">
                        {results.official.slice(0, 20).map((entry: any) => (
                          <div
                            key={entry.id}
                            className="px-3 py-2 bg-muted/50 rounded-lg text-sm text-foreground border border-border"
                          >
                            {entry.name}
                          </div>
                        ))}
                        {results.official.length > 20 && (
                          <div className="px-3 py-2 text-xs text-muted-foreground">
                            ... and {results.official.length - 20} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Custom Entries */}
                  {results.custom.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-primary mb-2">
                        Custom ({results.custom.length})
                      </h3>
                      <div className="max-h-48 overflow-y-auto space-y-1">
                        {results.custom.map((entry: any) => (
                          <div
                            key={entry.id}
                            className="px-3 py-2 bg-primary/10 rounded-lg text-sm text-foreground border border-primary/30"
                          >
                            {entry.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
