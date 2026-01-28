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
 * API mode is controlled by OPENAI_API_MODE environment variable.
 */
export function getModel(modelId: string): LanguageModel {
  const validModel = MODELS.find((m) => m.id === modelId);
  if (!validModel) {
    throw new Error(
      `Invalid model ID: ${modelId}. Valid models: ${MODELS.map((m) => m.id).join(', ')}`
    );
  }

  // Select API based on config: chat-completions (default) or responses
  const baseModel =
    config.ai.apiMode === 'responses'
      ? openai.responses(modelId)
      : openai.chat(modelId);

  if (config.ai.debug) {
    return wrapLanguageModel({
      model: baseModel,
      middleware: devToolsMiddleware(),
    });
  }

  return baseModel;
}
