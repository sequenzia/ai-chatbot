/**
 * Centralized environment configuration
 *
 * All settings can be configured via environment variables.
 * See .env.example for available options.
 */

export type OpenAIApiMode = 'chat-completions' | 'responses';

const VALID_API_MODES: OpenAIApiMode[] = ['chat-completions', 'responses'];

function getApiMode(): OpenAIApiMode {
  const mode = process.env.OPENAI_API_MODE || 'chat-completions';
  if (!VALID_API_MODES.includes(mode as OpenAIApiMode)) {
    throw new Error(
      `Invalid OPENAI_API_MODE: "${mode}". Valid modes: ${VALID_API_MODES.join(', ')}`
    );
  }
  return mode as OpenAIApiMode;
}

export const config = {
  ai: {
    openaiApiKey: process.env.OPENAI_API_KEY,
    apiMode: getApiMode(),
    defaultModel: process.env.AI_DEFAULT_MODEL || 'gpt-4o',
    debug: process.env.AI_DEBUG_ON === 'true',
    titleGeneration: {
      model: process.env.AI_TITLE_MODEL || 'gpt-4o-mini',
      maxLength: parseInt(process.env.AI_TITLE_MAX_LENGTH || '50', 10),
      timeoutMs: parseInt(process.env.AI_TITLE_TIMEOUT_MS || '10000', 10),
    },
    webSearch: {
      enabled: process.env.WEB_SEARCH_ENABLED === 'true',
    },
  },
};
