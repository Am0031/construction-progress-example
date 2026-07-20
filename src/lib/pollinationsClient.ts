import type { ChatMessage } from '../types/chat';

const POLLINATIONS_API_URL = 'https://text.pollinations.ai/openai';

/**
 * Free, keyless OpenAI-compatible chat endpoint (https://pollinations.ai) —
 * used as the assistant's default provider so the deployed demo works
 * without shipping any API key. Anonymous use is rate-limited to roughly one
 * request per 15 seconds, which is fine for a demo but not for production.
 */
export async function sendPollinationsMessage(messages: ChatMessage[]): Promise<string> {
  const response = await fetch(POLLINATIONS_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openai',
      messages,
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Pollinations API error (${response.status}): ${body || response.statusText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string') {
    throw new Error('Unexpected response shape from Pollinations API.');
  }
  return content;
}
