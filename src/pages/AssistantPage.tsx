import { useRef, useState, type FormEvent } from 'react';
import ChatMessageBubble from '../components/ChatMessageBubble';
import { getChatProviderInfo, sendChatMessage } from '../lib/chatClient';
import type { ChatMessage } from '../types/chat';
import { buildSystemPrompt } from '../lib/projectContext';

const SUGGESTED_QUESTIONS = [
  'Which sections are on the critical path right now?',
  'What happens if we miss the overall completion date?',
  'How long does the contractor stay responsible for maintenance after handover?',
  'Are there any blockers on Route Rugby-Coventry Spur?',
];

const SYSTEM_PROMPT: ChatMessage = { role: 'system', content: buildSystemPrompt() };

const AssistantPage = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const providerInfo = getChatProviderInfo();

  async function submitMessage(content: string) {
    if (!content.trim() || isLoading) return;
    const userMessage: ChatMessage = { role: 'user', content };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setError(null);
    setIsLoading(true);

    try {
      const reply = await sendChatMessage([SYSTEM_PROMPT, ...nextMessages]);
      setMessages([...nextMessages, { role: 'assistant', content: reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong calling the assistant.');
    } finally {
      setIsLoading(false);
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      });
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    void submitMessage(input);
  }

  return (
    <div className="flex min-h-0 flex-1 justify-center overflow-hidden bg-slate-50 p-6">
      <div className="flex min-h-0 w-full max-w-3xl flex-col rounded-lg border border-slate-200 bg-white shadow-sm">
        {providerInfo.id === 'pollinations' && (
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-900">
            Demo mode: running on a free public model (no API key), so replies may be slower or
            lower quality, and it's rate-limited to about one message every 15 seconds. For a
            better local demo, set <code className="rounded bg-amber-100 px-1">VITE_GROQ_API_KEY</code>{' '}
            in <code className="rounded bg-amber-100 px-1">.env</code> (see{' '}
            <code className="rounded bg-amber-100 px-1">.env.example</code>) and restart the dev
            server.
          </div>
        )}
        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-6">
          {messages.length === 0 && (
            <div>
              <p className="mb-3 text-sm text-slate-500">
                Ask about construction progress, blockers, or contract terms (completion dates,
                penalties, maintenance obligations). Try:
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => void submitMessage(q)}
                    className="cursor-pointer rounded-full border border-slate-300 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message, i) => (
            <ChatMessageBubble key={i} message={message} />
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-400">
                Thinking&hellip;
              </div>
            </div>
          )}

          {error && (
            <div className="rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2 border-t border-slate-200 bg-white p-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about progress, blockers, or contract terms..."
            className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default AssistantPage;
