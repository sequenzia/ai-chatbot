import { generateText } from 'ai';
import { config } from '@/config';
import { getModel } from '@/lib/ai/model';

export const maxDuration = 15;

const TITLE_PROMPT = `Generate a concise title (max 50 characters) for this conversation based on the user's first message.
The title should:
- Capture the main topic or intent
- Be descriptive but brief
- Not include quotes or special characters
- Be in sentence case

User message: {userMessage}

Respond with ONLY the title, nothing else.`;

function truncateAtWordBoundary(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;

  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > maxLength * 0.6) {
    return truncated.substring(0, lastSpace) + '...';
  }

  return truncated.substring(0, maxLength - 3) + '...';
}

export async function POST(req: Request) {
  try {
    const { userMessage, conversationId } = await req.json();

    if (!userMessage || !conversationId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { titleGeneration } = config.ai;

    // Create prompt with user message
    const prompt = TITLE_PROMPT.replace('{userMessage}', userMessage);

    // Generate title with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      titleGeneration.timeoutMs
    );

    try {
      const result = await generateText({
        model: getModel(titleGeneration.model),
        prompt,
        abortSignal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Clean and truncate title
      let title = result.text.trim();

      // Remove quotes if present
      title = title.replace(/^["']|["']$/g, '');

      // Truncate at word boundary if too long
      if (title.length > titleGeneration.maxLength) {
        title = truncateAtWordBoundary(title, titleGeneration.maxLength);
      }

      return new Response(JSON.stringify({ title, conversationId }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  } catch (error) {
    console.error('Title generation error:', error);

    // Return fallback indicator
    return new Response(
      JSON.stringify({ error: 'Title generation failed', useFallback: true }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
