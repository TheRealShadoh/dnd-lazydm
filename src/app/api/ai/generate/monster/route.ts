import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth-options';
import { getAIClientForUser } from '@/lib/ai/claude-client';
import { buildMonsterContext } from '@/lib/ai/context-builder';
import { MONSTER_SYSTEM_PROMPT, buildMonsterPrompt } from '@/lib/ai/prompts/monster-generator';
import { GeneratedMonsterSchema, getXPForCR, type GeneratedMonster } from '@/lib/ai/schemas/generation-schemas';

/**
 * POST /api/ai/generate/monster
 * Generate a monster using AI
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get AI client for user (Claude or OpenRouter)
    const client = await getAIClientForUser(session.user.id);

    if (!client) {
      return NextResponse.json(
        { error: 'No AI API key configured. Please add your API key in Settings.' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { concept, targetCR, monsterType, size, campaignId } = body;

    if (!concept || typeof concept !== 'string') {
      return NextResponse.json(
        { error: 'Monster concept is required' },
        { status: 400 }
      );
    }

    // Build context
    const context = await buildMonsterContext({
      targetCR: targetCR ? parseFloat(targetCR) : undefined,
      monsterType,
      campaignId,
    });

    // Build prompt
    const prompt = buildMonsterPrompt({
      concept,
      targetCR: targetCR ? parseFloat(targetCR) : undefined,
      monsterType,
      size,
      context,
    });

    // Generate monster
    const monster = await client.generateStructured<GeneratedMonster>({
      prompt,
      systemPrompt: MONSTER_SYSTEM_PROMPT,
      schema: GeneratedMonsterSchema,
      maxTokens: 4096,
      temperature: 0.7,
    });

    // Add XP if not present
    if (!monster.xp && monster.challengeRating !== undefined) {
      monster.xp = getXPForCR(monster.challengeRating);
    }

    // Normalize speed to string format
    if (typeof monster.speed === 'object') {
      const speedParts: string[] = [];
      const speedObj = monster.speed as Record<string, number>;
      if ('walk' in speedObj) speedParts.push(`${speedObj.walk} ft.`);
      if ('fly' in speedObj) speedParts.push(`fly ${speedObj.fly} ft.`);
      if ('swim' in speedObj) speedParts.push(`swim ${speedObj.swim} ft.`);
      if ('burrow' in speedObj) speedParts.push(`burrow ${speedObj.burrow} ft.`);
      if ('climb' in speedObj) speedParts.push(`climb ${speedObj.climb} ft.`);
      monster.speed = speedParts.join(', ') || '30 ft.';
    }

    return NextResponse.json({
      success: true,
      monster,
      preview: {
        name: monster.name,
        challengeRating: monster.challengeRating,
        xp: monster.xp,
        type: monster.type,
        size: monster.size,
        hitPoints: monster.hitPoints,
        actionCount: monster.actions?.length || 0,
        traitCount: monster.traits?.length || 0,
      },
    });
  } catch (error) {
    console.error('Error generating monster:', error);

    // Handle specific error types
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Full error message:', errorMessage);

    if (error instanceof Error) {
      if (errorMessage.includes('API key') || errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
        return NextResponse.json(
          { error: 'Invalid API key' },
          { status: 401 }
        );
      }
      if (errorMessage.includes('rate') || errorMessage.includes('429')) {
        return NextResponse.json(
          { error: 'Rate limited. Please try again later.' },
          { status: 429 }
        );
      }
      if (errorMessage.includes('schema') || errorMessage.includes('JSON')) {
        return NextResponse.json(
          { error: `Failed to parse AI response: ${errorMessage}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: `Failed to generate monster: ${errorMessage}` },
      { status: 500 }
    );
  }
}
