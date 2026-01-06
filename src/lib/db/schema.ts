import Dexie, { type Table } from 'dexie';
import type { ConversationRecord, MessageRecord } from './types';

export class ChatDatabase extends Dexie {
  conversations!: Table<ConversationRecord, string>;
  messages!: Table<MessageRecord, number>;

  constructor() {
    super('AIChatbotDB');

    this.version(1).stores({
      conversations: 'id, updatedAt, userId',
      messages: '++id, conversationId, userId, createdAt',
    });
  }
}
