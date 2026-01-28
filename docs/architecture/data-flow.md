# Data Flow

This document describes how data flows through the application for common operations.

## Message Lifecycle

The complete flow from user input to persisted message:

```mermaid
sequenceDiagram
    participant User
    participant ChatInput
    participant ChatProvider
    participant Transport as DefaultChatTransport
    participant API as /api/chat
    participant OpenAI
    participant UI as ChatMessageItem
    participant Persistence as useChatPersistence
    participant DB as IndexedDB

    User->>ChatInput: Types message
    ChatInput->>ChatProvider: sendMessage(text)
    ChatProvider->>ChatProvider: Validate text.trim()
    ChatProvider->>Transport: POST /api/chat

    Transport->>API: { messages, model }
    API->>API: getModel(model)
    API->>API: Convert UIMessages
    API->>OpenAI: streamText()

    loop Streaming
        OpenAI-->>API: Token chunks
        API-->>Transport: Stream response
        Transport-->>ChatProvider: Update messages
        ChatProvider-->>UI: Re-render
    end

    OpenAI->>API: Stream complete
    API->>Transport: Close stream
    Transport->>ChatProvider: status = 'ready'

    ChatProvider->>Persistence: saveMessage(userMsg)
    ChatProvider->>Persistence: saveMessage(assistantMsg)
    Persistence->>DB: Transaction: Insert messages

    Note over ChatProvider: After first exchange
    ChatProvider->>ChatProvider: generateTitle()
```

### Step-by-Step Breakdown

#### 1. User Input

```typescript
// ChatInput.tsx
const handleSubmit = () => {
  if (text.trim()) {
    sendMessage(text);
    setText('');
  }
};
```

#### 2. Context Provider

```typescript
// ChatProvider.tsx
const sendMessage = useCallback((text: string) => {
  if (!text.trim()) return;
  chat.sendMessage({ text });
}, [chat]);
```

#### 3. API Route

```typescript
// /api/chat/route.ts
export async function POST(request: Request) {
  const { messages, model: selectedModel } = await request.json();

  const result = streamText({
    model: getModel(selectedModel),
    system: SYSTEM_PROMPT,
    messages: convertToModelMessages(messages),
    tools: chatTools,
    stopWhen: stepCountIs(3),
  });

  return result.toUIMessageStreamResponse();
}
```

#### 4. Persistence

```typescript
// ChatProvider.tsx useEffect
if (status === 'ready') {
  const newMessages = messages.filter(m => !previousIds.has(m.id));
  for (const message of newMessages) {
    await saveMessage(message, fallbackTitle);
  }
}
```

## Tool Execution Flow

When the AI decides to use a tool:

```mermaid
sequenceDiagram
    participant AI as OpenAI
    participant API as /api/chat
    participant Tool as Tool Handler
    participant Stream
    participant UI as ChatMessageItem
    participant Block as ContentBlock

    AI->>API: tool_call (generateChart)
    API->>Tool: Validate with Zod
    Tool->>Tool: execute(params)
    Tool-->>API: { type: 'chart', data: [...] }

    API->>Stream: tool-generateChart part
    Stream->>UI: Update message.parts

    UI->>UI: Detect tool- prefix
    UI->>UI: Check CONTENT_BLOCK_TOOLS
    UI->>Block: Render ContentBlock

    Block->>Block: Switch on content.type
    Block->>Block: Render ChartContent
```

### Tool Execution Code

```typescript
// src/lib/ai/tools.ts
export const generateChart = tool<ChartContentData, ChartContentData>({
  description: "Generate a data visualization chart",
  inputSchema: ChartContentDataSchema,
  execute: async (input) => input, // Pass-through pattern
});
```

### Tool Result Rendering

```typescript
// ChatMessageItem.tsx
const CONTENT_BLOCK_TOOLS = [
  'generateForm',
  'generateChart',
  'generateCode',
  'generateCard',
];

// In render
if (part.type.startsWith('tool-')) {
  const toolName = part.type.replace('tool-', '');
  if (CONTENT_BLOCK_TOOLS.includes(toolName)) {
    if (toolPart.state === 'output-available') {
      return <ContentBlock content={toolPart.output} />;
    }
  }
}
```

## Persistence Flow

How messages are saved to IndexedDB:

```mermaid
sequenceDiagram
    participant Provider as ChatProvider
    participant Hook as useChatPersistence
    participant Dexie
    participant DB as IndexedDB

    Provider->>Hook: saveMessage(msg, fallbackTitle)

    Hook->>Hook: Check isPersistedRef

    alt First message in conversation
        Hook->>Dexie: db.transaction('rw', ...)
        Dexie->>DB: Check if conversation exists
        DB-->>Dexie: Not found
        Dexie->>DB: INSERT conversation
        Note over DB: { id, title: fallbackTitle, ... }
        Hook->>Hook: isPersistedRef = true
    end

    Hook->>Dexie: Check for duplicate message
    Dexie->>DB: WHERE visibleId = msg.id
    DB-->>Dexie: Not found

    Hook->>Dexie: INSERT message
    Note over DB: { visibleId, conversationId, content: JSON.stringify(parts) }

    Hook->>Dexie: UPDATE conversation.updatedAt
    Dexie->>DB: COMMIT transaction
```

### Delayed Conversation Creation

