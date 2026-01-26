/**
 * Helper to get environment variables from either Vite or process.env
 */
function getEnv(key: string, defaultValue: string = ''): string {
  // Check Vite environment first
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const viteKey = `VITE_${key}`;
    const value = import.meta.env[viteKey];
    if (value !== undefined) {
      return value;
    }
  }

  // Check process.env (for Node.js compatibility if needed)
  if (typeof process !== 'undefined' && process.env) {
    const value = process.env[key];
    if (value !== undefined) {
      return value;
    }
  }

  return defaultValue;
}

/**
 * Centralized environment configuration
 *
 * All settings can be configured via environment variables.
 * In Vite, prefix with VITE_ (e.g., VITE_AI_DEFAULT_MODEL)
 * See .env.example for available options.
 */
export const config = {
  ai: {
    defaultModel: getEnv('AI_DEFAULT_MODEL', 'anthropic/claude-sonnet-4'),
    debug: getEnv('AI_DEBUG_ON', 'false') === 'true',
    titleGeneration: {
      maxLength: parseInt(getEnv('AI_TITLE_MAX_LENGTH', '50'), 10),
      timeoutMs: parseInt(getEnv('AI_TITLE_TIMEOUT_MS', '10000'), 10),
    },
  },
  mock: {
    useMock: getEnv('USE_MOCK_CHAT', 'true') === 'true',
    streamDelayMs: parseInt(getEnv('MOCK_STREAM_DELAY_MS', '25'), 10),
  },
};
