# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development server (with Turbopack)
npm run dev

# Production build
npm run build

# Start production server
npm start
```

## Architecture

This is a Next.js 15 + Vercel AI SDK v6 + Tailwind CSS v4 AI chatbot application.

### Entry Points
- `src/app/layout.tsx` - Root layout with ThemeProvider
- `src/app/page.tsx` - Main chat page with WelcomeScreen
- `src/app/api/chat/route.ts` - AI streaming endpoint using AI Gateway

### Key Directories
- `src/app/` - Next.js App Router pages and API routes
- `src/components/chat/` - Chat components (ChatProvider, ChatContainer, ChatMessage, InputComposer)
- `src/components/layout/` - Layout components (Sidebar)
- `src/components/providers/` - React context providers (ThemeProvider)
- `src/components/ui/` - shadcn/ui component library
- `src/lib/ai/` - AI model definitions
- `src/lib/motion/` - Animation variants
- `src/hooks/` - Custom React hooks
- `src/styles/` - CSS files (tailwind.css, theme.css)
- `src/types/` - TypeScript type definitions

### AI SDK Integration
- **AI SDK v6** with `useChat` hook from `@ai-sdk/react`
- **AI Gateway** for multi-provider support (Anthropic, OpenAI, Google)
- **Chat class** with `DefaultChatTransport` for API communication
- **UIMessage** type for message handling with parts-based content
- **Streaming** via `streamText` and `toUIMessageStreamResponse`

### Chat State Management
- `ChatProvider` wraps the app with chat context
- Uses AI SDK's `Chat` class with `DefaultChatTransport`
- Model selection persisted in component state
- `useChat2()` hook exposes: messages, sendMessage, status, selectedModel, clearMessages, stop

### Styling System
- **Tailwind CSS v4** via `@tailwindcss/postcss` plugin
- **Theme variables** defined in `src/styles/theme.css` using CSS custom properties
- **Dark mode** uses `.dark` class on `<html>` with `@custom-variant dark (&:is(.dark *))`
- **shadcn/ui components** use `class-variance-authority` (cva) for variants
- **Utility function** `cn()` in `src/lib/utils.ts` merges Tailwind classes

### Path Alias
`@` maps to `./src` (configured in tsconfig.json)

### Component Patterns
- All client components use `'use client'` directive
- UI components follow shadcn/ui conventions with `data-slot` attributes
- Animation uses `motion/react` (Framer Motion) with reduced motion support
- Icons from `lucide-react`
- Theme toggle via `useTheme()` hook from ThemeProvider

### Environment Variables
```env
AI_GATEWAY_API_KEY=your_api_key_here
```

## Key Files

| File | Purpose |
|------|---------|
| `src/config.ts` | Centralized environment configuration |
| `src/lib/ai/models.ts` | AI model definitions for model selector |
| `src/components/chat/ChatProvider.tsx` | Chat state management with AI SDK |
| `src/app/api/chat/route.ts` | Streaming chat API endpoint |

## Adding New Models

Edit `src/lib/ai/models.ts`:
```typescript
export const MODELS = [
  { id: 'provider/model-name', name: 'Display Name', provider: 'provider' },
] as const;
```

## UI/UX Guidelines

When modifying UI components:
- **Responsive breakpoints**: Mobile (<640px), Tablet (640-1024px), Desktop (>1024px)
- **Touch targets**: Minimum 44x44px for mobile (Apple HIG)
- **Accessibility**: ARIA labels, focus management, screen reader announcements
- **Safe areas**: Support for device notches and home indicators
- **Performance**: Reduced motion support via `useReducedMotion()` hook
