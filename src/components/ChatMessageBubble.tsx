import type { ChatMessage } from '../lib/groqClient';

interface ChatMessageBubbleProps {
  message: ChatMessage;
}

const ChatMessageBubble = ({ message }: ChatMessageBubbleProps) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-2xl whitespace-pre-wrap rounded-lg px-4 py-2 text-sm ${
          isUser ? 'bg-blue-600 text-white' : 'border border-slate-200 bg-white text-slate-800'
        }`}
      >
        {message.content}
      </div>
    </div>
  );
};

export default ChatMessageBubble;
