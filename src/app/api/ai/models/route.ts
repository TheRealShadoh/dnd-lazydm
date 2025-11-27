import { NextResponse } from 'next/server';

interface OpenRouterModel {
  id: string;
  name: string;
  pricing: {
    prompt: string;
    completion: string;
  };
  context_length: number;
}

interface ModelInfo {
  id: string;
  name: string;
  free: boolean;
  contextLength: number;
}

// Fallback models if API call fails
const FALLBACK_MODELS: ModelInfo[] = [
  { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B (Free)', free: true, contextLength: 32768 },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', free: false, contextLength: 200000 },
  { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', free: false, contextLength: 200000 },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', free: false, contextLength: 128000 },
  { id: 'openai/gpt-4o', name: 'GPT-4o', free: false, contextLength: 128000 },
];

// Models we want to show (filter from full list)
const PREFERRED_MODEL_IDS = [
  // Free models
  'mistralai/mistral-7b-instruct:free',
  'google/gemma-2-9b-it:free',
  'meta-llama/llama-3.1-8b-instruct:free',
  'qwen/qwen-2.5-7b-instruct:free',
  // Paid models
  'anthropic/claude-3.5-sonnet',
  'anthropic/claude-3-haiku',
  'anthropic/claude-3-opus',
  'openai/gpt-4o',
  'openai/gpt-4o-mini',
  'openai/gpt-4-turbo',
  'google/gemini-pro-1.5',
  'google/gemini-flash-1.5',
  'meta-llama/llama-3.1-70b-instruct',
  'meta-llama/llama-3.1-405b-instruct',
];

/**
 * GET /api/ai/models
 * Fetch available models from OpenRouter
 */
export async function GET() {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      console.error('Failed to fetch OpenRouter models:', response.status);
      return NextResponse.json({ models: FALLBACK_MODELS, source: 'fallback' });
    }

    const data = await response.json();
    const allModels: OpenRouterModel[] = data.data || [];

    // Filter to preferred models and transform
    const models: ModelInfo[] = allModels
      .filter((model) => PREFERRED_MODEL_IDS.includes(model.id))
      .map((model) => ({
        id: model.id,
        name: model.name,
        free: model.id.includes(':free') || (parseFloat(model.pricing.prompt) === 0 && parseFloat(model.pricing.completion) === 0),
        contextLength: model.context_length,
      }))
      .sort((a, b) => {
        // Sort: free first, then by name
        if (a.free && !b.free) return -1;
        if (!a.free && b.free) return 1;
        return a.name.localeCompare(b.name);
      });

    // If no preferred models found, return fallback
    if (models.length === 0) {
      return NextResponse.json({ models: FALLBACK_MODELS, source: 'fallback' });
    }

    return NextResponse.json({ models, source: 'openrouter' });
  } catch (error) {
    console.error('Error fetching OpenRouter models:', error);
    return NextResponse.json({ models: FALLBACK_MODELS, source: 'fallback' });
  }
}
