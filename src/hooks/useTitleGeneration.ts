import { useCallback, useRef } from 'react';
import { config } from '@/config';
import { getChatService } from '@/services/chat';

interface UseTitleGenerationOptions {
  onTitleGenerated?: (conversationId: string, title: string) => void;
  onError?: (error: Error) => void;
}

export function useTitleGeneration(options: UseTitleGenerationOptions = {}) {
  const { onTitleGenerated, onError } = options;
  const pendingRef = useRef<Set<string>>(new Set());

  const generateFallbackTitle = useCallback((userMessage: string): string => {
    const maxLength = config.ai.titleGeneration.maxLength;
    let title = userMessage.trim();

    // Remove newlines and extra whitespace
    title = title.replace(/\s+/g, ' ');

    if (title.length <= maxLength) return title;

    // Truncate at word boundary
    const truncated = title.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');

    if (lastSpace > maxLength * 0.6) {
      return truncated.substring(0, lastSpace) + '...';
    }

    return truncated.substring(0, maxLength - 3) + '...';
  }, []);

  const generateTitle = useCallback(
    async (conversationId: string, userMessage: string) => {
      // Prevent duplicate requests for same conversation
      if (pendingRef.current.has(conversationId)) return;
      pendingRef.current.add(conversationId);

      const fallbackTitle = generateFallbackTitle(userMessage);
      let attempts = 0;
      const maxAttempts = 3;
      const baseDelay = 1000;

      const attemptGeneration = async (): Promise<string> => {
        try {
          const chatService = getChatService();
          const response = await chatService.generateTitle({
            userMessage,
            conversationId,
          });

          if (response.useFallback || !response.title) {
            return fallbackTitle;
          }

          return response.title;
        } catch (error) {
          attempts++;

          if (attempts < maxAttempts) {
            // Exponential backoff: 1s, 2s, 4s
            const delay = baseDelay * Math.pow(2, attempts - 1);
            await new Promise((resolve) => setTimeout(resolve, delay));
            return attemptGeneration();
          }

          console.error('Title generation failed after retries:', error);
          onError?.(error instanceof Error ? error : new Error(String(error)));
          return fallbackTitle;
        }
      };

      try {
        const title = await attemptGeneration();
        onTitleGenerated?.(conversationId, title);
      } finally {
        pendingRef.current.delete(conversationId);
      }
    },
    [generateFallbackTitle, onTitleGenerated, onError]
  );

  return {
    generateTitle,
    generateFallbackTitle,
  };
}
