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

export const DEFAULT_MODEL = MODELS.find((m) => m.id === 'gpt-4o') ?? MODELS[0];

export function getModelById(id: string): Model | undefined {
  return MODELS.find((m) => m.id === id);
}
