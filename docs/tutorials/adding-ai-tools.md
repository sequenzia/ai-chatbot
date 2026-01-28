# Adding AI Tools

This tutorial walks through adding a new AI tool that generates and renders interactive content.

## What You'll Build

We'll create a `generateTable` tool that displays data in a formatted table.

**Example prompt**: "Create a table showing quarterly sales data"

**Result**: An interactive table rendered in the chat.

## Prerequisites

- Familiarity with TypeScript and Zod
- Understanding of React components
- Read the [AI Integration](../modules/ai-integration.md) module docs

## Step 1: Define the Type Schema

First, add the Zod schema for your tool's data structure.

**File**: `src/types/content-blocks.ts`

```typescript
import { z } from 'zod';

// Add the new schema
export const TableContentDataSchema = z.object({
  type: z.literal("table"),
  title: z.string().describe("Title for the table"),
  description: z.string().optional().describe("Optional description"),
  headers: z.array(z.string()).describe("Column headers"),
  rows: z.array(z.array(z.string())).describe("Table rows"),
  striped: z.boolean().optional().describe("Alternate row colors"),
});

export type TableContentData = z.infer<typeof TableContentDataSchema>;
```

## Step 2: Update the Union Type

Add the new type to the discriminated union.

**File**: `src/types/content-blocks.ts`

```typescript
// Update the ContentBlock union
export type ContentBlock =
  | FormContentData
  | ChartContentData
  | CodeContentData
  | CardContentData
  | TableContentData;  // Add this

// Update the Zod schema union
export const ContentBlockSchema = z.discriminatedUnion("type", [
  FormContentDataSchema,
  ChartContentDataSchema,
  CodeContentDataSchema,
  CardContentDataSchema,
  TableContentDataSchema,  // Add this
]);
```

## Step 3: Create the Tool

Define the tool in the AI tools file.

**File**: `src/lib/ai/tools.ts`

```typescript
import {
  TableContentDataSchema,
  type TableContentData,
} from "@/types/content-blocks";

// Add the new tool
export const generateTable = tool<TableContentData, TableContentData>({
  description: "Generate a data table for displaying structured information in rows and columns",
  inputSchema: TableContentDataSchema,
  execute: async (input) => input, // Pass-through pattern
});
```

Update the exports:

```typescript
export const chatTools = {
  generateForm,
  generateChart,
  generateCode,
  generateCard,
  generateTable,  // Add this
  ...(config.ai.webSearch.enabled ? { webSearch } : {}),
};
```

## Step 4: Create the Renderer

Create a React component to render the table.

**File**: `src/components/blocks/TableContent.tsx`

```typescript
"use client";

import type { TableContentData } from "@/types/content-blocks";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface TableContentProps {
  data: TableContentData;
}

export function TableContent({ data }: TableContentProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>{data.title}</CardTitle>
        {data.description && (
          <CardDescription>{data.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {data.headers.map((header, index) => (
                  <TableHead key={index} className="font-semibold">
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.rows.map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  className={cn(
                    data.striped && rowIndex % 2 === 1 && "bg-muted/50"
                  )}
                >
                  {row.map((cell, cellIndex) => (
                    <TableCell key={cellIndex}>{cell}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
```

## Step 5: Register in ContentBlock

Add the new block to the dispatcher.

**File**: `src/components/blocks/ContentBlock.tsx`

```typescript
import { TableContent } from "./TableContent";  // Add import

export function ContentBlock({ content, messageId }: ContentBlockProps) {
  const renderContent = () => {
    switch (content.type) {
      case "form":
        return <FormContent data={content} messageId={messageId} />;
      case "chart":
        return <ChartContent data={content} />;
      case "code":
        return <CodeContent data={content} />;
      case "card":
        return <CardContent data={content} />;
      case "table":                                    // Add this case
        return <TableContent data={content} />;
      default:
        return null;
    }
  };

  // ... rest of component
}
```

