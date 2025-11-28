import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth-options';
import {
  getAllSystemPrompts,
  getSystemPrompt,
  updateSystemPrompt,
  resetSystemPrompt,
  getDefaultPrompt,
  type SystemPromptType,
} from '@/lib/ai/system-prompts';

/**
 * GET /api/admin/system-prompts
 * Get all system prompts (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if admin
    const isAdmin = (session.user as { isAdmin?: boolean })?.isAdmin;
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as SystemPromptType | null;

    if (type) {
      // Get specific prompt
      const prompt = await getSystemPrompt(type);
      if (!prompt) {
        return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
      }
      return NextResponse.json({
        prompt,
        defaultPrompt: getDefaultPrompt(type),
      });
    }

    // Get all prompts
    const prompts = await getAllSystemPrompts();
    return NextResponse.json({ prompts });
  } catch (error) {
    console.error('Error getting system prompts:', error);
    return NextResponse.json(
      { error: 'Failed to get system prompts' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/system-prompts
 * Update a system prompt (admin only)
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if admin
    const isAdmin = (session.user as { isAdmin?: boolean })?.isAdmin;
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { type, prompt } = body;

    if (!type || !prompt) {
      return NextResponse.json(
        { error: 'Type and prompt are required' },
        { status: 400 }
      );
    }

    const validTypes: SystemPromptType[] = ['campaign', 'monster', 'npc', 'scene', 'encounter'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid prompt type' },
        { status: 400 }
      );
    }

    const updated = await updateSystemPrompt(type, prompt);

    return NextResponse.json({
      success: true,
      prompt: updated,
    });
  } catch (error) {
    console.error('Error updating system prompt:', error);
    return NextResponse.json(
      { error: 'Failed to update system prompt' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/system-prompts/reset
 * Reset a system prompt to default (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if admin
    const isAdmin = (session.user as { isAdmin?: boolean })?.isAdmin;
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { type } = body;

    if (!type) {
      return NextResponse.json(
        { error: 'Type is required' },
        { status: 400 }
      );
    }

    const validTypes: SystemPromptType[] = ['campaign', 'monster', 'npc', 'scene', 'encounter'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid prompt type' },
        { status: 400 }
      );
    }

    const reset = await resetSystemPrompt(type);

    if (!reset) {
      return NextResponse.json(
        { error: 'Failed to reset prompt' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      prompt: reset,
    });
  } catch (error) {
    console.error('Error resetting system prompt:', error);
    return NextResponse.json(
      { error: 'Failed to reset system prompt' },
      { status: 500 }
    );
  }
}
