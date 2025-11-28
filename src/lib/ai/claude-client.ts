import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

export interface ClaudeGenerateParams {
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface ClaudeGenerateStructuredParams<T> {
  prompt: string;
  systemPrompt?: string;
  schema: z.ZodSchema<T>;
  maxTokens?: number;
  temperature?: number;
}

export interface ClaudeClient {
  /**
   * Generate a raw text response from Claude
   */
  generate(params: ClaudeGenerateParams): Promise<string>;

  /**
   * Generate a structured response that matches a Zod schema
   */
  generateStructured<T>(params: ClaudeGenerateStructuredParams<T>): Promise<T>;

  /**
   * Test the connection to Claude API
   */
  testConnection(): Promise<{ success: boolean; message: string }>;
}

/**
 * Create a Claude client with the given API key
 */
export function createClaudeClient(apiKey: string): ClaudeClient {
  const client = new Anthropic({
    apiKey,
  });

  return {
    async generate(params: ClaudeGenerateParams): Promise<string> {
      const { prompt, systemPrompt, maxTokens = 4096, temperature = 0.7 } = params;

      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: maxTokens,
        temperature,
        system: systemPrompt || 'You are a helpful assistant.',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      // Extract text from the response
      const textContent = response.content.find(block => block.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text response received from Claude');
      }

      return textContent.text;
    },

    async generateStructured<T>(params: ClaudeGenerateStructuredParams<T>): Promise<T> {
      const { prompt, systemPrompt, schema, maxTokens = 4096, temperature = 0.5 } = params;

      // Add JSON instruction to system prompt
      const jsonSystemPrompt = `${systemPrompt || 'You are a helpful assistant.'}

IMPORTANT: You must respond with valid JSON only. Do not include any markdown formatting, code blocks, or explanatory text. Output only the raw JSON object.`;

      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: maxTokens,
        temperature,
        system: jsonSystemPrompt,
        messages: [
          {
            role: 'user',
            content: `${prompt}\n\nRespond with valid JSON only.`,
          },
        ],
      });

      // Extract text from the response
      const textContent = response.content.find(block => block.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text response received from Claude');
      }

      // Try to parse the JSON
      let jsonText = textContent.text.trim();

      // Remove markdown code blocks if present
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.slice(7);
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.slice(3);
      }
      if (jsonText.endsWith('```')) {
        jsonText = jsonText.slice(0, -3);
      }
      jsonText = jsonText.trim();

      let parsed: unknown;
      try {
        parsed = JSON.parse(jsonText);
      } catch (e) {
        throw new Error(`Failed to parse Claude response as JSON: ${e instanceof Error ? e.message : 'Unknown error'}`);
      }

      // Validate against schema
      const result = schema.safeParse(parsed);
      if (!result.success) {
        throw new Error(`Response does not match schema: ${result.error.message}`);
      }

      return result.data;
    },

    async testConnection(): Promise<{ success: boolean; message: string }> {
      try {
        console.log('Attempting Claude API test connection...');
        const response = await client.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 50,
          messages: [
            {
              role: 'user',
              content: 'Say "Hello from Claude!" in exactly those words.',
            },
          ],
        });

        const textContent = response.content.find(block => block.type === 'text');
        if (textContent && textContent.type === 'text') {
          return {
            success: true,
            message: `Connected! Response: "${textContent.text.slice(0, 50)}..."`,
          };
        }

        return {
          success: false,
          message: 'Unexpected response format from Claude',
        };
      } catch (error: unknown) {
        console.error('Claude API test error:', error);

        // Try to extract more details from the Anthropic error
        let message = 'Unknown error';
        let statusCode: number | undefined;

        if (error instanceof Error) {
          message = error.message;
          // Check for Anthropic API error structure
          const apiError = error as { status?: number; error?: { type?: string; message?: string } };
          if (apiError.status) {
            statusCode = apiError.status;
          }
          if (apiError.error?.message) {
            message = apiError.error.message;
          }
        }

        console.error('Parsed error:', { message, statusCode });

        // Handle common error cases
        if (statusCode === 401 || message.includes('401') || message.includes('invalid_api_key') || message.includes('authentication')) {
          return {
            success: false,
            message: 'Invalid API key - please check your key and try again',
          };
        }
        if (statusCode === 429 || message.includes('429')) {
          return {
            success: false,
            message: 'Rate limited - please try again later',
          };
        }
        if (message.includes('credit balance') || message.includes('insufficient_quota') || message.includes('billing') || message.includes('too low')) {
          return {
            success: false,
            message: 'Insufficient API credits - add credits at console.anthropic.com',
          };
        }
        if (message.includes('not_found') || message.includes('model')) {
          return {
            success: false,
            message: 'Model not available - API key may not have access',
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
 * Get a Claude client for the given user (direct Claude API)
 * Returns null if the user has no API key configured
 */
export async function getClaudeClientForUser(userId: string): Promise<ClaudeClient | null> {
  // Import here to avoid circular dependency
  const { getUserSettings } = await import('@/lib/auth/user-storage');
  const { decrypt } = await import('@/lib/ai/encryption');

  const settings = await getUserSettings(userId);
  if (!settings?.aiConfig?.claudeApiKey) {
    return null;
  }

  try {
    const apiKey = decrypt(settings.aiConfig.claudeApiKey);
    return createClaudeClient(apiKey);
  } catch (error) {
    console.error('Failed to decrypt Claude API key:', error);
    return null;
  }
}

/**
 * Get the appropriate AI client for the user based on their provider setting
 * Returns either a Claude client or OpenRouter client
 */
export async function getAIClientForUser(userId: string): Promise<ClaudeClient | null> {
  const { getUserSettings } = await import('@/lib/auth/user-storage');

  const settings = await getUserSettings(userId);
  const provider = settings?.aiConfig?.aiProvider || 'claude';

  if (provider === 'openrouter') {
    const { getOpenRouterClientForUser } = await import('@/lib/ai/openrouter-client');
    return getOpenRouterClientForUser(userId);
  }

  // Default to Claude
  return getClaudeClientForUser(userId);
}
