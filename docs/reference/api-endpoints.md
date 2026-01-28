# API Endpoints

Reference documentation for the application's API endpoints.

## /api/chat

Streaming chat completions endpoint using OpenAI models.

### Request

```http
POST /api/chat
Content-Type: application/json
```

**Body**:

```typescript
interface ChatRequest {
  messages: UIMessage[];  // Array of chat messages
  model: string;          // Model ID (e.g., "gpt-5", "gpt-4o")
}
```

**UIMessage Structure**:

```typescript
interface UIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  parts: ContentPart[];
  createdAt?: Date;
}

type ContentPart =
  | { type: 'text'; text: string }
  | { type: 'tool-call'; toolCallId: string; toolName: string; args: unknown }
  | { type: 'tool-result'; toolCallId: string; result: unknown };
```

### Response

Returns a streaming response using the AI SDK's UI message stream format.

**Stream Events**:

| Event | Description |
|-------|-------------|
| Text chunk | Partial text content |
| Tool call | AI requesting tool execution |
| Tool result | Tool execution result |
| Done | Stream complete |

### Example

=== "cURL"

    ```bash
    curl -X POST http://localhost:3000/api/chat \
      -H "Content-Type: application/json" \
      -d '{
        "messages": [
          {
            "id": "msg-1",
            "role": "user",
            "parts": [{ "type": "text", "text": "Hello!" }]
          }
        ],
        "model": "gpt-4o"
      }'
    ```

=== "JavaScript"

    ```typescript
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          {
            id: 'msg-1',
            role: 'user',
            parts: [{ type: 'text', text: 'Hello!' }],
          },
        ],
        model: 'gpt-4o',
      }),
    });

    // Handle streaming response
    const reader = response.body?.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      // Process chunk
    }
    ```

### Error Responses

| Status | Description |
|--------|-------------|
| 400 | Invalid request body |
| 401 | Missing or invalid API key |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

### Implementation

**Location**: `src/app/api/chat/route.ts`

```typescript
import { streamText, convertToModelMessages, stepCountIs } from 'ai';
import { getModel } from '@/lib/ai/model';
import { chatTools } from '@/lib/ai/tools';
import { SYSTEM_PROMPT } from '@/lib/ai/prompts';

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

---

## /api/generate-title

Generate a title for a conversation based on the first user message.

### Request

```http
POST /api/generate-title
Content-Type: application/json
```

**Body**:

```typescript
interface TitleRequest {
  userMessage: string;       // First user message text
  conversationId: string;    // Conversation ID for tracking
}
```

### Response

```typescript
interface TitleResponse {
  title: string;       // Generated title
  useFallback: boolean; // Whether fallback was used
}
```

### Example

=== "cURL"

    ```bash
    curl -X POST http://localhost:3000/api/generate-title \
      -H "Content-Type: application/json" \
      -d '{
        "userMessage": "How do I implement authentication in Next.js?",
        "conversationId": "conv-123"
      }'
    ```

=== "JavaScript"

    ```typescript
    const response = await fetch('/api/generate-title', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userMessage: 'How do I implement authentication in Next.js?',
        conversationId: 'conv-123',
      }),
    });

    const { title } = await response.json();
    console.log('Generated title:', title);
    // "Next.js Authentication Implementation"
    ```

### Response Examples

**Success**:

```json
{
  "title": "Next.js Authentication Guide",
  "useFallback": false
}
```

**Fallback (on error)**:

```json
{
  "title": "How do I implement authentication...",
  "useFallback": true
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| 400 | Missing userMessage or conversationId |
| 500 | Generation failed (falls back to truncated message) |

### Implementation

**Location**: `src/app/api/generate-title/route.ts`

```typescript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(request: Request) {
  const { userMessage, conversationId } = await request.json();

  if (!userMessage || !conversationId) {
    return Response.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  try {
    const result = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: `Generate a short, descriptive title (max 50 chars) for a conversation that starts with: "${userMessage}"`,
      maxTokens: 20,
    });

    return Response.json({
      title: result.text.trim(),
      useFallback: false,
    });
  } catch (error) {
    // Fallback to truncated message
    const fallback = userMessage.length > 50
      ? userMessage.slice(0, 47) + '...'
      : userMessage;

    return Response.json({
      title: fallback,
      useFallback: true,
    });
  }
}
```

---

## Custom Backend Configuration

The application supports connecting to a custom backend instead of using the built-in API routes.

### Environment Variable

```env
NEXT_PUBLIC_CHAT_API_URL=https://api.example.com
```

### URL Resolution

When `NEXT_PUBLIC_CHAT_API_URL` is set:

| Endpoint | Resolved URL |
|----------|--------------|
| `chat` | `https://api.example.com/chat` |
| `generate-title` | `https://api.example.com/generate-title` |

### Implementation

**Location**: `src/config.ts`

```typescript
export function getApiUrl(endpoint: 'chat' | 'generate-title'): string {
  const baseUrl = process.env.NEXT_PUBLIC_CHAT_API_URL;

  if (baseUrl) {
    // External backend
    return `${baseUrl}/${endpoint}`;
  }

  // Built-in API routes
  return `/api/${endpoint}`;
}
```

### Backend Requirements

If using a custom backend, ensure it:

1. Accepts the same request format
2. Returns streaming responses for `/chat`
3. Returns JSON for `/generate-title`
4. Handles CORS if on a different domain
