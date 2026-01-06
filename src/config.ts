/**
 * Centralized environment configuration
 */
export const config = {
  ai: {
    gatewayApiKey: process.env.AI_GATEWAY_API_KEY,
    defaultModel: 'anthropic/claude-sonnet-4',
    titleGeneration: {
      model: 'anthropic/claude-haiku-4.5',
      maxLength: 50,
      timeoutMs: 10000,
    },
  },
} as const;
