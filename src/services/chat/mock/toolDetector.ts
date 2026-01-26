import {
  MOCK_FORMS,
  MOCK_CHARTS,
  MOCK_CODE,
  MOCK_CARDS,
} from './mockData';
import type {
  FormContentData,
  ChartContentData,
  CodeContentData,
  CardContentData,
} from '@/types/content-blocks';

// Re-export types for convenience
export type { FormContentData, ChartContentData, CodeContentData, CardContentData };

/**
 * Tool detection result
 */
export interface DetectedTool {
  name: 'generateForm' | 'generateChart' | 'generateCode' | 'generateCard';
  data: FormContentData | ChartContentData | CodeContentData | CardContentData;
}

/**
 * Pattern definitions for tool detection
 */
const TOOL_PATTERNS = {
  generateForm: {
    patterns: [
      /\b(form|survey|questionnaire|registration|sign\s*up|signup|contact\s*form)\b/i,
      /\b(feedback\s*form|input\s*fields|collect\s*(information|data))\b/i,
      /\b(application\s*form|order\s*form|booking\s*form|subscribe)\b/i,
      /\bcreate\s+(a\s+)?form\b/i,
      /\bbuild\s+(a\s+)?form\b/i,
    ],
    variants: {
      contact: [/contact/i, /reach\s*out/i, /get\s*in\s*touch/i],
      survey: [/survey/i, /satisfaction/i, /feedback/i, /rating/i],
      registration: [/registration/i, /sign\s*up/i, /signup/i, /create\s*account/i],
    },
  },
  generateChart: {
    patterns: [
      /\b(chart|graph|plot|visualize|visualization)\b/i,
      /\b(bar\s*chart|pie\s*chart|line\s*graph|area\s*chart)\b/i,
      /\b(statistics|trends|compare\s*numbers|data\s*visualization)\b/i,
      /\b(analytics|metrics|dashboard)\b/i,
      /\bshow\s+(me\s+)?(a\s+)?chart\b/i,
    ],
    variants: {
      sales: [/sales/i, /revenue/i, /monthly/i, /quarterly/i],
      revenue: [/revenue/i, /profit/i, /growth/i, /trend/i, /line/i],
      distribution: [/distribution/i, /market\s*share/i, /pie/i, /breakdown/i],
      performance: [/performance/i, /metrics/i, /area/i, /over\s*time/i],
    },
  },
  generateCode: {
    patterns: [
      /\b(code|function|script|program|snippet)\b/i,
      /\b(implementation|write\s*code|show\s*code|example\s*code)\b/i,
      /\b(how\s*to\s*code|algorithm|class|method)\b/i,
      /\b(programming|developer|typescript|javascript|python)\b/i,
      /\b(decorator|hook|component|api)\b/i,
    ],
    variants: {
      decorator: [/decorator/i, /retry/i, /backoff/i, /python/i],
      sort: [/sort/i, /sorting/i, /algorithm/i, /quicksort/i, /typescript/i],
      react: [/react/i, /component/i, /hook/i, /tsx/i, /counter/i],
    },
  },
  generateCard: {
    patterns: [
      /\b(card|summary|profile|product\s*info)\b/i,
      /\b(display\s*info|showcase|preview|overview)\b/i,
      /\b(information\s*card|show\s*details|present\s*information)\b/i,
      /\b(user\s*profile|product\s*card)\b/i,
    ],
    variants: {
      product: [/product/i, /iphone/i, /item/i, /purchase/i],
      profile: [/profile/i, /user/i, /person/i, /developer/i, /engineer/i],
      summary: [/summary/i, /project/i, /report/i, /overview/i],
    },
  },
};

/**
 * Detect which tool should be called based on the user's message
 */
export function detectTool(message: string): DetectedTool | null {
  const lowerMessage = message.toLowerCase();

  // Check for form patterns
  if (matchesPatterns(lowerMessage, TOOL_PATTERNS.generateForm.patterns)) {
    const variant = detectVariant(lowerMessage, TOOL_PATTERNS.generateForm.variants);
    return {
      name: 'generateForm',
      data: MOCK_FORMS[variant] || MOCK_FORMS.contact,
    };
  }

  // Check for chart patterns
  if (matchesPatterns(lowerMessage, TOOL_PATTERNS.generateChart.patterns)) {
    const variant = detectVariant(lowerMessage, TOOL_PATTERNS.generateChart.variants);
    return {
      name: 'generateChart',
      data: MOCK_CHARTS[variant] || MOCK_CHARTS.sales,
    };
  }

  // Check for code patterns
  if (matchesPatterns(lowerMessage, TOOL_PATTERNS.generateCode.patterns)) {
    const variant = detectVariant(lowerMessage, TOOL_PATTERNS.generateCode.variants);
    return {
      name: 'generateCode',
      data: MOCK_CODE[variant] || MOCK_CODE.decorator,
    };
  }

  // Check for card patterns
  if (matchesPatterns(lowerMessage, TOOL_PATTERNS.generateCard.patterns)) {
    const variant = detectVariant(lowerMessage, TOOL_PATTERNS.generateCard.variants);
    return {
      name: 'generateCard',
      data: MOCK_CARDS[variant] || MOCK_CARDS.summary,
    };
  }

  // No tool detected
  return null;
}

/**
 * Check if message matches any of the given patterns
 */
function matchesPatterns(message: string, patterns: RegExp[]): boolean {
  return patterns.some(pattern => pattern.test(message));
}

/**
 * Detect which variant of a tool to use based on message content
 */
function detectVariant(
  message: string,
  variants: Record<string, RegExp[]>
): string {
  for (const [variant, patterns] of Object.entries(variants)) {
    if (patterns.some(pattern => pattern.test(message))) {
      return variant;
    }
  }
  // Return first variant as default
  return Object.keys(variants)[0];
}

/**
 * Check if the message is a greeting
 */
export function isGreeting(message: string): boolean {
  const greetingPatterns = [
    /^(hi|hello|hey|greetings|howdy|sup|yo)\b/i,
    /^good\s*(morning|afternoon|evening|day)\b/i,
    /^what('?s|\s+is)\s+up\b/i,
  ];
  return greetingPatterns.some(pattern => pattern.test(message.trim()));
}
