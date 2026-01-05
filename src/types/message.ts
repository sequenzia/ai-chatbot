import { z } from 'zod';

/**
 * Content block schemas for AI SDK message parts
 */
export const TextBlockSchema = z.object({
  type: z.literal('text'),
  text: z.string(),
});

export const ToolCallBlockSchema = z.object({
  type: z.literal('tool-call'),
  toolCallId: z.string(),
  toolName: z.string(),
  args: z.record(z.unknown()).optional(),
});

export const ToolResultBlockSchema = z.object({
  type: z.literal('tool-result'),
  toolCallId: z.string(),
  result: z.unknown(),
});

export const ContentBlockSchema = z.discriminatedUnion('type', [
  TextBlockSchema,
  ToolCallBlockSchema,
  ToolResultBlockSchema,
]);

export type TextBlock = z.infer<typeof TextBlockSchema>;
export type ToolCallBlock = z.infer<typeof ToolCallBlockSchema>;
export type ToolResultBlock = z.infer<typeof ToolResultBlockSchema>;
export type ContentBlock = z.infer<typeof ContentBlockSchema>;

/**
 * Message schema matching AI SDK UIMessage
 */
export const MessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant', 'system']),
  parts: z.array(ContentBlockSchema),
  createdAt: z.date().optional(),
});

export type Message = z.infer<typeof MessageSchema>;

/**
 * Helper to extract text content from message parts
 */
export function getTextContent(parts: ContentBlock[]): string {
  return parts
    .filter((part): part is TextBlock => part.type === 'text')
    .map((part) => part.text)
    .join('');
}

/**
 * Helper to check if message has any text content
 */
export function hasTextContent(parts: ContentBlock[]): boolean {
  return parts.some((part) => part.type === 'text' && part.text.trim().length > 0);
}
