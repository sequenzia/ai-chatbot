/**
 * Model definitions for AI Gateway
 * Format: provider/model-name
 */
export const MODELS = [
  { id: 'openai/gpt-oss-120b', name: 'GPT-OSS 120B', provider: 'baseten' },
  { id: 'openai/gpt-5-nano', name: 'GPT-5 Nano', provider: 'openai' },
  { id: 'openai/gpt-5-mini', name: 'GPT-5 Mini', provider: 'openai' },
  { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'openai' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai' },
  { id: 'anthropic/claude-haiku-4.5', name: 'Claude Haiku 4.5', provider: 'anthropic' },
  { id: 'google/gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', provider: 'google' },
  { id: 'deepseek/deepseek-v3.2', name: 'DeepSeek V3.2', provider: 'deepseek' },
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

