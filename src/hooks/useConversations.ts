'use client';

import { useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';

interface UseConversationsOptions {
  userId?: string;
  limit?: number;
}

export function useConversations(options: UseConversationsOptions = {}) {
  const { userId, limit = 50 } = options;

  // Get all conversations, sorted by most recent
  const conversations = useLiveQuery(async () => {
    let query = db.conversations.orderBy('updatedAt').reverse();

    if (userId) {
      query = db.conversations.where('userId').equals(userId).reverse();
    }

    return query.limit(limit).toArray();
  }, [userId, limit]);

  // Update conversation title
  const updateTitle = useCallback(async (id: string, title: string) => {
    await db.conversations.update(id, { title });
  }, []);

  // Delete a conversation
  const deleteConversation = useCallback(async (id: string) => {
    await db.messages.where('conversationId').equals(id).delete();
    await db.conversations.delete(id);
  }, []);

  // Clear all conversations
  const clearAllConversations = useCallback(async () => {
    await db.messages.clear();
    await db.conversations.clear();
  }, []);

  return {
    conversations: conversations || [],
    isLoading: conversations === undefined,
    updateTitle,
    deleteConversation,
    clearAllConversations,
  };
}
