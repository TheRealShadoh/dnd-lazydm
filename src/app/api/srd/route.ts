/**
 * GET /api/srd
 * List or search SRD entries by type and query
 * Query params:
 *   - type: 'monsters' | 'races' | 'classes' | 'spells' | 'items' | 'backgrounds'
 *   - query: search query (optional)
 *   - source: 'official' | 'custom' | 'all' (default: 'all')
 *   - limit: max results (default: 100)
 */

import { NextRequest, NextResponse } from 'next/server';
import * as storage from '@/lib/srd/storage';
import type { SRDDataType } from '@/lib/srd/models';

const VALID_TYPES: SRDDataType[] = ['monsters', 'races', 'classes', 'spells', 'items', 'backgrounds'];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as SRDDataType | null;
    const query = searchParams.get('query') || '';
    const source = (searchParams.get('source') || 'all') as 'official' | 'custom' | 'all';
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 1000);

    // Validate type
    if (!type || !VALID_TYPES.includes(type)) {
      return NextResponse.json(
        {
          error: 'Invalid type. Must be one of: monsters, races, classes, spells, items, backgrounds',
        },
        { status: 400 }
      );
    }

    // Search entries
    let results = storage.searchEntries(type, query);

    // Filter by source
    let entries = [];
    if (source === 'official' || source === 'all') {
      entries.push(...results.official);
    }
    if (source === 'custom' || source === 'all') {
      entries.push(...results.custom);
    }

    // Apply limit
    const paginated = entries.slice(0, limit);

    return NextResponse.json({
      type,
      query,
      source,
      total: entries.length,
      returned: paginated.length,
      results: paginated,
    });
  } catch (error) {
    console.error('SRD search error:', error);
    return NextResponse.json(
      { error: 'Failed to search SRD' },
      { status: 500 }
    );
  }
}