```typescript
// useChatPersistence.ts
const saveMessage = useCallback(async (message, fallbackTitle) => {
  await db.transaction('rw', db.messages, db.conversations, async () => {
    // Only create conversation on first save
    if (!isPersistedRef.current) {
      const existing = await db.conversations.get(currentConversationId);
      if (!existing) {
        await db.conversations.put({
          id: currentConversationId,
          title: fallbackTitle || 'New Chat',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      isPersistedRef.current = true;
    }

    // Check for duplicate
    const duplicate = await db.messages
      .where('conversationId')
      .equals(currentConversationId)
      .filter(m => m.visibleId === message.id)
      .first();

    if (duplicate) return;

    // Insert message
    await db.messages.add({
      visibleId: message.id,
      conversationId: currentConversationId,
      role: message.role,
      content: JSON.stringify(message.parts),
      createdAt: new Date(),
    });

    await db.conversations.update(currentConversationId, {
      updatedAt: new Date(),
    });
  });
}, [currentConversationId]);
```

## Conversation Switching Flow

When user clicks a conversation in the sidebar:

```mermaid
sequenceDiagram
    participant User
    participant Sidebar
    participant Provider as ChatProvider
    participant Hook as useChatPersistence
    participant DB as IndexedDB
    participant UI as ChatConversation

    User->>Sidebar: Click conversation
    Sidebar->>Provider: switchConversation(id)

    Provider->>Provider: setMessages([])
    Provider->>Provider: hasLoadedRef = true
    Provider->>Provider: titleGeneratedRef.add(id)

    Provider->>Hook: switchConversationDb(id)
    Hook->>DB: Direct query (not live query)
    DB-->>Hook: messages[]

    Hook->>Hook: Convert to UIMessages
    Hook-->>Provider: UIMessage[]

    Provider->>Provider: setMessages(messages)
    Provider->>Provider: previousMessagesRef = messages

    Provider-->>UI: Re-render with new messages
```

### Why Direct Query?

The `switchConversation` function uses a direct database query instead of the live query to avoid UI flicker:

```typescript
// useChatPersistence.ts
const switchConversation = useCallback(async (id: string) => {
  // Direct fetch bypasses live query reactivity lag
  const records = await db.messages
    .where('conversationId')
    .equals(id)
    .sortBy('createdAt');

  return records.map(convertToUIMessage);
}, []);
```

## Title Generation Flow

After the first user+assistant exchange:

```mermaid
sequenceDiagram
    participant Provider as ChatProvider
    participant Hook as useTitleGeneration
    participant API as /api/generate-title
    participant OpenAI
    participant DB as IndexedDB

    Provider->>Provider: Check conditions
    Note over Provider: hasUserMsg && hasAssistantMsg && !generated

    Provider->>Hook: generateTitle(convId, userText)
    Hook->>Hook: Check pendingRef
    Hook->>Hook: Set pendingRef = convId

    loop Retry (max 3 attempts)
        Hook->>API: POST { userMessage, conversationId }
        API->>OpenAI: Generate title

        alt Success
            OpenAI-->>API: "Title text"
            API-->>Hook: { title: "Title text" }
            Hook->>DB: updateTitle(convId, title)
            Hook->>Hook: pendingRef = null
        else Failure
            Hook->>Hook: Wait 1s/2s/4s
        end
    end

    alt All retries failed
        Hook->>Hook: Use fallbackTitle
        Note over Hook: First 50 chars of user message
    end
```

### Retry Logic

```typescript
// useTitleGeneration.ts
const generateTitle = async (conversationId: string, userMessage: string) => {
  const fallbackTitle = generateFallbackTitle(userMessage);
  let attempts = 0;
  const maxAttempts = 3;
  const baseDelay = 1000;

  const attemptGeneration = async (): Promise<string> => {
    try {
      const response = await fetch(getApiUrl('generate-title'), {
        method: 'POST',
        body: JSON.stringify({ userMessage, conversationId }),
      });
      const data = await response.json();
      return data.title || fallbackTitle;
    } catch (error) {
      attempts++;
      if (attempts < maxAttempts) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = baseDelay * Math.pow(2, attempts - 1);
        await new Promise(r => setTimeout(r, delay));
        return attemptGeneration();
      }
      return fallbackTitle;
    }
  };

  const title = await attemptGeneration();
  onTitleGenerated?.(conversationId, title);
};
```

## Live Query Updates

How the UI stays in sync with database changes:

```mermaid
sequenceDiagram
    participant Component
    participant Hook as useLiveQuery
    participant Dexie
    participant DB as IndexedDB

    Component->>Hook: useLiveQuery(() => query)
    Hook->>Dexie: Subscribe to table
    Dexie->>DB: Initial query
    DB-->>Hook: Initial data
    Hook-->>Component: Render data

    Note over DB: Another tab/operation modifies data

    DB->>Dexie: Change event
    Dexie->>Hook: Re-run query function
    Hook->>DB: Fresh query
    DB-->>Hook: Updated data
    Hook-->>Component: Re-render
```

### Live Query Example

```typescript
// useChatPersistence.ts
const storedMessages = useLiveQuery(
  () => db.messages
    .where('conversationId')
    .equals(currentConversationId)
    .sortBy('createdAt'),
  [currentConversationId] // Dependency array
);
```

!!! note "Reactivity Lag"
    Live queries have a small delay (~100ms) when data changes. For user-triggered actions like conversation switching, use direct queries for immediate feedback.
