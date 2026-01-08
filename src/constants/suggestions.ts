import {
  Code,
  Sparkles,
  ChartNoAxesColumnIncreasing,
  Globe,
  type LucideIcon,
} from "lucide-react";

export interface Suggestion {
  title: string;
  description: string;
  prompt: string;
  icon: LucideIcon;
}

export const SUGGESTIONS: Suggestion[] = [
  {
    title: "Create a chart",
    description: "Create a bar chart with sample data",
    prompt: "Show me a bar chart example with sample data for monthly sales",
    icon: ChartNoAxesColumnIncreasing
  },
  {
    title: "Write code",
    description: "Generate a Python decorator",
    prompt: "Generate a Python decorator that retries a function with exponential backoff",
    icon: Code,
  },
  {
    title: "Search the web",
    description: "Perform a web search",
    prompt:
      "Search the web for the latest news in AI and summarize the top findings",
    icon: Globe,
  },
  {
    title: "Brainstorm",
    description: "Generate creative ideas",
    prompt: "Give me 5 creative ideas for a new mobile app",
    icon: Sparkles,
  },
];
