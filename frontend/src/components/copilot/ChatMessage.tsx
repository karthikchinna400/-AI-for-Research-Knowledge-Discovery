import React from 'react';
import { Bot, User, Bookmark } from 'lucide-react';
import { CopilotMessage } from '../../types/index.js';

interface ChatMessageProps {
  message: CopilotMessage;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`flex gap-3.5 p-4 rounded-xl ${isAssistant ? 'bg-white border border-slate-200/80 shadow-2xs' : 'bg-slate-100/70'}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isAssistant ? 'bg-brand-600 text-white' : 'bg-slate-700 text-white'}`}>
        {isAssistant ? <Bot size={18} /> : <User size={18} />}
      </div>
      <div className="flex-1 space-y-2.5 overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800">
            {isAssistant ? 'AI Research Copilot' : 'You'}
          </span>
          <span className="text-[10px] text-slate-400">
            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <p className="text-xs md:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>

        {/* Citations chips */}
        {message.citations && message.citations.length > 0 && (
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Bookmark size={11} /> Cited Sources:
            </span>
            {message.citations.map((c, idx) => (
              <span
                key={idx}
                className="text-[11px] bg-brand-50 border border-brand-200 text-brand-700 px-2 py-0.5 rounded-md truncate max-w-xs"
                title={c.title}
              >
                [{idx + 1}] {c.title || c.doi || 'Source'}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

