/**
 * Model definitions for AI Gateway
 * Format: provider/model-name
 */
export const MODELS = [
  { id: 'openai/gpt-oss-120b', name: 'GPT-OSS 120B', provider: 'baseten' },
  { id: 'anthropic/claude-sonnet-4', name: 'Claude Sonnet 4', provider: 'anthropic' },
  { id: 'anthropic/claude-haiku', name: 'Claude Haiku', provider: 'anthropic' },
  { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'openai' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai' },
  { id: 'google/gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'google' },
] as const;

export type Model = (typeof MODELS)[number];
export type ModelId = Model['id'];
export type Provider = Model['provider'];

export const DEFAULT_MODEL = MODELS[0];

export function getModelById(id: string): Model | undefined {
  return MODELS.find((m) => m.id === id);
}

export function getModelsByProvider(provider: Provider): Model[] {
  return MODELS.filter((m) => m.provider === provider);
}
