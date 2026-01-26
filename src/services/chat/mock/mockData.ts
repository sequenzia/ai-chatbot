import type {
  FormContentData,
  ChartContentData,
  CodeContentData,
  CardContentData,
} from '@/types/content-blocks';

/**
 * Mock text responses for different types of queries
 */
export const MOCK_TEXT_RESPONSES = {
  greeting: [
    "Hello! I'm your AI assistant. How can I help you today?",
    "Hi there! I'm here to assist you with any questions or tasks you might have.",
    "Hey! Great to see you. What would you like to explore together?",
  ],
  general: [
    "That's an interesting question. Let me help you with that.",
    "I'd be happy to assist you with this. Here's what I can share:",
    "Great question! Here's some information that might help:",
  ],
  fallback: [
    "I understand you're looking for help with that. Let me provide some useful information.",
    "Thanks for asking! Here's what I can tell you about that topic.",
    "I'd be happy to help you explore that further. Here are my thoughts:",
  ],
};

/**
 * Mock form templates for different use cases
 */
export const MOCK_FORMS: Record<string, FormContentData> = {
  contact: {
    type: 'form',
    title: 'Contact Form',
    description: 'Get in touch with us',
    fields: [
      { id: 'name', type: 'text', label: 'Full Name', required: true, placeholder: 'Enter your name' },
      { id: 'email', type: 'email', label: 'Email Address', required: true, placeholder: 'your@email.com' },
      { id: 'subject', type: 'select', label: 'Subject', options: [
        { label: 'General Inquiry', value: 'general' },
        { label: 'Technical Support', value: 'support' },
        { label: 'Feedback', value: 'feedback' },
      ]},
      { id: 'message', type: 'textarea', label: 'Message', required: true, placeholder: 'Your message here...' },
    ],
    submitLabel: 'Send Message',
  },
  survey: {
    type: 'form',
    title: 'Customer Satisfaction Survey',
    description: 'Help us improve our services',
    fields: [
      { id: 'rating', type: 'slider', label: 'Overall Satisfaction', min: 1, max: 10, step: 1 },
      { id: 'recommend', type: 'radio', label: 'Would you recommend us?', options: [
        { label: 'Yes, definitely', value: 'yes' },
        { label: 'Maybe', value: 'maybe' },
        { label: 'No', value: 'no' },
      ]},
      { id: 'features', type: 'checkbox', label: 'Which features do you use most?' },
      { id: 'feedback', type: 'textarea', label: 'Additional Comments', placeholder: 'Share your thoughts...' },
    ],
    submitLabel: 'Submit Survey',
  },
  registration: {
    type: 'form',
    title: 'Registration Form',
    description: 'Create your account',
    fields: [
      { id: 'username', type: 'text', label: 'Username', required: true, placeholder: 'Choose a username' },
      { id: 'email', type: 'email', label: 'Email', required: true, placeholder: 'your@email.com' },
      { id: 'dob', type: 'date', label: 'Date of Birth' },
      { id: 'newsletter', type: 'checkbox', label: 'Subscribe to newsletter' },
    ],
    submitLabel: 'Create Account',
  },
};

/**
 * Mock chart data for different visualization types
 */
export const MOCK_CHARTS: Record<string, ChartContentData> = {
  sales: {
    type: 'chart',
    chartType: 'bar',
    title: 'Monthly Sales Data',
    description: 'Sales performance over the past 6 months',
    data: [
      { label: 'January', value: 12500 },
      { label: 'February', value: 15200 },
      { label: 'March', value: 18900 },
      { label: 'April', value: 14300 },
      { label: 'May', value: 21000 },
      { label: 'June', value: 19500 },
    ],
  },
  revenue: {
    type: 'chart',
    chartType: 'line',
    title: 'Revenue Trend',
    description: 'Quarterly revenue growth',
    data: [
      { label: 'Q1', value: 45000 },
      { label: 'Q2', value: 52000 },
      { label: 'Q3', value: 61000 },
      { label: 'Q4', value: 78000 },
    ],
  },
  distribution: {
    type: 'chart',
    chartType: 'pie',
    title: 'Market Share Distribution',
    description: 'Current market share by segment',
    data: [
      { label: 'Enterprise', value: 45 },
      { label: 'SMB', value: 30 },
      { label: 'Consumer', value: 15 },
      { label: 'Other', value: 10 },
    ],
  },
  performance: {
    type: 'chart',
    chartType: 'area',
    title: 'Performance Metrics',
    description: 'System performance over time',
    data: [
      { label: 'Week 1', value: 85 },
      { label: 'Week 2', value: 88 },
      { label: 'Week 3', value: 92 },
      { label: 'Week 4', value: 90 },
      { label: 'Week 5', value: 95 },
    ],
  },
};

/**
 * Mock code snippets for different languages
 */
