/**
 * Centralized environment configuration
 */
export const config = {
  ai: {
    gatewayApiKey: process.env.AI_GATEWAY_API_KEY,
    defaultModel: 'anthropic/claude-sonnet-4',
  },
} as const;
