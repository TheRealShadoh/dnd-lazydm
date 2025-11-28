/**
 * GET /api/srd
 * List or search SRD entries by type and query
 * Query params:
 *   - type: 'monsters' | 'races' | 'classes' | 'spells' | 'items' | 'backgrounds'
 *   - query: search query (optional)
 *   - source: 'official' | 'custom' | 'all' (default: 'all')
 *   - limit: max results (default: 100)
 *   - page: page number for pagination (default: 1)
 *
 * Monster-specific filters:
 *   - cr_min: minimum challenge rating
 *   - cr_max: maximum challenge rating
 *   - size: size category (Tiny, Small, Medium, Large, Huge, Gargantuan)
 *   - monster_type: creature type (Beast, Humanoid, Undead, etc.)
 *
 * Spell-specific filters:
 *   - spell_level: spell level (0-9, 0 = cantrip)
 *   - school: spell school (Evocation, Conjuration, etc.)
 *   - spell_class: class that can cast (Wizard, Cleric, etc.)
 *   - ritual_only: only show ritual spells (true/false)
 *   - concentration_only: only show concentration spells (true/false)
 */

import { NextRequest, NextResponse } from 'next/server';
import * as storage from '@/lib/srd/storage';
import type { SRDDataType, SRDMonster, SRDSpell } from '@/lib/srd/models';

const VALID_TYPES: SRDDataType[] = ['monsters', 'races', 'classes', 'spells', 'items', 'backgrounds'];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as SRDDataType | null;
    const query = searchParams.get('query') || '';
    const source = (searchParams.get('source') || 'all') as 'official' | 'custom' | 'all';
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 1000);
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);

    // Monster filters
    const crMin = searchParams.get('cr_min') ? parseFloat(searchParams.get('cr_min')!) : null;
    const crMax = searchParams.get('cr_max') ? parseFloat(searchParams.get('cr_max')!) : null;
    const size = searchParams.get('size');
    const monsterType = searchParams.get('monster_type');

    // Spell filters
    const spellLevel = searchParams.get('spell_level') ? parseInt(searchParams.get('spell_level')!) : null;
    const school = searchParams.get('school');
    const spellClass = searchParams.get('spell_class');
    const ritualOnly = searchParams.get('ritual_only') === 'true';
    const concentrationOnly = searchParams.get('concentration_only') === 'true';

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
    let entries: any[] = [];
    if (source === 'official' || source === 'all') {
      entries.push(...results.official);
    }
    if (source === 'custom' || source === 'all') {
      entries.push(...results.custom);
    }

    // Apply type-specific filters
    if (type === 'monsters') {
      entries = entries.filter((monster: SRDMonster) => {
        if (crMin !== null && monster.challengeRating < crMin) return false;
        if (crMax !== null && monster.challengeRating > crMax) return false;
        if (size && monster.size?.toLowerCase() !== size.toLowerCase()) return false;
        if (monsterType && monster.type?.toLowerCase() !== monsterType.toLowerCase()) return false;
        return true;
      });
    }

    if (type === 'spells') {
      entries = entries.filter((spell: SRDSpell) => {
        if (spellLevel !== null && spell.level !== spellLevel) return false;
        if (school && spell.school?.toLowerCase() !== school.toLowerCase()) return false;
        if (spellClass && !spell.classes?.some(c => c.toLowerCase() === spellClass.toLowerCase())) return false;
        if (ritualOnly && !spell.ritual) return false;
        if (concentrationOnly && !spell.concentration) return false;
        return true;
      });
    }

    // Calculate pagination
    const total = entries.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginated = entries.slice(startIndex, endIndex);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      type,
      query,
      source,
      total,
      returned: paginated.length,
      page,
      totalPages,
      limit,
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
