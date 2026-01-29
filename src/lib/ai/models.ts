import { getDefaultModelId } from '@/config';

/**
 * Model definitions for OpenAI
 */
export const MODELS = [
  { id: 'gpt-oss-120b', name: 'GPT-OSS-120B', provider: 'openai' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai' },
] as const;

export type Model = (typeof MODELS)[number];
export type ModelId = Model['id'];

// Use env var if set and valid, otherwise fallback to first model
const configuredModelId = getDefaultModelId();
export const DEFAULT_MODEL: Model =
  (configuredModelId ? MODELS.find((m) => m.id === configuredModelId) : undefined) ??
  MODELS[0];

export function getModelById(id: string): Model | undefined {
  return MODELS.find((m) => m.id === id);
}
