import type { UIMessage } from '@ai-sdk/react';

/**
 * Request types for the chat service
 */
export interface ChatRequest {
  messages: UIMessage[];
  model: string;
}

export interface TitleGenerationRequest {
  userMessage: string;
  conversationId: string;
}

/**
 * Response types
 */
export interface TitleGenerationResponse {
  title: string;
  useFallback: boolean;
}

/**
 * Stream event types matching AI SDK's toUIMessageStreamResponse format
 */
export type StreamEventType =
  | 'text-delta'
  | 'tool-call'
  | 'tool-result'
  | 'finish'
  | 'error';

export interface TextDeltaEvent {
  type: 'text-delta';
  textDelta: string;
}

export interface ToolCallEvent {
  type: 'tool-call';
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
}

export interface ToolResultEvent {
  type: 'tool-result';
  toolCallId: string;
  result: Record<string, unknown>;
}

export interface FinishEvent {
  type: 'finish';
}

export interface ErrorEvent {
  type: 'error';
  error: string;
}

export type StreamEvent =
  | TextDeltaEvent
  | ToolCallEvent
  | ToolResultEvent
  | FinishEvent
  | ErrorEvent;

/**
 * Chat service interface - abstraction layer for chat backend
 */
export interface ChatService {
  /**
   * Stream a chat response for the given messages
   * @returns A ReadableStream that emits Server-Sent Events
   */
  streamChat(request: ChatRequest): Promise<ReadableStream<Uint8Array>>;

  /**
   * Generate a title for a conversation based on the user's message
   */
  generateTitle(request: TitleGenerationRequest): Promise<TitleGenerationResponse>;
}

/**
 * Configuration for the chat service
 */
export interface ChatServiceConfig {
  /** Use mock service instead of real API */
  useMock: boolean;
  /** Character streaming delay in milliseconds (mock only) */
  mockStreamDelayMs?: number;
  /** API endpoint for real service */
  apiEndpoint?: string;
}
