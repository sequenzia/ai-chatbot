# Extending Persistence

This tutorial covers adding new fields to the database schema and writing migrations.

## What You'll Learn

- Adding new fields to existing tables
- Writing schema migrations
- Updating hooks to use new fields
- Testing persistence changes

## Prerequisites

- Understanding of [Persistence Module](../modules/persistence.md)
- Familiarity with Dexie and IndexedDB

## Example: Adding Tags to Conversations

We'll add a `tags` field to conversations for categorization.

## Step 1: Update Type Definitions

First, add the new field to the TypeScript interface.

**File**: `src/lib/db/types.ts`

```typescript
export interface ConversationRecord {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
  tags?: string[];  // Add this
}
```

## Step 2: Update Database Schema

Increment the schema version and add a migration.

**File**: `src/lib/db/schema.ts`

```typescript
import Dexie, { type Table } from 'dexie';
import type { ConversationRecord, MessageRecord } from './types';

export class ChatDatabase extends Dexie {
  conversations!: Table<ConversationRecord, string>;
  messages!: Table<MessageRecord, number>;

  constructor() {
    super('AIChatbotDB');

    // Version 1 - Original schema
    this.version(1).stores({
      conversations: 'id, updatedAt, userId',
      messages: '++id, conversationId, userId, createdAt',
    });

    // Version 2 - Add tags field with multi-entry index
    this.version(2).stores({
      conversations: 'id, updatedAt, userId, *tags',  // *tags = multi-entry index
      messages: '++id, conversationId, userId, createdAt',
    }).upgrade(tx => {
      // Migration: Initialize tags for existing conversations
      return tx.table('conversations').toCollection().modify(conv => {
        conv.tags = [];
      });
    });
  }
}

export const db = new ChatDatabase();
```

!!! note "Multi-entry Index"
    The `*tags` syntax creates a multi-entry index, allowing efficient queries like "find all conversations with tag X".

## Step 3: Update useChatPersistence

Modify the hook to handle tags.

**File**: `src/hooks/useChatPersistence.ts`

```typescript
// Update the saveMessage function
const saveMessage = useCallback(async (
  message: UIMessage,
  fallbackTitle?: string,
  initialTags?: string[]  // Add parameter
) => {
  await db.transaction('rw', db.messages, db.conversations, async () => {
    if (!isPersistedRef.current) {
      const existingConv = await db.conversations.get(currentConversationId);
      if (!existingConv) {
        await db.conversations.put({
          id: currentConversationId,
          title: fallbackTitle || 'New Chat',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId,
          tags: initialTags || [],  // Initialize tags
        });
      }
      isPersistedRef.current = true;
    }
    // ... rest of function
  });
}, [currentConversationId, userId]);
```

## Step 4: Add Tag Operations

Add functions to manage tags.

**File**: `src/hooks/useConversations.ts`

```typescript
export function useConversations(options?: UseConversationsOptions) {
  // ... existing code

  // Add tag to conversation
  const addTag = useCallback(async (id: string, tag: string) => {
    const conv = await db.conversations.get(id);
    if (conv) {
      const tags = conv.tags || [];
      if (!tags.includes(tag)) {
        await db.conversations.update(id, {
          tags: [...tags, tag],
          updatedAt: new Date(),
        });
      }
    }
  }, []);

  // Remove tag from conversation
  const removeTag = useCallback(async (id: string, tag: string) => {
    const conv = await db.conversations.get(id);
    if (conv && conv.tags) {
      await db.conversations.update(id, {
        tags: conv.tags.filter(t => t !== tag),
        updatedAt: new Date(),
      });
    }
  }, []);

  // Get conversations by tag
  const getConversationsByTag = useCallback(async (tag: string) => {
    return db.conversations
      .where('tags')
      .equals(tag)
      .toArray();
  }, []);

  return {
    conversations,
    isLoading,
    updateTitle,
    deleteConversation,
    clearAllConversations,
    addTag,           // Add these
    removeTag,
    getConversationsByTag,
  };
}
```

## Step 5: Use in Components

Now you can use tags in your UI.

