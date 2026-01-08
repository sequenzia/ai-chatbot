/**
 * Centralized environment configuration
 *
 * All settings can be configured via environment variables.
 * See .env.example for available options.
 */
export const config = {
  ai: {
    gatewayApiKey: process.env.AI_GATEWAY_API_KEY,
    defaultModel: process.env.AI_DEFAULT_MODEL || 'anthropic/claude-sonnet-4',
    debug: process.env.AI_DEBUG_ON === 'true',
    titleGeneration: {
      model: process.env.AI_TITLE_MODEL || 'anthropic/claude-haiku-4.5',
      maxLength: parseInt(process.env.AI_TITLE_MAX_LENGTH || '50', 10),
      timeoutMs: parseInt(process.env.AI_TITLE_TIMEOUT_MS || '10000', 10),
    },
  },
};
