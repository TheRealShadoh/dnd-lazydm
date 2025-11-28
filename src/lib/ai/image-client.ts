import OpenAI from 'openai';

export interface ImageGenerationParams {
  prompt: string;
  style?: 'fantasy' | 'realistic' | 'cartoon';
  size?: '256x256' | '512x512' | '1024x1024';
}

export interface ImageGenerationResult {
  url?: string;
  base64?: string;
  error?: string;
}

export interface ImageClient {
  /**
   * Generate an image from a text prompt
   */
  generate(params: ImageGenerationParams): Promise<ImageGenerationResult>;

  /**
   * Test the connection to the image API
   */
  testConnection(): Promise<{ success: boolean; message: string }>;
}

/**
 * Create an OpenAI DALL-E image client
 */
export function createOpenAIImageClient(apiKey: string): ImageClient {
  const client = new OpenAI({
    apiKey,
  });

  return {
    async generate(params: ImageGenerationParams): Promise<ImageGenerationResult> {
      const { prompt, style = 'fantasy', size = '1024x1024' } = params;

      // Enhance prompt with style guidance
      let enhancedPrompt = prompt;
      switch (style) {
        case 'fantasy':
          enhancedPrompt = `${prompt}, fantasy art style, detailed, dramatic lighting, D&D inspired artwork`;
          break;
        case 'realistic':
          enhancedPrompt = `${prompt}, realistic style, photorealistic, detailed`;
          break;
        case 'cartoon':
          enhancedPrompt = `${prompt}, cartoon style, vibrant colors, stylized`;
          break;
      }

      try {
        const response = await client.images.generate({
          model: 'dall-e-3',
          prompt: enhancedPrompt,
          n: 1,
          size: size === '256x256' ? '1024x1024' : size, // DALL-E 3 doesn't support 256x256
          quality: 'standard',
          response_format: 'url',
        });

        const imageUrl = response.data?.[0]?.url;

        if (!imageUrl) {
          return { error: 'No image URL returned' };
        }

        return { url: imageUrl };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return { error: `Image generation failed: ${message}` };
      }
    },

    async testConnection(): Promise<{ success: boolean; message: string }> {
      try {
        // Just check that we can list models (cheaper than generating an image)
        await client.models.list();

        return {
          success: true,
          message: 'Connected to OpenAI API',
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';

        if (message.includes('401') || message.includes('invalid_api_key')) {
          return {
            success: false,
            message: 'Invalid API key',
          };
        }
        if (message.includes('429')) {
          return {
            success: false,
            message: 'Rate limited - please try again later',
          };
        }
        if (message.includes('insufficient_quota')) {
          return {
            success: false,
            message: 'Insufficient API credits',
          };
        }

        return {
          success: false,
          message: `Connection failed: ${message}`,
        };
      }
    },
  };
}

/**
 * Create an image client based on the provider
 */
export function createImageClient(
  provider: 'openai' | 'stability' | 'none',
  apiKey: string
): ImageClient | null {
  switch (provider) {
    case 'openai':
      return createOpenAIImageClient(apiKey);
    case 'stability':
      // Stability AI implementation would go here
      // For now, return a placeholder that indicates it's not implemented
      return {
        async generate(): Promise<ImageGenerationResult> {
          return { error: 'Stability AI integration coming soon' };
        },
        async testConnection(): Promise<{ success: boolean; message: string }> {
          return { success: false, message: 'Stability AI integration coming soon' };
        },
      };
    case 'none':
    default:
      return null;
  }
}

/**
 * Get an image client for the given user
 * Returns null if the user has no image API configured
 */
export async function getImageClientForUser(userId: string): Promise<ImageClient | null> {
  // Import here to avoid circular dependency
  const { getUserSettings } = await import('@/lib/auth/user-storage');
  const { decrypt } = await import('@/lib/ai/encryption');

  const settings = await getUserSettings(userId);
  if (!settings?.aiConfig?.imageApiKey || !settings?.aiConfig?.imageProvider) {
    return null;
  }

  if (settings.aiConfig.imageProvider === 'none') {
    return null;
  }

  try {
    const apiKey = decrypt(settings.aiConfig.imageApiKey);
    return createImageClient(settings.aiConfig.imageProvider, apiKey);
  } catch (error) {
    console.error('Failed to decrypt image API key:', error);
    return null;
  }
}
