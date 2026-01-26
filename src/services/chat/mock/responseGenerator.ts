import { nanoid } from 'nanoid';
import type { StreamEvent } from '../types';
import {
  MOCK_TEXT_RESPONSES,
  TOOL_INTRO_TEXT,
  getRandomItem,
} from './mockData';
import { detectTool, isGreeting, type DetectedTool } from './toolDetector';

/**
 * Configuration for response generation
 */
export interface ResponseGeneratorConfig {
  /** Delay between characters in milliseconds */
  charDelayMs: number;
  /** Delay before tool result in milliseconds */
  toolResultDelayMs: number;
}

const DEFAULT_CONFIG: ResponseGeneratorConfig = {
  charDelayMs: 25,
  toolResultDelayMs: 100,
};

/**
 * Generate a mock streaming response for the given message
 */
export async function* generateResponse(
  userMessage: string,
  config: Partial<ResponseGeneratorConfig> = {}
): AsyncGenerator<StreamEvent> {
  const { charDelayMs, toolResultDelayMs } = { ...DEFAULT_CONFIG, ...config };

  // Check for tool call first
  const detectedTool = detectTool(userMessage);

  if (detectedTool) {
    // Generate intro text
    const introTexts = TOOL_INTRO_TEXT[detectedTool.name] || TOOL_INTRO_TEXT.generateCard;
    const introText = getRandomItem(introTexts);

    // Stream intro text
    yield* streamText(introText, charDelayMs);

    // Add newlines for spacing
    yield { type: 'text-delta', textDelta: '\n\n' };

    // Emit tool call
    const toolCallId = `tc_${nanoid(10)}`;
    yield {
      type: 'tool-call',
      toolCallId,
      toolName: detectedTool.name,
      args: detectedTool.data,
    };

    // Small delay before tool result
    await delay(toolResultDelayMs);

    // Emit tool result
    yield {
      type: 'tool-result',
      toolCallId,
      result: detectedTool.data,
    };
  } else {
    // Generate text-only response
    const responseText = generateTextResponse(userMessage);
    yield* streamText(responseText, charDelayMs);
  }

  // Finish
  yield { type: 'finish' };
}

/**
 * Stream text character by character
 */
async function* streamText(
  text: string,
  charDelayMs: number
): AsyncGenerator<StreamEvent> {
  for (const char of text) {
    yield { type: 'text-delta', textDelta: char };
    await delay(charDelayMs);
  }
}

/**
 * Generate appropriate text response based on message content
 */
function generateTextResponse(message: string): string {
  if (isGreeting(message)) {
    return getRandomItem(MOCK_TEXT_RESPONSES.greeting);
  }

  // Check for common question patterns
  if (/\?$/.test(message.trim())) {
    return generateAnswerResponse(message);
  }

  // Default response
  return getRandomItem(MOCK_TEXT_RESPONSES.fallback);
}

/**
 * Generate a mock answer for questions
 */
function generateAnswerResponse(question: string): string {
  const lowerQuestion = question.toLowerCase();

  // Time-related questions
  if (/what\s*(time|day|date)\s*(is\s*it)?/i.test(lowerQuestion)) {
    const now = new Date();
    return `The current date and time is ${now.toLocaleString()}. Is there anything else I can help you with?`;
  }

  // "How are you" type questions
  if (/how\s+are\s+you/i.test(lowerQuestion)) {
    return "I'm doing great, thank you for asking! I'm here and ready to help you with whatever you need. What can I assist you with today?";
  }

  // "What can you do" type questions
  if (/what\s+(can|do)\s+you\s+(do|help)/i.test(lowerQuestion)) {
    return "I can help you with a variety of tasks! I can:\n\n" +
      "• Create interactive forms for data collection\n" +
      "• Generate charts and data visualizations\n" +
      "• Write and explain code in various languages\n" +
      "• Create informative cards and summaries\n\n" +
      "Just describe what you need, and I'll do my best to help!";
  }

  // "Who are you" type questions
  if (/who\s+are\s+you/i.test(lowerQuestion) || /what\s+are\s+you/i.test(lowerQuestion)) {
    return "I'm an AI assistant designed to help you with various tasks. I can create forms, charts, code snippets, and informational cards based on your requests. I'm running in demo mode right now, but I'm still happy to show you what I can do!";
  }

  // Default general response
  return getRandomItem(MOCK_TEXT_RESPONSES.general) + '\n\n' + generateTopicResponse(question);
}

/**
 * Generate topic-specific elaboration
 */
function generateTopicResponse(question: string): string {
  const topics = [
    "This is an interesting area that many people are curious about.",
    "There are several aspects to consider when thinking about this.",
    "Let me break this down into a few key points for you.",
    "This is something that comes up frequently in conversations.",
  ];

  return getRandomItem(topics) + " Feel free to ask follow-up questions or let me know if you'd like me to create a visualization or code example related to this topic.";
}

/**
 * Helper to create a delay promise
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a ReadableStream from the response generator
 */
export function createResponseStream(
  userMessage: string,
  config?: Partial<ResponseGeneratorConfig>
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const generator = generateResponse(userMessage, config);

  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await generator.next();

      if (done) {
        controller.close();
        return;
      }

      // Format as Server-Sent Event
      const sseData = `data: ${JSON.stringify(value)}\n\n`;
      controller.enqueue(encoder.encode(sseData));
    },
  });
}
