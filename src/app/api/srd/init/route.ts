/**
 * POST /api/srd/init
 * Initialize SRD database if it hasn't been initialized yet
 */

import { NextRequest, NextResponse } from 'next/server';
import * as sync from '@/lib/srd/sync';

export async function POST(request: NextRequest) {
  try {
    const result = await sync.initializeSRDDatabase();
    return NextResponse.json(result);
  } catch (error) {
    console.error('SRD initialization error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to initialize SRD database', details: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * GET /api/srd/init
 * Check if SRD database is initialized
 */
export async function GET(request: NextRequest) {
  try {
    const status = sync.getSyncStatus();
    const isInitialized = status.counts.monsters > 0;

    return NextResponse.json({
      initialized: isInitialized,
      status,
    });
  } catch (error) {
    console.error('Error checking SRD initialization:', error);
    return NextResponse.json(
      { initialized: false, error: 'Failed to check initialization' },
      { status: 500 }
    );
  }
}