## Step 6: Add to Content Block Tools

Register the tool name for detection.

**File**: `src/components/chat/ChatMessageItem.tsx`

```typescript
const CONTENT_BLOCK_TOOLS = [
  'generateForm',
  'generateChart',
  'generateCode',
  'generateCard',
  'generateTable',  // Add this
];
```

## Step 7: Update System Prompt

Add guidance so the AI knows when to use the tool.

**File**: `src/lib/ai/prompts.ts`

```typescript
export const SYSTEM_PROMPT = `You are a helpful assistant...

### generateTable
USE WHEN: The user wants to DISPLAY data in a table format.
- Trigger words: table, spreadsheet, grid, tabular data, rows and columns, comparison table, data table
- Creates: Formatted tables with headers and rows
- DO NOT use for: Data visualization (use generateChart), forms (use generateForm)

## Decision Examples

| User Request | Correct Tool |
|--------------|--------------|
| "Create a contact form" | generateForm |
| "Show sales data as a chart" | generateChart |
| "Display quarterly results in a table" | generateTable |
| "Create a comparison table for products" | generateTable |
...
`;
```

## Step 8: Test Your Tool

Start the dev server and test with prompts:

```bash
npm run dev
```

**Test prompts**:

1. "Create a table showing Q1-Q4 sales: Q1 $100k, Q2 $150k, Q3 $200k, Q4 $250k"
2. "Make a comparison table for iPhone 15 vs Samsung S24"
3. "Show a table of US presidents from 2000-2024"

## Complete File Changes

Here's a summary of all files modified:

| File | Change |
|------|--------|
| `src/types/content-blocks.ts` | Add schema, type, and union member |
| `src/lib/ai/tools.ts` | Add tool definition and export |
| `src/components/blocks/TableContent.tsx` | Create new file |
| `src/components/blocks/ContentBlock.tsx` | Add import and case |
| `src/components/chat/ChatMessageItem.tsx` | Add to CONTENT_BLOCK_TOOLS |
| `src/lib/ai/prompts.ts` | Add tool guidance |

## Advanced: Adding Features

### Sortable Columns

```typescript
// Add to schema
sortable: z.boolean().optional(),

// In TableContent.tsx
const [sortColumn, setSortColumn] = useState<number | null>(null);
const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

const sortedRows = useMemo(() => {
  if (sortColumn === null || !data.sortable) return data.rows;

  return [...data.rows].sort((a, b) => {
    const comparison = a[sortColumn].localeCompare(b[sortColumn]);
    return sortDirection === 'asc' ? comparison : -comparison;
  });
}, [data.rows, sortColumn, sortDirection, data.sortable]);
```

### Pagination

```typescript
// In TableContent.tsx
const [page, setPage] = useState(0);
const pageSize = 10;

const paginatedRows = data.rows.slice(
  page * pageSize,
  (page + 1) * pageSize
);
```

### Export to CSV

```typescript
const exportToCSV = () => {
  const csv = [
    data.headers.join(','),
    ...data.rows.map(row => row.join(',')),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${data.title}.csv`;
  a.click();
};
```

## Troubleshooting

### Tool not being selected

- Check the system prompt includes clear trigger words
- Verify the tool name is in `chatTools` export
- Try more explicit prompts: "Use the generateTable tool to..."

### Type errors

- Ensure the Zod schema matches the TypeScript type
- Check that the type is in the `ContentBlock` union
- Verify the schema is in `ContentBlockSchema` union

### Block not rendering

- Check the tool name is in `CONTENT_BLOCK_TOOLS`
- Verify the case in `ContentBlock.tsx` switch statement
- Check browser console for errors

## Related Docs

- [AI Integration](../modules/ai-integration.md) - Tool architecture
- [Rendering Blocks](../modules/rendering-blocks.md) - Block patterns
- [API Reference](../reference/api-endpoints.md) - API documentation
