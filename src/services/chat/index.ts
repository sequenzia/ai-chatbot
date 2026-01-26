import type { ChatTransport, UIMessage } from 'ai';
import type { ChatService, ChatServiceConfig } from './types';
import { MockChatService } from './mock/MockChatService';
import { MockChatTransport } from './transport/MockChatTransport';

// Re-export types
export type { ChatService, ChatServiceConfig } from './types';
export type { MockChatServiceConfig } from './mock/MockChatService';
export type { MockChatTransportConfig } from './transport/MockChatTransport';

// Re-export implementations
export { MockChatService } from './mock/MockChatService';
export { MockChatTransport } from './transport/MockChatTransport';

/**
 * Default configuration - uses mock service
 */
const DEFAULT_CONFIG: ChatServiceConfig = {
  useMock: true,
  mockStreamDelayMs: 25,
};

/**
 * Get the current chat service configuration
 */
export function getChatServiceConfig(): ChatServiceConfig {
  // In Vite, use import.meta.env; in Node/Next, use process.env
  const useMock = getEnvVar('VITE_USE_MOCK_CHAT', 'true') === 'true';
  const mockStreamDelayMs = parseInt(getEnvVar('VITE_MOCK_STREAM_DELAY_MS', '25'), 10);

  return {
    useMock,
    mockStreamDelayMs,
  };
}

/**
 * Create a chat service based on configuration
 */
export function createChatService(
  config: Partial<ChatServiceConfig> = {}
): ChatService {
  const finalConfig = { ...DEFAULT_CONFIG, ...getChatServiceConfig(), ...config };

  if (finalConfig.useMock) {
    return new MockChatService({
      streamDelayMs: finalConfig.mockStreamDelayMs ?? 25,
      debug: false,
    });
  }

  // Future: Return real chat service implementation
  // For now, always return mock
  return new MockChatService({
    streamDelayMs: finalConfig.mockStreamDelayMs ?? 25,
    debug: false,
  });
}

/**
 * Create a chat transport for use with AI SDK's Chat class
 */
export function createChatTransport(options: {
  model?: string;
  body?: Record<string, unknown>;
} = {}): ChatTransport<UIMessage> {
  const config = getChatServiceConfig();

  if (config.useMock) {
    return new MockChatTransport({
      model: options.model ?? (options.body?.model as string),
      streamDelayMs: config.mockStreamDelayMs,
    });
  }

  // Future: Return DefaultChatTransport with real API
  // For now, always return mock
  return new MockChatTransport({
    model: options.model ?? (options.body?.model as string),
    streamDelayMs: config.mockStreamDelayMs,
  });
}

/**
 * Get the chat service for title generation and other non-streaming operations
 */
let chatServiceInstance: ChatService | null = null;

export function getChatService(): ChatService {
  if (!chatServiceInstance) {
    chatServiceInstance = createChatService();
  }
  return chatServiceInstance;
}

/**
 * Helper to get environment variables with fallback
 * Works in both Vite (import.meta.env) and Node (process.env) environments
 */
function getEnvVar(key: string, defaultValue: string): string {
  // Check Vite environment first
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const value = import.meta.env[key];
    if (value !== undefined) {
      return value;
    }
  }

  // Check process.env (Node/Next.js)
  if (typeof process !== 'undefined' && process.env) {
    const value = process.env[key];
    if (value !== undefined) {
      return value;
    }
  }

  return defaultValue;
}
