/**
 * OpenRouter API Client
 * OpenRouter provides access to many AI models through an OpenAI-compatible API
 */

import { z } from 'zod';

export interface OpenRouterGenerateParams {
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
  model?: string;
}

export interface OpenRouterGenerateStructuredParams<T> {
  prompt: string;
  systemPrompt?: string;
  schema: z.ZodSchema<T>;
  maxTokens?: number;
  temperature?: number;
  model?: string;
}

export interface OpenRouterClient {
  generate(params: OpenRouterGenerateParams): Promise<string>;
  generateStructured<T>(params: OpenRouterGenerateStructuredParams<T>): Promise<T>;
  testConnection(): Promise<{ success: boolean; message: string }>;
}

// Popular models available on OpenRouter
export const OPENROUTER_MODELS = {
  // Claude models
  'anthropic/claude-3.5-sonnet': 'Claude 3.5 Sonnet',
  'anthropic/claude-3-haiku': 'Claude 3 Haiku',
  // Free models
  'mistralai/mistral-7b-instruct:free': 'Mistral 7B (Free)',
  'google/gemma-7b-it:free': 'Gemma 7B (Free)',
  'meta-llama/llama-3-8b-instruct:free': 'Llama 3 8B (Free)',
  'openchat/openchat-7b:free': 'OpenChat 7B (Free)',
  // Other popular models
  'openai/gpt-4o': 'GPT-4o',
  'openai/gpt-4o-mini': 'GPT-4o Mini',
  'google/gemini-pro': 'Gemini Pro',
  'meta-llama/llama-3.1-70b-instruct': 'Llama 3.1 70B',
} as const;

export type OpenRouterModelId = keyof typeof OPENROUTER_MODELS;

const DEFAULT_MODEL = 'anthropic/claude-3.5-sonnet';

/**
 * Create an OpenRouter client with the given API key
 */
export function createOpenRouterClient(apiKey: string, defaultModel?: string): OpenRouterClient {
  const baseUrl = 'https://openrouter.ai/api/v1';
  const model = defaultModel || DEFAULT_MODEL;

  async function makeRequest(messages: Array<{ role: string; content: string }>, options: {
    maxTokens?: number;
    temperature?: number;
    modelOverride?: string;
  } = {}): Promise<string> {
    const requestModel = options.modelOverride || model;
    console.log('OpenRouter request to model:', requestModel);

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://lazydm.app',
        'X-Title': 'LazyDM',
      },
      body: JSON.stringify({
        model: requestModel,
        messages,
        max_tokens: options.maxTokens || 4096,
        temperature: options.temperature ?? 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || errorData.message || response.statusText;
      console.error('OpenRouter API error:', response.status, errorData);
      throw new Error(`OpenRouter API error (${response.status}): ${errorMessage}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  return {
    async generate(params: OpenRouterGenerateParams): Promise<string> {
      const { prompt, systemPrompt, maxTokens, temperature, model: modelOverride } = params;

      const messages: Array<{ role: string; content: string }> = [];

      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
      }

      messages.push({ role: 'user', content: prompt });

      return makeRequest(messages, { maxTokens, temperature, modelOverride });
    },

    async generateStructured<T>(params: OpenRouterGenerateStructuredParams<T>): Promise<T> {
      const { prompt, systemPrompt, schema, maxTokens, temperature, model: modelOverride } = params;

      const jsonSystemPrompt = `${systemPrompt || 'You are a helpful assistant.'}

IMPORTANT: You must respond with valid JSON only. Do not include any markdown formatting, code blocks, or explanatory text. Output only the raw JSON object.`;

      const messages: Array<{ role: string; content: string }> = [
        { role: 'system', content: jsonSystemPrompt },
        { role: 'user', content: `${prompt}\n\nRespond with valid JSON only.` },
      ];

      const response = await makeRequest(messages, {
        maxTokens: maxTokens || 4096,
        temperature: temperature ?? 0.5,
        modelOverride,
      });

      // Try to parse the JSON
      let jsonText = response.trim();

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
        throw new Error(`Failed to parse response as JSON: ${e instanceof Error ? e.message : 'Unknown error'}`);
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
        console.log('Testing OpenRouter connection with model:', model);
        const messages = [
          { role: 'user', content: 'Say "Hello from OpenRouter!" in exactly those words.' },
        ];

        const response = await makeRequest(messages, { maxTokens: 50 });

        console.log('OpenRouter test response:', response?.slice(0, 100));

        if (response) {
          return {
            success: true,
            message: `Connected! Using model: ${model}`,
          };
        }

        return {
          success: false,
          message: 'Unexpected response format',
        };
      } catch (error) {
        console.error('OpenRouter test connection error:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';

        if (message.includes('401') || message.includes('invalid') || message.includes('unauthorized') || message.includes('Unauthorized')) {
          return {
            success: false,
            message: 'Invalid API key - check your OpenRouter key',
          };
        }
        if (message.includes('429')) {
          return {
            success: false,
            message: 'Rate limited - please try again later',
          };
        }
        if (message.includes('insufficient') || message.includes('credits') || message.includes('balance')) {
          return {
            success: false,
            message: 'Insufficient credits - add credits at openrouter.ai',
          };
        }
        if (message.includes('model') || message.includes('not found') || message.includes('404')) {
          return {
            success: false,
            message: `Model "${model}" not available - try a different model`,
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
 * Get an OpenRouter client for the given user
 */
export async function getOpenRouterClientForUser(userId: string): Promise<OpenRouterClient | null> {
  const { getUserSettings } = await import('@/lib/auth/user-storage');
  const { decrypt } = await import('@/lib/ai/encryption');

  const settings = await getUserSettings(userId);
  if (!settings?.aiConfig?.openRouterApiKey) {
    return null;
  }

  try {
    const apiKey = decrypt(settings.aiConfig.openRouterApiKey);
    const model = settings.aiConfig.openRouterModel || DEFAULT_MODEL;
    return createOpenRouterClient(apiKey, model);
  } catch (error) {
    console.error('Failed to decrypt OpenRouter API key:', error);
    return null;
  }
}
