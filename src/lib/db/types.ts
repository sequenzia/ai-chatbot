/**
 * Database record types for Dexie IndexedDB persistence
 */

export interface ConversationRecord {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
}

export interface MessageRecord {
  id?: number; // Auto-incremented, optional on insert
  visibleId: string; // Maps to UIMessage.id
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string; // JSON stringified parts
  userId?: string;
  createdAt: Date;
}
