"use client";

import type { CodeContentData } from "@/types/content-blocks";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CodeBlock, CodeBlockCopyButton } from "@/components/ai-elements/code-block";
import { Badge } from "@/components/ui/badge";
import type { BundledLanguage } from "shiki";

interface CodeContentProps {
  data: CodeContentData;
}

// Map common language aliases to Shiki language identifiers
const languageMap: Record<string, BundledLanguage> = {
  js: "javascript",
  ts: "typescript",
  jsx: "jsx",
  tsx: "tsx",
  py: "python",
  rb: "ruby",
  sh: "bash",
  shell: "bash",
  yml: "yaml",
  md: "markdown",
};

function normalizeLanguage(lang: string): BundledLanguage {
  const normalized = lang.toLowerCase();
  return (languageMap[normalized] || normalized) as BundledLanguage;
}

export function CodeContent({ data }: CodeContentProps) {
  const language = normalizeLanguage(data.language);

  return (
    <Card className="overflow-hidden">
      {(data.filename || data.language) && (
        <CardHeader className="py-3 px-4 border-b">
          <div className="flex items-center justify-between">
            {data.filename && (
              <CardTitle className="text-sm font-mono">{data.filename}</CardTitle>
            )}
            <Badge variant="secondary" className="text-xs">
              {data.language}
            </Badge>
          </div>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <CodeBlock
          code={data.code}
          language={language}
          showLineNumbers={data.showLineNumbers ?? true}
          className="border-0 rounded-none"
        >
          <CodeBlockCopyButton />
        </CodeBlock>
      </CardContent>
    </Card>
  );
}
