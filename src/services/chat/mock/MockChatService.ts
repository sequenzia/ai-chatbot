import type {
  ChatService,
  ChatRequest,
  TitleGenerationRequest,
  TitleGenerationResponse,
} from '../types';
import { createResponseStream } from './responseGenerator';
import { generateMockTitleAsync } from './titleGenerator';
import { getTextFromMessage } from '@/lib/utils/message';

/**
 * Configuration for the mock chat service
 */
export interface MockChatServiceConfig {
  /** Delay between characters when streaming (ms) */
  streamDelayMs: number;
  /** Delay before returning title (ms) */
  titleDelayMs: number;
  /** Whether to log mock operations */
  debug: boolean;
}

const DEFAULT_CONFIG: MockChatServiceConfig = {
  streamDelayMs: 25,
  titleDelayMs: 500,
  debug: false,
};

/**
 * Mock implementation of the ChatService interface.
 * Simulates AI responses with streaming text and tool calls.
 */
export class MockChatService implements ChatService {
  private config: MockChatServiceConfig;

  constructor(config: Partial<MockChatServiceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Stream a mock chat response
   */
  async streamChat(request: ChatRequest): Promise<ReadableStream<Uint8Array>> {
    if (this.config.debug) {
      console.log('[MockChatService] streamChat called with:', {
        messageCount: request.messages.length,
        model: request.model,
      });
    }

    // Get the last user message
    const lastUserMessage = [...request.messages]
      .reverse()
      .find(m => m.role === 'user');

    if (!lastUserMessage) {
      // Return empty stream if no user message
      return new ReadableStream({
        start(controller) {
          controller.enqueue(
            new TextEncoder().encode('data: {"type":"finish"}\n\n')
          );
          controller.close();
        },
      });
    }

    // Extract text from the user message
    const messageText = getTextFromMessage(lastUserMessage);

    if (this.config.debug) {
      console.log('[MockChatService] Processing message:', messageText);
    }

    // Create and return the response stream
    return createResponseStream(messageText, {
      charDelayMs: this.config.streamDelayMs,
    });
  }

  /**
   * Generate a mock conversation title
   */
  async generateTitle(
    request: TitleGenerationRequest
  ): Promise<TitleGenerationResponse> {
    if (this.config.debug) {
      console.log('[MockChatService] generateTitle called:', request);
    }

    try {
      const title = await generateMockTitleAsync(
        request.userMessage,
        this.config.titleDelayMs
      );

      if (this.config.debug) {
        console.log('[MockChatService] Generated title:', title);
      }

      return {
        title,
        useFallback: false,
      };
    } catch (error) {
      console.error('[MockChatService] Title generation error:', error);
      return {
        title: '',
        useFallback: true,
      };
    }
  }
}

/**
 * Create a mock chat service instance
 */
export function createMockChatService(
  config?: Partial<MockChatServiceConfig>
): ChatService {
  return new MockChatService(config);
}
