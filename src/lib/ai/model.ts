import { wrapLanguageModel, type LanguageModel } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { devToolsMiddleware } from '@ai-sdk/devtools';
import { config } from '@/config';
import { MODELS } from './models';

const apiKey = config.ai.openaiApiKey;
if (!apiKey) {
  throw new Error(
    'OPENAI_API_KEY environment variable is not set. ' +
    'Please set it in your .env.local file.'
  );
}

const openai = createOpenAI({ apiKey });

/**
 * Get a language model, optionally wrapped with DevTools middleware.
 * DevTools is enabled when AI_DEBUG_ON=true in environment.
 */
export function getModel(modelId: string): LanguageModel {
  const validModel = MODELS.find((m) => m.id === modelId);
  if (!validModel) {
    throw new Error(
      `Invalid model ID: ${modelId}. Valid models: ${MODELS.map((m) => m.id).join(', ')}`
    );
  }

  const baseModel = openai(modelId);

  if (config.ai.debug) {
    return wrapLanguageModel({
      model: baseModel,
      middleware: devToolsMiddleware(),
    });
  }

  return baseModel;
}
