import { wrapLanguageModel, gateway, type LanguageModel } from 'ai';
import { devToolsMiddleware } from '@ai-sdk/devtools';
import { config } from '@/config';

/**
 * Get a language model, optionally wrapped with DevTools middleware.
 * DevTools is enabled when AI_DEBUG_ON=true in environment.
 */
export function getModel(modelId: string): LanguageModel {
  const baseModel = gateway(modelId);

  console.log('debug on', config.ai.debug)

  if (config.ai.debug) {
    return wrapLanguageModel({
      model: baseModel,
      middleware: devToolsMiddleware(),
    });
  }

  return baseModel;
}
