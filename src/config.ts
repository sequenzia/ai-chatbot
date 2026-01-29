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

// Client-accessible configuration (uses NEXT_PUBLIC_ prefix)
// These values are embedded at build time
const clientConfig = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_CHAT_API_URL || '',
    agent: process.env.NEXT_PUBLIC_AI_AGENT || undefined,
  },
  ai: {
    defaultModel: process.env.NEXT_PUBLIC_AI_DEFAULT_MODEL || undefined,
  },
};

/**
 * Get the full API URL for a given endpoint.
 * If NEXT_PUBLIC_CHAT_API_URL is set, uses that as base URL.
 * Otherwise, uses local /api endpoints.
 *
 * @param endpoint - The API endpoint name
 * @returns The full URL to call
 *
 * @example
 * // With NEXT_PUBLIC_CHAT_API_URL=https://api.example.com
 * getApiUrl('chat') // => 'https://api.example.com/chat'
 *
 * // Without NEXT_PUBLIC_CHAT_API_URL (default)
 * getApiUrl('chat') // => '/api/chat'
 */
export function getApiUrl(endpoint: 'chat' | 'generate-title'): string {
  const base = clientConfig.api.baseUrl;
  if (base) {
    // Custom backend: append endpoint to base URL
    return `${base.replace(/\/$/, '')}/${endpoint}`;
  }
  // Built-in API: use local endpoints
  return `/api/${endpoint}`;
}

/**
 * Get the configured agent for chat API requests.
 * Returns undefined if not configured, which means the agent
 * parameter will be omitted from requests.
 */
export function getAgent(): string | undefined {
  return clientConfig.api.agent;
}

/**
 * Get the configured default model ID.
 * Returns undefined if not configured, allowing callers to use their own fallback.
 */
export function getDefaultModelId(): string | undefined {
  return clientConfig.ai.defaultModel;
}
