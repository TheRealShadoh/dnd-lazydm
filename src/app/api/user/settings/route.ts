import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth-options';
import { getUserSettings, updateAIConfig, type AIConfig } from '@/lib/auth/user-storage';
import { encrypt, decrypt, maskApiKey, isValidClaudeApiKey, isValidOpenAIApiKey, isValidOpenRouterApiKey } from '@/lib/ai/encryption';

/**
 * GET /api/user/settings
 * Get current user's settings (with masked API keys)
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await getUserSettings(session.user.id);

    if (!settings) {
      return NextResponse.json({ settings: {} });
    }

    // Return settings with masked API keys
    const maskedSettings = {
      ...settings,
      aiConfig: settings.aiConfig ? {
        claudeApiKey: settings.aiConfig.claudeApiKey
          ? maskApiKey(decrypt(settings.aiConfig.claudeApiKey))
          : null,
        openRouterApiKey: settings.aiConfig.openRouterApiKey
          ? maskApiKey(decrypt(settings.aiConfig.openRouterApiKey))
          : null,
        aiProvider: settings.aiConfig.aiProvider || 'claude',
        openRouterModel: settings.aiConfig.openRouterModel || 'anthropic/claude-3.5-sonnet',
        imageApiKey: settings.aiConfig.imageApiKey
          ? maskApiKey(decrypt(settings.aiConfig.imageApiKey))
          : null,
        imageProvider: settings.aiConfig.imageProvider || 'none',
        // Include flags to indicate if keys are set
        hasClaudeKey: !!settings.aiConfig.claudeApiKey,
        hasOpenRouterKey: !!settings.aiConfig.openRouterApiKey,
        hasImageKey: !!settings.aiConfig.imageApiKey,
      } : {
        claudeApiKey: null,
        openRouterApiKey: null,
        aiProvider: 'claude',
        openRouterModel: 'anthropic/claude-3.5-sonnet',
        imageApiKey: null,
        imageProvider: 'none',
        hasClaudeKey: false,
        hasOpenRouterKey: false,
        hasImageKey: false,
      },
    };

    return NextResponse.json({ settings: maskedSettings });
  } catch (error) {
    console.error('Error getting user settings:', error);
    return NextResponse.json(
      { error: 'Failed to get settings' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/settings
 * Update user settings
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { claudeApiKey, openRouterApiKey, aiProvider, openRouterModel, imageApiKey, imageProvider } = body;

    const updates: Partial<AIConfig> = {};
    const errors: string[] = [];

    // Validate and encrypt Claude API key if provided
    if (claudeApiKey !== undefined) {
      if (claudeApiKey === null || claudeApiKey === '') {
        // Clear the key
        updates.claudeApiKey = undefined;
      } else if (isValidClaudeApiKey(claudeApiKey)) {
        updates.claudeApiKey = encrypt(claudeApiKey);
      } else {
        errors.push('Invalid Claude API key format. Keys should start with "sk-ant-"');
      }
    }

    // Validate and encrypt OpenRouter API key if provided
    if (openRouterApiKey !== undefined) {
      if (openRouterApiKey === null || openRouterApiKey === '') {
        // Clear the key
        updates.openRouterApiKey = undefined;
      } else if (isValidOpenRouterApiKey(openRouterApiKey)) {
        updates.openRouterApiKey = encrypt(openRouterApiKey);
      } else {
        errors.push('Invalid OpenRouter API key format. Keys should start with "sk-or-"');
      }
    }

    // Validate AI provider
    if (aiProvider !== undefined) {
      if (['claude', 'openrouter'].includes(aiProvider)) {
        updates.aiProvider = aiProvider;
      } else {
        errors.push('Invalid AI provider. Must be "claude" or "openrouter"');
      }
    }

    // Validate OpenRouter model
    if (openRouterModel !== undefined) {
      updates.openRouterModel = openRouterModel;
    }

    // Validate and encrypt image API key if provided
    if (imageApiKey !== undefined) {
      if (imageApiKey === null || imageApiKey === '') {
        // Clear the key
        updates.imageApiKey = undefined;
      } else if (isValidOpenAIApiKey(imageApiKey)) {
        updates.imageApiKey = encrypt(imageApiKey);
      } else {
        errors.push('Invalid OpenAI API key format. Keys should start with "sk-"');
      }
    }

    // Validate image provider
    if (imageProvider !== undefined) {
      if (['openai', 'stability', 'none'].includes(imageProvider)) {
        updates.imageProvider = imageProvider;
      } else {
        errors.push('Invalid image provider. Must be "openai", "stability", or "none"');
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    // Only update if there are changes
    if (Object.keys(updates).length > 0) {
      await updateAIConfig(session.user.id, updates);
    }

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating user settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
