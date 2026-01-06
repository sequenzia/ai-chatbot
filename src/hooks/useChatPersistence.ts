'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { nanoid } from 'nanoid';
import type { UIMessage } from '@ai-sdk/react';
import { db, type MessageRecord } from '@/lib/db';

interface UseChatPersistenceOptions {
  conversationId?: string;
  userId?: string;
}

export function useChatPersistence(options: UseChatPersistenceOptions = {}) {
  const { conversationId: initialConversationId, userId } = options;
  const [currentConversationId, setCurrentConversationId] = useState<string>(
    () => initialConversationId || nanoid()
  );
  const isInitializedRef = useRef(false);

  // Load messages for current conversation
  const storedMessages = useLiveQuery(
    () =>
      db.messages
        .where('conversationId')
        .equals(currentConversationId)
        .sortBy('createdAt'),
    [currentConversationId]
  );

  // Convert stored messages to UIMessage format
  const convertToUIMessages = useCallback(
    (records: MessageRecord[]): UIMessage[] => {
      return records.map((record) => ({
        id: record.visibleId,
        role: record.role as 'user' | 'assistant',
        parts: JSON.parse(record.content),
      }));
    },
    []
  );

  // Save a single message
  const saveMessage = useCallback(
    async (message: UIMessage) => {
      try {
        // Use a transaction to atomically check and insert
        await db.transaction('rw', db.messages, db.conversations, async () => {
          // Check if message already exists to prevent duplicates
          const existing = await db.messages
            .where('conversationId')
            .equals(currentConversationId)
            .filter((msg) => msg.visibleId === message.id)
            .first();

          if (existing) {
            return;
          }

          const record: MessageRecord = {
            visibleId: message.id,
            conversationId: currentConversationId,
            role: message.role,
            content: JSON.stringify(message.parts),
            userId,
            createdAt: new Date(),
          };

          await db.messages.add(record);

          // Update conversation timestamp
          await db.conversations.update(currentConversationId, {
            updatedAt: new Date(),
          });
        });
      } catch (error) {
        // Ignore constraint errors (duplicate key) - message already saved
        if (error instanceof Error && error.name === 'ConstraintError') {
          return;
        }
        throw error;
      }
    },
    [currentConversationId, userId]
  );

  // Update an existing message (for streaming updates)
  const updateMessage = useCallback(
    async (message: UIMessage) => {
      const existing = await db.messages
        .where('conversationId')
        .equals(currentConversationId)
        .filter((msg) => msg.visibleId === message.id)
        .first();

      if (existing && existing.id !== undefined) {
        await db.messages.update(existing.id, {
          content: JSON.stringify(message.parts),
        });
      }
    },
    [currentConversationId]
  );

  // Create new conversation
  const createConversation = useCallback(
    async (title?: string) => {
      const id = nanoid();
      const now = new Date();

      await db.conversations.add({
        id,
        title: title || 'New Chat',
        createdAt: now,
        updatedAt: now,
        userId,
      });

      setCurrentConversationId(id);
      return id;
    },
    [userId]
  );

  // Clear current conversation messages
  const clearConversation = useCallback(async () => {
    await db.messages
      .where('conversationId')
      .equals(currentConversationId)
      .delete();
  }, [currentConversationId]);

  // Delete entire conversation
  const deleteConversation = useCallback(
    async (id?: string) => {
      const targetId = id || currentConversationId;
      await db.messages.where('conversationId').equals(targetId).delete();
      await db.conversations.delete(targetId);
    },
    [currentConversationId]
  );

  // Switch to a different conversation
  const switchConversation = useCallback((id: string) => {
    setCurrentConversationId(id);
  }, []);

  // Initialize conversation on mount
  useEffect(() => {
    if (isInitializedRef.current) return;

    const initConversation = async () => {
      try {
        const existing = await db.conversations.get(currentConversationId);
        if (!existing) {
          const now = new Date();
          // Use put instead of add to handle race conditions
          await db.conversations.put({
            id: currentConversationId,
            title: 'New Chat',
            createdAt: now,
            updatedAt: now,
            userId,
          });
        }
        isInitializedRef.current = true;
      } catch (error) {
        // Ignore constraint errors - conversation already exists
        if (error instanceof Error && error.name === 'ConstraintError') {
          isInitializedRef.current = true;
          return;
        }
        throw error;
      }
    };
    initConversation();
  }, [currentConversationId, userId]);

  return {
    conversationId: currentConversationId,
    storedMessages: storedMessages ? convertToUIMessages(storedMessages) : [],
    isLoading: storedMessages === undefined,
    saveMessage,
    updateMessage,
    createConversation,
    clearConversation,
    deleteConversation,
    switchConversation,
  };
}
