'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  REASONING_LEVELS,
  DEFAULT_REASONING_LEVEL,
  getModelById,
  type ModelId,
  type ReasoningLevel,
} from '@/lib/ai/models';

const STORAGE_KEY = 'reasoning-levels';

/**
 * Hook for managing reasoning level state with per-model localStorage persistence.
 * Returns undefined for reasoningLevel when the model doesn't support reasoning.
 */
export function useReasoningLevel(modelId: ModelId) {
  const [levelsByModel, setLevelsByModel] = useState<Record<string, ReasoningLevel>>({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validate that stored values are valid reasoning levels
        const validated: Record<string, ReasoningLevel> = {};
        for (const [key, value] of Object.entries(parsed)) {
          if (REASONING_LEVELS.includes(value as ReasoningLevel)) {
            validated[key] = value as ReasoningLevel;
          }
        }
        setLevelsByModel(validated);
      }
    } catch {
      // Invalid JSON, ignore
    }
    setIsInitialized(true);
  }, []);

  // Persist to localStorage when levels change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(levelsByModel));
    }
  }, [levelsByModel, isInitialized]);

  const modelConfig = getModelById(modelId);
  const supportsReasoning = modelConfig?.supportsReasoning ?? false;

  // Return the reasoning level for the current model, or undefined if not supported
  const reasoningLevel = supportsReasoning
    ? (levelsByModel[modelId] ?? DEFAULT_REASONING_LEVEL)
    : undefined;

  const setReasoningLevel = useCallback(
    (level: ReasoningLevel) => {
      if (!supportsReasoning) return;
      // Validate the level before storing
      if (!REASONING_LEVELS.includes(level)) return;
      setLevelsByModel((prev) => ({
        ...prev,
        [modelId]: level,
      }));
    },
    [modelId, supportsReasoning]
  );

  return {
    reasoningLevel,
    setReasoningLevel,
    supportsReasoning,
  };
}
