import { Zap, Code, Sparkles, MessageSquare, type LucideIcon } from "lucide-react";

export interface Suggestion {
  title: string;
  description: string;
  prompt: string;
  icon: LucideIcon;
}

export const SUGGESTIONS: Suggestion[] = [
  {
    title: "Analyze Data",
    description: "Help analyze datasets for trends",
    prompt: "Can you help me analyze this dataset for trends?",
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
    prompt: "Give me 5 creative ideas for a low-fidelity wireframe.",
    icon: Sparkles,
  },
  {
    title: "Summarize",
    description: "Summarize complex documents",
    prompt: "Summarize the key takeaways from a complex technical paper.",
    icon: MessageSquare,
  },
];
