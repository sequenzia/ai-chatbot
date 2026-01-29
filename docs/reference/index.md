# Reference

Quick reference documentation for APIs and components.

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| [`/api/chat`](api-endpoints.md#apichat) | POST | Streaming chat completions |
| [`/api/generate-title`](api-endpoints.md#apigenerate-title) | POST | Generate conversation titles |

## Component Reference

| Component | Description |
|-----------|-------------|
| [ChatProvider](components.md#chatprovider) | Context provider for chat state |
| [ChatConversation](components.md#chatconversation) | Message list display |
| [ChatInput](components.md#chatinput) | Input composer |
| [ContentBlock](components.md#contentblock) | Tool result dispatcher |

## Hook Reference

| Hook | Description |
|------|-------------|
| [`useChat2()`](components.md#usechat2) | Access chat context |
| [`useChatPersistence()`](components.md#usechatpersistence) | Message persistence |
| [`useConversations()`](components.md#useconversations) | Conversation management |
| [`useTitleGeneration()`](components.md#usetitlegeneration) | Title generation |

## Type Reference

| Type | Location | Description |
|------|----------|-------------|
| `ContentBlock` | `src/types/content-blocks.ts` | Tool output types |
| `ConversationRecord` | `src/lib/db/types.ts` | Database conversation |
| `MessageRecord` | `src/lib/db/types.ts` | Database message |
| `UIMessage` | `@ai-sdk/react` | AI SDK message type |
