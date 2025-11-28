import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth-options';
import { getAIClientForUser } from '@/lib/ai/claude-client';
import { getUserSettings } from '@/lib/auth/user-storage';
import { decrypt, maskApiKey } from '@/lib/ai/encryption';

/**
 * POST /api/ai/test/claude
 * Test the AI API connection for the current user (Claude or OpenRouter)
 */
export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await getUserSettings(session.user.id);
    const provider = settings?.aiConfig?.aiProvider || 'claude';

    // Debug: log the stored key info
    let decryptedKeyPreview = 'N/A';
    try {
      if (provider === 'claude' && settings?.aiConfig?.claudeApiKey) {
        const decrypted = decrypt(settings.aiConfig.claudeApiKey);
        decryptedKeyPreview = maskApiKey(decrypted);
        console.log('Decrypted Claude key preview:', decryptedKeyPreview, 'Length:', decrypted.length);
      } else if (provider === 'openrouter' && settings?.aiConfig?.openRouterApiKey) {
        const decrypted = decrypt(settings.aiConfig.openRouterApiKey);
        decryptedKeyPreview = maskApiKey(decrypted);
        console.log('Decrypted OpenRouter key preview:', decryptedKeyPreview, 'Length:', decrypted.length);
      }
    } catch (decryptError) {
      console.error('Failed to decrypt key for debugging:', decryptError);
    }

    console.log('Testing AI connection:', {
      userId: session.user.id,
      provider,
      hasClaudeKey: !!settings?.aiConfig?.claudeApiKey,
      hasOpenRouterKey: !!settings?.aiConfig?.openRouterApiKey,
      decryptedKeyPreview,
    });

    const client = await getAIClientForUser(session.user.id);

    if (!client) {
      const missingKey = provider === 'claude' ? 'Claude' : 'OpenRouter';
      return NextResponse.json(
        {
          success: false,
          error: `No ${missingKey} API key configured. Please save your API key first.`,
        },
        { status: 400 }
      );
    }

    const result = await client.testConnection();

    console.log('Test connection result:', result);

    return NextResponse.json({
      ...result,
      provider,
    });
  } catch (error) {
    console.error('Error testing AI connection:', error);
    return NextResponse.json(
      { success: false, error: `Failed to test connection: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