```typescript
import { useConversations } from '@/hooks/useConversations';

function ConversationItem({ conversation }) {
  const { addTag, removeTag } = useConversations();

  const handleAddTag = async () => {
    await addTag(conversation.id, 'important');
  };

  return (
    <div>
      <span>{conversation.title}</span>
      <div className="tags">
        {conversation.tags?.map(tag => (
          <Badge key={tag} onClick={() => removeTag(conversation.id, tag)}>
            {tag} ×
          </Badge>
        ))}
        <Button size="sm" onClick={handleAddTag}>
          + Tag
        </Button>
      </div>
    </div>
  );
}
```

## Migration Best Practices

### Always Increment Version

```typescript
// Wrong - modifying existing version
this.version(1).stores({
  conversations: 'id, updatedAt, userId, *tags',  // Changed!
});

// Correct - new version
this.version(2).stores({
  conversations: 'id, updatedAt, userId, *tags',
});
```

### Handle Missing Data

```typescript
// Defensive code in components
const tags = conversation.tags ?? [];

// Or with default in query
const convs = await db.conversations.toArray();
return convs.map(c => ({
  ...c,
  tags: c.tags ?? [],
}));
```

### Test Migrations

```typescript
// In development, test migration from scratch
await db.delete(); // Clear database
await db.open();   // Re-create with migrations

// Or test upgrade path
const oldConv = await db.conversations.get('test-id');
console.log('Tags after migration:', oldConv?.tags);
```

## Example: Adding Message Metadata

Here's another example: adding metadata to messages.

### Step 1: Update Types

```typescript
// src/lib/db/types.ts
export interface MessageRecord {
  id?: number;
  visibleId: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  userId?: string;
  createdAt: Date;
  metadata?: {                    // Add this
    model?: string;               // Which model generated this
    tokensUsed?: number;          // Token count
    generationTime?: number;      // Time to generate (ms)
  };
}
```

### Step 2: Update Schema

```typescript
// src/lib/db/schema.ts
this.version(3).stores({
  conversations: 'id, updatedAt, userId, *tags',
  messages: '++id, conversationId, userId, createdAt, metadata.model',
}).upgrade(tx => {
  return tx.table('messages').toCollection().modify(msg => {
    msg.metadata = {};
  });
});
```

### Step 3: Save Metadata

```typescript
// In useChatPersistence.ts
const saveMessage = useCallback(async (
  message: UIMessage,
  fallbackTitle?: string,
  metadata?: MessageMetadata
) => {
  // ...
  await db.messages.add({
    visibleId: message.id,
    conversationId: currentConversationId,
    role: message.role,
    content: JSON.stringify(message.parts),
    userId,
    createdAt: new Date(),
    metadata,  // Add metadata
  });
}, []);
```

## Troubleshooting

### "UpgradeError" on page load

The migration function has an error. Check:

- All fields referenced exist
- No syntax errors in upgrade function
- Version numbers are sequential

```typescript
// Debug by logging
.upgrade(tx => {
  console.log('Running migration to version 2');
  return tx.table('conversations').toCollection().modify(conv => {
    console.log('Migrating conversation:', conv.id);
    conv.tags = [];
  });
});
```

### Data not persisting

Check if the new field is being passed:

```typescript
// Add logging
console.log('Saving with tags:', initialTags);
await db.conversations.put({
  // ...
  tags: initialTags || [],
});

// Verify after save
const saved = await db.conversations.get(id);
console.log('Saved tags:', saved?.tags);
```

### Index not working

Ensure the index is declared correctly:

```typescript
// Wrong - no index for tags
conversations: 'id, updatedAt, userId',

// Correct - with multi-entry index
conversations: 'id, updatedAt, userId, *tags',

// Query using the index
const tagged = await db.conversations
  .where('tags')
  .equals('important')
  .toArray();
```

## Related Docs

- [Persistence Module](../modules/persistence.md) - Full persistence documentation
- [Dexie.js Docs](https://dexie.org/docs/) - Dexie documentation
- [IndexedDB MDN](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) - Browser API docs