export const MOCK_CODE: Record<string, CodeContentData> = {
  decorator: {
    type: 'code',
    language: 'python',
    filename: 'retry_decorator.py',
    code: `import time
import functools
from typing import Callable, TypeVar

T = TypeVar('T')

def retry_with_backoff(
    max_retries: int = 3,
    base_delay: float = 1.0,
    max_delay: float = 60.0
) -> Callable[[Callable[..., T]], Callable[..., T]]:
    """
    A decorator that retries a function with exponential backoff.

    Args:
        max_retries: Maximum number of retry attempts
        base_delay: Initial delay between retries in seconds
        max_delay: Maximum delay between retries in seconds
    """
    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        @functools.wraps(func)
        def wrapper(*args, **kwargs) -> T:
            last_exception = None

            for attempt in range(max_retries + 1):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    if attempt < max_retries:
                        delay = min(base_delay * (2 ** attempt), max_delay)
                        time.sleep(delay)

            raise last_exception
        return wrapper
    return decorator

# Usage example
@retry_with_backoff(max_retries=3, base_delay=1.0)
def fetch_data(url: str) -> dict:
    # Your API call here
    pass`,
    showLineNumbers: true,
  },
  sort: {
    type: 'code',
    language: 'typescript',
    filename: 'sorting.ts',
    code: `/**
 * Quicksort implementation with TypeScript generics
 */
function quickSort<T>(arr: T[], compare: (a: T, b: T) => number = defaultCompare): T[] {
  if (arr.length <= 1) return arr;

  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter(x => compare(x, pivot) < 0);
  const middle = arr.filter(x => compare(x, pivot) === 0);
  const right = arr.filter(x => compare(x, pivot) > 0);

  return [...quickSort(left, compare), ...middle, ...quickSort(right, compare)];
}

function defaultCompare<T>(a: T, b: T): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

// Examples
const numbers = [64, 34, 25, 12, 22, 11, 90];
console.log(quickSort(numbers)); // [11, 12, 22, 25, 34, 64, 90]

const strings = ['banana', 'apple', 'cherry'];
console.log(quickSort(strings)); // ['apple', 'banana', 'cherry']`,
    showLineNumbers: true,
  },
  react: {
    type: 'code',
    language: 'tsx',
    filename: 'Counter.tsx',
    code: `import { useState, useCallback } from 'react';

interface CounterProps {
  initialValue?: number;
  step?: number;
  onValueChange?: (value: number) => void;
}

export function Counter({
  initialValue = 0,
  step = 1,
  onValueChange
}: CounterProps) {
  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => {
    setCount(prev => {
      const newValue = prev + step;
      onValueChange?.(newValue);
      return newValue;
    });
  }, [step, onValueChange]);

  const decrement = useCallback(() => {
    setCount(prev => {
      const newValue = prev - step;
      onValueChange?.(newValue);
      return newValue;
    });
  }, [step, onValueChange]);

  return (
    <div className="flex items-center gap-4">
      <button onClick={decrement}>-</button>
      <span>{count}</span>
      <button onClick={increment}>+</button>
    </div>
  );
}`,
    showLineNumbers: true,
  },
};

/**
 * Mock card data for different content types
 */
export const MOCK_CARDS: Record<string, CardContentData> = {
  product: {
    type: 'card',
    title: 'iPhone 15 Pro',
    description: 'The most powerful iPhone ever',
    content: 'Experience the A17 Pro chip, a groundbreaking new camera system, and a beautiful titanium design. The iPhone 15 Pro is the ultimate iPhone for professionals and power users alike.',
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800',
      alt: 'iPhone 15 Pro',
    },
    actions: [
      { label: 'Learn More', action: 'learn-more', variant: 'default' },
      { label: 'Buy Now', action: 'buy', variant: 'secondary' },
    ],
  },
  profile: {
    type: 'card',
    title: 'Jane Smith',
    description: 'Senior Software Engineer',
    content: 'Full-stack developer with 8+ years of experience in building scalable web applications. Passionate about clean code, developer experience, and mentoring junior developers.',
    actions: [
      { label: 'View Profile', action: 'view-profile', variant: 'default' },
      { label: 'Connect', action: 'connect', variant: 'outline' },
    ],
  },
  summary: {
    type: 'card',
    title: 'Project Summary',
    description: 'Q4 2024 Development Sprint',
    content: 'Successfully delivered 15 new features, reduced bug count by 40%, and improved load times by 2x. The team exceeded all quarterly targets and received positive stakeholder feedback.',
    actions: [
      { label: 'View Details', action: 'view-details', variant: 'default' },
    ],
  },
};

/**
 * Pre-response text templates for tool calls
 */
export const TOOL_INTRO_TEXT: Record<string, string[]> = {
  generateForm: [
    "I'll create an interactive form for you.",
    "Here's a form that matches your requirements:",
    "I've designed a form for collecting the information you need:",
  ],
  generateChart: [
    "Let me visualize that data for you.",
    "Here's a chart based on your request:",
    "I've created a visualization of the data:",
  ],
  generateCode: [
    "Here's the code you requested:",
    "I've written some code that should help:",
    "Let me show you an implementation:",
  ],
  generateCard: [
    "Here's a card displaying the information:",
    "I've created an informative card for you:",
    "Here's a summary card with the details:",
  ],
};

/**
 * Helper to get a random item from an array
 */
export function getRandomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/**
 * Mock titles for conversation naming
 */
export const MOCK_TITLES = [
  'Quick Chat Session',
  'Project Discussion',
  'Code Review Help',
  'Data Analysis',
  'Feature Planning',
  'Bug Investigation',
];
