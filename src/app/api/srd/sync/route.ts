/**
 * POST /api/srd/sync
 * Trigger SRD data sync from Open5e API
 * Body (optional):
 *   - type: specific type to sync (optional, syncs all if not provided)
 *   - force: force sync even if data is recent (default: false)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth-options';
import * as sync from '@/lib/srd/sync';
import * as storage from '@/lib/srd/storage';

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { type, force } = body;

    let result;

    if (type && ['monsters', 'races', 'classes', 'spells', 'items', 'backgrounds'].includes(type)) {
      // Sync specific type
      result = await sync.syncDataType(type);
    } else {
      // Sync all data
      result = await sync.syncSRDData(force === true);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('SRD sync error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to sync SRD data', details: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * GET /api/srd/sync
 * Get SRD sync status
 */
export async function GET(request: NextRequest) {
  try {
    const status = sync.getSyncStatus();
    return NextResponse.json(status);
  } catch (error) {
    console.error('Error getting sync status:', error);
    return NextResponse.json(
      { error: 'Failed to get sync status' },
      { status: 500 }
    );
  }
}
