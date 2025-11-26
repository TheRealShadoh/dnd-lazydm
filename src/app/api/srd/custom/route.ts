/**
 * POST /api/srd/custom
 * Add a custom SRD entry
 * Body:
 *   - type: 'monsters' | 'races' | 'classes' | 'spells' | 'items' | 'backgrounds'
 *   - entry: the entry data
 *
 * PUT /api/srd/custom?id=xxx
 * Update a custom SRD entry
 *
 * DELETE /api/srd/custom?id=xxx
 * Delete a custom SRD entry
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth-options';
import * as storage from '@/lib/srd/storage';
import {
  SRDMonsterSchema,
  SRDRaceSchema,
  SRDClassSchema,
  SRDSpellSchema,
  SRDItemSchema,
  SRDBackgroundSchema,
} from '@/lib/srd/schemas';
import type { SRDDataType } from '@/lib/srd/models';

const VALID_TYPES: SRDDataType[] = ['monsters', 'races', 'classes', 'spells', 'items', 'backgrounds'];

const schemaMap: Record<SRDDataType, any> = {
  monsters: SRDMonsterSchema,
  races: SRDRaceSchema,
  classes: SRDClassSchema,
  spells: SRDSpellSchema,
  items: SRDItemSchema,
  backgrounds: SRDBackgroundSchema,
};

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

    const body = await request.json();
    const { type, entry } = body;

    // Validate type
    if (!type || !VALID_TYPES.includes(type as SRDDataType)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be one of: monsters, races, classes, spells, items, backgrounds' },
        { status: 400 }
      );
    }

    const validType = type as SRDDataType;

    // Validate entry against schema
    const schema = schemaMap[validType];
    const validationResult = schema.safeParse(entry);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid entry data', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    // Add custom entry
    storage.addCustomEntry(validType, validationResult.data);

    return NextResponse.json(
      {
        success: true,
        message: 'Custom entry added',
        entry: validationResult.data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding custom entry:', error);
    return NextResponse.json(
      { error: 'Failed to add custom entry' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Require authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const entryId = searchParams.get('id');
    const type = searchParams.get('type') as SRDDataType | null;

    if (!entryId) {
      return NextResponse.json(
        { error: 'Missing id parameter' },
        { status: 400 }
      );
    }

    if (!type || !VALID_TYPES.includes(type as SRDDataType)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be one of: monsters, races, classes, spells, items, backgrounds' },
        { status: 400 }
      );
    }

    const validType = type as SRDDataType;
    const body = await request.json();

    // Validate entry against schema
    const schema = schemaMap[validType];
    const validationResult = schema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid entry data', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    // Update custom entry
    storage.updateCustomEntry(validType, entryId, validationResult.data);

    return NextResponse.json(
      {
        success: true,
        message: 'Custom entry updated',
        entry: validationResult.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating custom entry:', error);
    return NextResponse.json(
      { error: 'Failed to update custom entry' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Require authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const entryId = searchParams.get('id');
    const type = searchParams.get('type') as SRDDataType | null;

    if (!entryId) {
      return NextResponse.json(
        { error: 'Missing id parameter' },
        { status: 400 }
      );
    }

    if (!type || !VALID_TYPES.includes(type as SRDDataType)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be one of: monsters, races, classes, spells, items, backgrounds' },
        { status: 400 }
      );
    }

    const validType = type as SRDDataType;

    // Delete custom entry
    storage.removeCustomEntry(validType, entryId);

    return NextResponse.json(
      { success: true, message: 'Custom entry deleted' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting custom entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete custom entry' },
      { status: 500 }
    );
  }
}
