/**
 * Centralized environment configuration
 *
 * All settings can be configured via environment variables.
 * See .env.example for available options.
 */
export const config = {
  ai: {
    openaiApiKey: process.env.OPENAI_API_KEY,
    defaultModel: process.env.AI_DEFAULT_MODEL || 'gpt-4o',
    debug: process.env.AI_DEBUG_ON === 'true',
    titleGeneration: {
      model: process.env.AI_TITLE_MODEL || 'gpt-4o-mini',
      maxLength: parseInt(process.env.AI_TITLE_MAX_LENGTH || '50', 10),
      timeoutMs: parseInt(process.env.AI_TITLE_TIMEOUT_MS || '10000', 10),
    },
  },
};
