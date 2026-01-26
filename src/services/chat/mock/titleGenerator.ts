import { detectTool, isGreeting } from './toolDetector';

/**
 * Generate a mock conversation title based on the user's first message
 */
export function generateMockTitle(userMessage: string): string {
  const message = userMessage.trim();

  // Check for greetings
  if (isGreeting(message)) {
    return 'Quick Chat';
  }

  // Check for tool-specific titles
  const detectedTool = detectTool(message);
  if (detectedTool) {
    return generateToolTitle(detectedTool.name, message);
  }

  // Check for question patterns
  if (/^\w+\s+(is|are|was|were|do|does|did|can|could|would|should|will|has|have|had)\b/i.test(message)) {
    return generateQuestionTitle(message);
  }

  // Generate title from message content
  return generateContentTitle(message);
}

/**
 * Generate title for tool-related conversations
 */
function generateToolTitle(toolName: string, message: string): string {
  const lowerMessage = message.toLowerCase();

  switch (toolName) {
    case 'generateForm':
      if (/contact/i.test(lowerMessage)) return 'Contact Form Design';
      if (/survey/i.test(lowerMessage)) return 'Survey Creation';
      if (/registration|sign.*up/i.test(lowerMessage)) return 'Registration Form';
      if (/feedback/i.test(lowerMessage)) return 'Feedback Form';
      return 'Form Builder';

    case 'generateChart':
      if (/sales/i.test(lowerMessage)) return 'Sales Data Visualization';
      if (/revenue/i.test(lowerMessage)) return 'Revenue Chart';
      if (/performance/i.test(lowerMessage)) return 'Performance Metrics';
      if (/market/i.test(lowerMessage)) return 'Market Analysis';
      return 'Data Visualization';

    case 'generateCode':
      if (/python/i.test(lowerMessage)) return 'Python Code Example';
      if (/typescript|javascript/i.test(lowerMessage)) return 'TypeScript/JS Code';
      if (/react/i.test(lowerMessage)) return 'React Component';
      if (/decorator/i.test(lowerMessage)) return 'Decorator Pattern';
      if (/sort/i.test(lowerMessage)) return 'Sorting Algorithm';
      return 'Code Implementation';

    case 'generateCard':
      if (/product/i.test(lowerMessage)) return 'Product Card Design';
      if (/profile/i.test(lowerMessage)) return 'Profile Card';
      if (/summary/i.test(lowerMessage)) return 'Summary Card';
      return 'Information Card';

    default:
      return 'AI Assistant Chat';
  }
}

/**
 * Generate title for question-type messages
 */
function generateQuestionTitle(message: string): string {
  const lowerMessage = message.toLowerCase();

  // Extract key topics
  if (/how\s+to/i.test(lowerMessage)) {
    const match = lowerMessage.match(/how\s+to\s+(\w+(?:\s+\w+)?)/i);
    if (match) {
      return `How to ${capitalize(match[1])}`;
    }
    return 'How-To Question';
  }

  if (/what\s+is|what\s+are/i.test(lowerMessage)) {
    const match = lowerMessage.match(/what\s+(?:is|are)\s+(\w+(?:\s+\w+)?)/i);
    if (match) {
      return `About ${capitalize(match[1])}`;
    }
    return 'Question';
  }

  if (/why/i.test(lowerMessage)) {
    return 'Understanding Why';
  }

  if (/when/i.test(lowerMessage)) {
    return 'Timing Question';
  }

  if (/where/i.test(lowerMessage)) {
    return 'Location Question';
  }

  return 'Question & Answer';
}

/**
 * Generate title from message content
 */
function generateContentTitle(message: string): string {
  // Remove punctuation and extra whitespace
  const cleaned = message
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Get first few meaningful words
  const words = cleaned.split(' ').filter(w => w.length > 2);
  const titleWords = words.slice(0, 4);

  if (titleWords.length === 0) {
    return 'New Conversation';
  }

  // Capitalize and join
  const title = titleWords.map(capitalize).join(' ');

  // Truncate if too long
  if (title.length > 40) {
    return title.substring(0, 37) + '...';
  }

  return title;
}

/**
 * Capitalize first letter of a string
 */
function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Simulate async title generation with a small delay
 */
export async function generateMockTitleAsync(
  userMessage: string,
  delayMs: number = 500
): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, delayMs));
  return generateMockTitle(userMessage);
}
