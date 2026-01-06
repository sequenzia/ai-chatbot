import { Zap, Code, Sparkles, MessageSquare, type LucideIcon } from "lucide-react";

export interface Suggestion {
  title: string;
  description: string;
  prompt: string;
  icon: LucideIcon;
}

export const SUGGESTIONS: Suggestion[] = [
  {
    title: "Create a Chart",
    description: "Show me a bar chart example with sample data for monthly sales.",
    prompt: "Show me a bar chart example with sample data for monthly sales.",
    icon: Zap,
  },
  {
    title: "Write Code",
    description: "Create responsive React components",
    prompt: "Create a responsive React component using Tailwind CSS.",
    icon: Code,
  },
  {
    title: "Brainstorm",
    description: "Generate creative ideas",
    prompt: "Give me 5 creative ideas for a new mobile app.",
    icon: Sparkles,
  },
  {
    title: "Summarize",
    description: "Summarize complex documents",
    prompt: "Summarize the key takeaways from a complex technical paper.",
    icon: MessageSquare,
  },
];
