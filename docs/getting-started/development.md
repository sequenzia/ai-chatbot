# Development

This guide covers the development workflow, available commands, and best practices.

## Available Commands

### Development

```bash
# Start development server with Turbopack (fast refresh)
npm run dev

# Start on a specific port
npm run dev -- -p 3001
```

### Production

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Code Quality

```bash
# Run ESLint
npm run lint

# Type checking
npm run type-check
```

## Development Workflow

### 1. Start the Dev Server

```bash
npm run dev
```

The server starts at [http://localhost:3000](http://localhost:3000) with:

- **Hot Module Replacement**: Changes reflect instantly
- **Turbopack**: Faster builds than webpack
- **Error Overlay**: Errors displayed in browser

### 2. Make Changes

Edit files in `src/` and see changes immediately:

| Change Type | Hot Reload? | Notes |
|-------------|-------------|-------|
| Component JSX | Yes | Instant update |
| CSS/Tailwind | Yes | Instant update |
| API Routes | Yes | May need to re-trigger request |
| Environment Variables | No | Restart dev server |
| `tsconfig.json` | No | Restart dev server |

### 3. Test Your Changes

#### Test Chat Functionality

1. Open the browser
2. Send messages
3. Verify responses stream correctly
4. Check that messages persist after refresh

#### Test AI Tools

Use these test prompts:

```
# Test Form
Create a registration form with name, email, and password fields

# Test Chart
Show a bar chart with Q1: 100, Q2: 150, Q3: 200, Q4: 300

# Test Code
Write a TypeScript function to debounce function calls

# Test Card
Create a product card for the iPhone 15 Pro
```

### 4. Check for Errors

```bash
# TypeScript errors
npm run type-check

# Linting errors
npm run lint
```

## Project Configuration

### TypeScript (`tsconfig.json`)

Key settings:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Tailwind CSS

Configuration in `tailwind.config.ts`:

- Theme colors use CSS variables from `src/styles/theme.css`
- Dark mode uses `.dark` class on `<html>`
- Custom variants for interactive states

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key |
| `TAVILY_API_KEY` | No | Enables web search tool |
| `NEXT_PUBLIC_CHAT_API_URL` | No | Custom backend URL |
| `AI_DEBUG_ON` | No | Enables DevTools middleware |

## Debugging

### Browser DevTools

**React DevTools**: Install the [React DevTools extension](https://react.dev/learn/react-developer-tools) to inspect:

- Component hierarchy
- Props and state
- Context values

**Network Tab**: Monitor API requests:

- `/api/chat` - Streaming responses
- `/api/generate-title` - Title generation

### IndexedDB Inspection

Open DevTools → Application → IndexedDB → `AIChatbotDB`:

- **conversations** table: View saved conversations
- **messages** table: View message content

### Console Logging

Add temporary logs for debugging:

```typescript
// In ChatProvider.tsx
useEffect(() => {
  console.log('Messages updated:', messages);
  console.log('Status:', status);
}, [messages, status]);
```

### VS Code Debugging

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

## Common Development Tasks

### Adding a New Component

1. Create the component file:

```typescript
// src/components/feature/MyComponent.tsx
'use client';

import { cn } from '@/lib/utils';

interface MyComponentProps {
  className?: string;
  children: React.ReactNode;
}

export function MyComponent({ className, children }: MyComponentProps) {
  return (
    <div className={cn('p-4', className)}>
      {children}
    </div>
  );
}
```

2. Use the component:

```typescript
import { MyComponent } from '@/components/feature/MyComponent';
```

### Adding a New API Route

1. Create the route file:

```typescript
// src/app/api/my-endpoint/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();

  // Process request...

  return NextResponse.json({ success: true });
}
```

2. Call from the frontend:

```typescript
const response = await fetch('/api/my-endpoint', {
  method: 'POST',
  body: JSON.stringify({ data: 'value' }),
});
```

### Adding a New Hook

1. Create the hook file:

```typescript
// src/hooks/useMyHook.ts
import { useState, useCallback } from 'react';

export function useMyHook(initialValue: string) {
  const [value, setValue] = useState(initialValue);

  const update = useCallback((newValue: string) => {
    setValue(newValue);
  }, []);

  return { value, update };
}
```

2. Use the hook:

```typescript
import { useMyHook } from '@/hooks/useMyHook';

function MyComponent() {
  const { value, update } = useMyHook('initial');
  // ...
}
```

## Best Practices

### Code Style

- Use `'use client'` directive for components with hooks or state
- Prefer named exports over default exports
- Use `cn()` utility for Tailwind class merging
- Follow existing patterns in the codebase

### Performance

- Use `useCallback` for functions passed as props
- Use `useMemo` for expensive computations
- Avoid creating new objects/arrays in render

### Accessibility

- Use semantic HTML elements
- Add ARIA labels where needed
- Test with keyboard navigation
- Use `useReducedMotion()` for animation preferences

## Documentation

### Building the Docs

```bash
# Install MkDocs
pip install mkdocs-material

# Serve documentation locally
mkdocs serve

# Build static documentation
mkdocs build
```

The docs will be available at [http://localhost:8000](http://localhost:8000).

## Next Steps

- **[Architecture](../architecture/index.md)** - Understand the system design
- **[Modules](../modules/index.md)** - Deep dive into each module
- **[Tutorials](../tutorials/index.md)** - Learn by building
