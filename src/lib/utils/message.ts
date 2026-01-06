import type { UIMessage } from '@ai-sdk/react';

/**
 * Extract plain text content from UIMessage parts
 */
export function getTextFromMessage(message: UIMessage): string {
  return message.parts
    .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
    .map((part) => part.text)
    .join(' ')
    .trim();
}

/**
 * Get first N characters from message text, truncated at word boundary
 */
export function getMessagePreview(
  message: UIMessage,
  maxLength: number = 50
): string {
  const text = getTextFromMessage(message);

  if (text.length <= maxLength) return text;

  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > maxLength * 0.6) {
    return truncated.substring(0, lastSpace) + '...';
  }

  return truncated.substring(0, maxLength - 3) + '...';
}

/**
 * Truncate text at word boundary
 */
export function truncateAtWordBoundary(
  text: string,
  maxLength: number
): string {
  // Remove newlines and extra whitespace
  const cleaned = text.replace(/\s+/g, ' ').trim();

  if (cleaned.length <= maxLength) return cleaned;

  const truncated = cleaned.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > maxLength * 0.6) {
    return truncated.substring(0, lastSpace) + '...';
  }

  return truncated.substring(0, maxLength - 3) + '...';
}
