# Component Reference

Reference documentation for key React components and hooks.

## Context Providers

### ChatProvider

Central context provider that orchestrates chat functionality.

**Location**: `src/components/chat/ChatProvider.tsx`

**Props**:

```typescript
interface ChatProviderProps {
  children: React.ReactNode;
}
```

**Usage**:

```tsx
import { ChatProvider } from '@/components/chat/ChatProvider';

function App() {
  return (
    <ChatProvider>
      <YourApp />
    </ChatProvider>
  );
}
```

**Provides**: See [useChat2()](#usechat2) hook.

---

## Hooks

### useChat2()

Access the chat context provided by `ChatProvider`.

**Location**: `src/components/chat/ChatProvider.tsx`

**Returns**:

```typescript
interface ChatContextType {
  // Message state
  messages: UIMessage[];
  setMessages: Dispatch<SetStateAction<UIMessage[]>>;

  // Actions
  sendMessage: (text: string) => void;
  clearMessages: () => void;
  stop: () => void;

  // Status
  status: 'idle' | 'submitted' | 'streaming' | 'ready' | 'error';
  isLoading: boolean;

  // Model
  selectedModel: string;
  setSelectedModel: Dispatch<SetStateAction<string>>;

  // Conversation
  conversationId: string;
  switchConversation: (id: string) => Promise<void>;
  startNewConversation: () => Promise<void>;
}
```

**Usage**:

```tsx
import { useChat2 } from '@/components/chat/ChatProvider';

function ChatComponent() {
  const {
    messages,
    sendMessage,
    status,
    isLoading,
  } = useChat2();

  return (
    <div>
      {messages.map(msg => /* render */)}
      <button
        onClick={() => sendMessage('Hello')}
        disabled={isLoading}
      >
        Send
      </button>
    </div>
  );
}
```

---

### useChatPersistence()

Manage message persistence with IndexedDB.

**Location**: `src/hooks/useChatPersistence.ts`

**Options**:

```typescript
interface UseChatPersistenceOptions {
  conversationId?: string;
  userId?: string;
}
```

**Returns**:

```typescript
interface UseChatPersistenceReturn {
  conversationId: string;
  storedMessages: UIMessage[];
  isLoading: boolean;
  isPersisted: boolean;
  saveMessage: (message: UIMessage, fallbackTitle?: string) => Promise<void>;
  updateMessage: (message: UIMessage) => Promise<void>;
  createConversation: () => Promise<string>;
  clearConversation: () => Promise<void>;
  deleteConversation: (id?: string) => Promise<void>;
  switchConversation: (id: string) => Promise<UIMessage[]>;
}
```

**Usage**:

```tsx
import { useChatPersistence } from '@/hooks/useChatPersistence';

function PersistenceExample() {
  const {
    conversationId,
    storedMessages,
    saveMessage,
    switchConversation,
  } = useChatPersistence();

  const handleSave = async (message: UIMessage) => {
    await saveMessage(message, 'Fallback Title');
  };

  return /* ... */;
}
```

---

### useConversations()

Manage the conversation list.

**Location**: `src/hooks/useConversations.ts`

**Options**:

```typescript
interface UseConversationsOptions {
  userId?: string;
  limit?: number;  // Default: 50
}
```

**Returns**:

```typescript
interface UseConversationsReturn {
  conversations: ConversationRecord[];
  isLoading: boolean;
  updateTitle: (id: string, title: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  clearAllConversations: () => Promise<void>;
}
```

**Usage**:

```tsx
import { useConversations } from '@/hooks/useConversations';

function ConversationList() {
  const {
    conversations,
    isLoading,
    deleteConversation,
  } = useConversations({ limit: 20 });

  if (isLoading) return <Loading />;

  return (
    <ul>
      {conversations.map(conv => (
        <li key={conv.id}>
          {conv.title}
          <button onClick={() => deleteConversation(conv.id)}>
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
```

---

### useTitleGeneration()

Generate conversation titles via LLM.

**Location**: `src/hooks/useTitleGeneration.ts`

**Options**:

```typescript
interface UseTitleGenerationOptions {
  onTitleGenerated?: (conversationId: string, title: string) => void;
  onError?: (error: Error) => void;
}
```

**Returns**:

```typescript
interface UseTitleGenerationReturn {
  generateTitle: (conversationId: string, userMessage: string) => Promise<void>;
  generateFallbackTitle: (userMessage: string) => string;
}
```

**Usage**:

```tsx
import { useTitleGeneration } from '@/hooks/useTitleGeneration';

function TitleGenerator() {
  const { generateTitle, generateFallbackTitle } = useTitleGeneration({
    onTitleGenerated: (id, title) => {
      console.log(`Title for ${id}: ${title}`);
    },
  });

  const handleGenerate = async () => {
    await generateTitle('conv-123', 'How do I use React hooks?');
  };

  return /* ... */;
}
```

---

## Chat Components

### ChatConversation

Displays the message list with auto-scroll.

**Location**: `src/components/chat/ChatConversation.tsx`

**Props**: None (uses context)

**Usage**:

```tsx
import { ChatConversation } from '@/components/chat/ChatConversation';

function ChatPage() {
  return (
    <ChatProvider>
      <ChatConversation />
    </ChatProvider>
  );
}
```

---

### ChatMessageItem

Renders an individual message with text, tools, and reasoning.

**Location**: `src/components/chat/ChatMessageItem.tsx`

**Props**:

```typescript
interface ChatMessageItemProps {
  message: UIMessage;
  isStreaming?: boolean;
}
```

**Usage**:

```tsx
import { ChatMessageItem } from '@/components/chat/ChatMessageItem';

function MessageList({ messages }) {
  return (
    <div>
      {messages.map((msg, i) => (
        <ChatMessageItem
          key={msg.id}
          message={msg}
          isStreaming={i === messages.length - 1}
        />
      ))}
    </div>
  );
}
```

---

### ChatInput

Input composer with model selector.

**Location**: `src/components/chat/ChatInput.tsx`

**Props**:

```typescript
interface ChatInputProps {
  isFixed?: boolean;        // Fixed position at bottom
  placeholder?: string;     // Input placeholder
}
```

**Usage**:

```tsx
import { ChatInput } from '@/components/chat/ChatInput';

function ChatPage() {
  return (
    <ChatProvider>
      <ChatConversation />
      <ChatInput isFixed placeholder="Type a message..." />
    </ChatProvider>
  );
}
```

---

## Block Components

### ContentBlock

Dispatcher that routes tool outputs to specific renderers.

**Location**: `src/components/blocks/ContentBlock.tsx`

**Props**:

```typescript
interface ContentBlockProps {
  content: ContentBlock;  // Discriminated union type
  messageId: string;
}
```

**Usage**:

```tsx
import { ContentBlock } from '@/components/blocks/ContentBlock';

function ToolOutput({ toolOutput, messageId }) {
  return (
    <ContentBlock
      content={toolOutput}
      messageId={messageId}
    />
  );
}
```

---

### FormContent

Renders interactive forms.

**Location**: `src/components/blocks/FormContent.tsx`

**Props**:

```typescript
interface FormContentProps {
  data: FormContentData;
  messageId: string;
}
```

**FormContentData**:

```typescript
interface FormContentData {
  type: "form";
  title: string;
  description?: string;
  fields: FormField[];
  submitLabel?: string;
}

interface FormField {
  name: string;
  label: string;
  type: "text" | "textarea" | "email" | "number" |
        "select" | "checkbox" | "radio" | "date" |
        "slider" | "file";
  placeholder?: string;
  required?: boolean;
  options?: string[];  // For select, radio
  min?: number;        // For slider
  max?: number;
  step?: number;
}
```

---

### ChartContent

Renders data visualizations.

**Location**: `src/components/blocks/ChartContent.tsx`

**Props**:

```typescript
interface ChartContentProps {
  data: ChartContentData;
}
```

**ChartContentData**:

```typescript
interface ChartContentData {
  type: "chart";
  chartType: "line" | "bar" | "pie" | "area";
  title: string;
  description?: string;
  data: Array<{
    label: string;
    value: number;
  }>;
}
```

---

### CodeContent

Renders syntax-highlighted code.

**Location**: `src/components/blocks/CodeContent.tsx`

**Props**:

```typescript
interface CodeContentProps {
  data: CodeContentData;
}
```

**CodeContentData**:

```typescript
interface CodeContentData {
  type: "code";
  language: string;
  filename?: string;
  code: string;
  editable?: boolean;
  showLineNumbers?: boolean;
}
```

---

### CardContent

Renders rich content cards.

**Location**: `src/components/blocks/CardContent.tsx`

**Props**:

```typescript
interface CardContentProps {
  data: CardContentData;
}
```

**CardContentData**:

```typescript
interface CardContentData {
  type: "card";
  title: string;
  description?: string;
  content?: string;
  media?: {
    type: "image" | "video";
    url: string;
    alt?: string;
  };
  actions?: Array<{
    label: string;
    action: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  }>;
}
```

---

## Utility Functions

### cn()

Merge Tailwind CSS classes with conflict resolution.

**Location**: `src/lib/utils.ts`

**Signature**:

```typescript
function cn(...inputs: ClassValue[]): string
```

**Usage**:

```tsx
import { cn } from '@/lib/utils';

function Button({ className, variant }) {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded',
        variant === 'primary' && 'bg-blue-500',
        variant === 'secondary' && 'bg-gray-500',
        className
      )}
    />
  );
}
```

---

### getApiUrl()

Get the correct API endpoint URL.

**Location**: `src/config.ts`

**Signature**:

```typescript
function getApiUrl(endpoint: 'chat' | 'generate-title'): string
```

**Usage**:

```typescript
import { getApiUrl } from '@/config';

const chatUrl = getApiUrl('chat');
// Returns "/api/chat" or "https://custom-backend.com/chat"
```
