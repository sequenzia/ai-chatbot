import type { ChatTransport, UIMessage, UIMessageChunk, ChatRequestOptions } from 'ai';
import type { ChatService } from '../types';
import { createMockChatService } from '../mock/MockChatService';
import { nanoid } from 'nanoid';

/**
 * Configuration for MockChatTransport
 */
export interface MockChatTransportConfig {
  /** Optional pre-configured chat service */
  chatService?: ChatService;
  /** Model to use (passed through for logging/debugging) */
  model?: string;
  /** Stream delay in milliseconds */
  streamDelayMs?: number;
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * AI SDK ChatTransport implementation that uses the mock chat service.
 * This allows seamless integration with the useChat hook and Chat class.
 */
export class MockChatTransport implements ChatTransport<UIMessage> {
  private chatService: ChatService;
  private model: string;
  private debug: boolean;

  constructor(config: MockChatTransportConfig = {}) {
    this.chatService = config.chatService ?? createMockChatService({
      streamDelayMs: config.streamDelayMs ?? 25,
      debug: config.debug ?? false,
    });
    this.model = config.model ?? 'mock-model';
    this.debug = config.debug ?? false;
  }

  /**
   * Send messages and receive a streaming response.
   * This method is called by the AI SDK's useChat hook.
   */
  sendMessages = async (
    options: {
      trigger: 'submit-message' | 'regenerate-message';
      chatId: string;
      messageId: string | undefined;
      messages: UIMessage[];
      abortSignal: AbortSignal | undefined;
    } & ChatRequestOptions
  ): Promise<ReadableStream<UIMessageChunk>> => {
    const { messages, abortSignal, body } = options;

    if (this.debug) {
      console.log('[MockChatTransport] sendMessages called:', {
        messageCount: messages.length,
        model: this.model,
      });
    }

    // Extract model from request body if provided
    const model = (body as { model?: string })?.model ?? this.model;

    // Get the streaming response from the mock service
    const rawStream = await this.chatService.streamChat({
      messages,
      model,
    });

    // Parse SSE events and convert to UIMessageChunk stream
    return this.parseSSEStream(rawStream, abortSignal);
  };

  /**
   * Reconnect to an existing stream (not supported in mock mode).
   */
  reconnectToStream = async (
    _options: { chatId: string } & ChatRequestOptions
  ): Promise<ReadableStream<UIMessageChunk> | null> => {
    // Mock transport does not support reconnection
    return null;
  };

  /**
   * Parse SSE stream into UIMessageChunk stream
   */
  private parseSSEStream(
    rawStream: ReadableStream<Uint8Array>,
    abortSignal?: AbortSignal
  ): ReadableStream<UIMessageChunk> {
    const reader = rawStream.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let currentTextId = '';
    let textStarted = false;

    return new ReadableStream<UIMessageChunk>({
      async pull(controller) {
        if (abortSignal?.aborted) {
          reader.cancel();
          controller.close();
          return;
        }

        try {
          const { value, done } = await reader.read();

          if (done) {
            // Send text-end if we had text content
            if (textStarted && currentTextId) {
              controller.enqueue({
                type: 'text-end',
                id: currentTextId,
              });
            }
            controller.close();
            return;
          }

          buffer += decoder.decode(value, { stream: true });

          // Process complete SSE events
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || ''; // Keep incomplete data in buffer

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonStr = line.slice(6);
              try {
                const event = JSON.parse(jsonStr);
                const chunks = convertToUIMessageChunks(
                  event,
                  currentTextId,
                  textStarted,
                  (id) => { currentTextId = id; },
                  (started) => { textStarted = started; }
                );
                for (const chunk of chunks) {
                  controller.enqueue(chunk);
                }
              } catch (e) {
                console.error('Failed to parse SSE event:', e);
              }
            }
          }
        } catch (error) {
          if (abortSignal?.aborted) {
            controller.close();
          } else {
            controller.error(error);
          }
        }
      },

      cancel() {
        reader.cancel();
      },
    });
  }
}

/**
 * Convert our internal stream events to UIMessageChunk format
 */
function convertToUIMessageChunks(
  event: {
    type: string;
    textDelta?: string;
    toolCallId?: string;
    toolName?: string;
    args?: Record<string, unknown>;
    result?: Record<string, unknown>;
  },
  currentTextId: string,
  textStarted: boolean,
  setTextId: (id: string) => void,
  setTextStarted: (started: boolean) => void
): UIMessageChunk[] {
  const chunks: UIMessageChunk[] = [];

  switch (event.type) {
    case 'text-delta': {
      // Track the chunk ID locally to ensure text-start and text-delta share the same ID
      let chunkId: string;
      if (!textStarted) {
        chunkId = nanoid();
        setTextId(chunkId);
        setTextStarted(true);
        chunks.push({
          type: 'text-start',
          id: chunkId,
        });
      } else {
        chunkId = currentTextId;
      }
      chunks.push({
        type: 'text-delta',
        id: chunkId || nanoid(),
        delta: event.textDelta || '',
      });
      break;
    }

    case 'tool-call':
      // End any pending text
      if (textStarted && currentTextId) {
        chunks.push({
          type: 'text-end',
          id: currentTextId,
        });
        setTextStarted(false);
      }
      chunks.push({
        type: 'tool-input-available',
        toolCallId: event.toolCallId || nanoid(),
        toolName: event.toolName || '',
        input: event.args || {},
      });
      break;

    case 'tool-result':
      chunks.push({
        type: 'tool-output-available',
        toolCallId: event.toolCallId || '',
        output: event.result || {},
      });
      break;

    case 'finish':
      // End any pending text
      if (textStarted && currentTextId) {
        chunks.push({
          type: 'text-end',
          id: currentTextId,
        });
        setTextStarted(false);
      }
      chunks.push({
        type: 'finish',
        finishReason: 'stop',
      });
      break;

    case 'error':
      chunks.push({
        type: 'error',
        errorText: 'An error occurred',
      });
      break;
  }

  return chunks;
}

/**
 * Create a MockChatTransport instance with optional configuration
 */
export function createMockChatTransport(
  config?: MockChatTransportConfig
): ChatTransport<UIMessage> {
  return new MockChatTransport(config);
}
