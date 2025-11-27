import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth-options';
import { getAIClientForUser } from '@/lib/ai/claude-client';
import { buildCampaignPrompt, type CampaignGenerationOptions } from '@/lib/ai/prompts/campaign-generator';
import { getSystemPromptText } from '@/lib/ai/system-prompts';
import { GeneratedCampaignSchema, type GeneratedCampaign } from '@/lib/ai/schemas/generation-schemas';

/**
 * POST /api/ai/generate/campaign
 * Generate a complete campaign using AI
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get AI client for user
    const client = await getAIClientForUser(session.user.id);

    if (!client) {
      return NextResponse.json(
        { error: 'No AI API key configured. Please add your API key in Settings.' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      concept,
      genre,
      level,
      players,
      duration,
      themes,
      includeMonsters,
      includeNPCs,
      sceneCount,
      tone,
      setting,
      context,
    } = body as CampaignGenerationOptions & { concept: string };

    if (!concept || typeof concept !== 'string') {
      return NextResponse.json(
        { error: 'Campaign concept is required' },
        { status: 400 }
      );
    }

    // Get system prompt (customizable via admin UI)
    const systemPrompt = await getSystemPromptText('campaign');

    // Build user prompt
    const prompt = buildCampaignPrompt({
      concept,
      genre,
      level,
      players,
      duration,
      themes,
      includeMonsters: includeMonsters !== false,
      includeNPCs: includeNPCs !== false,
      sceneCount: sceneCount || 5,
      tone,
      setting,
      context,
    });

    console.log('Generating campaign with concept:', concept);

    // Generate campaign - use higher token limit for full campaigns
    const campaign = await client.generateStructured<GeneratedCampaign>({
      prompt,
      systemPrompt,
      schema: GeneratedCampaignSchema,
      maxTokens: 16000, // Campaigns need more tokens
      temperature: 0.8, // Slightly higher for creativity
    });

    console.log('Campaign generated:', campaign.name);

    return NextResponse.json({
      success: true,
      campaign,
      preview: {
        name: campaign.name,
        description: campaign.description,
        genre: campaign.genre,
        level: campaign.level,
        duration: campaign.duration,
        sceneCount: campaign.scenes?.length || 0,
        npcCount: campaign.majorNPCs?.length || 0,
        monsterCount: campaign.customMonsters?.length || 0,
      },
    });
  } catch (error) {
    console.error('Error generating campaign:', error);

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
      if (errorMessage.includes('credit') || errorMessage.includes('balance') || errorMessage.includes('billing')) {
        return NextResponse.json(
          { error: 'Insufficient API credits. Please check your billing.' },
          { status: 402 }
        );
      }
    }

    return NextResponse.json(
      { error: `Failed to generate campaign: ${errorMessage}` },
      { status: 500 }
    );
  }
}
