import {
  Code,
  Sparkles,
  ChartNoAxesColumnIncreasing,
  Mail,
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
    description: "Create responsive React components",
    prompt: "Create a responsive React component using Tailwind CSS",
    icon: Code,
  },
  {
    title: "Create a form",
    description: "Create a feedback form",
    prompt:
      "Create a feedback form for my website with fields for name, email, rating, and comments",
    icon: Mail,
  },
  {
    title: "Brainstorm",
    description: "Generate creative ideas",
    prompt: "Give me 5 creative ideas for a new mobile app",
    icon: Sparkles,
  },
];
