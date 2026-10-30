import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, Bot, Sparkles, MessageSquare, Plus, Bookmark } from 'lucide-react';
import { api } from '../services/api.js';
import { ChatMessage } from '../components/copilot/ChatMessage.js';
import { Button } from '../components/common/Button.js';
import { Spinner } from '../components/common/Spinner.js';

export const CopilotPage: React.FC = () => {
  const { id: investigationId } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(undefined);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: convsData } = useQuery({
    queryKey: ['conversations', investigationId],
    queryFn: () => api.copilot.listConversations(investigationId!),
    enabled: Boolean(investigationId)
  });

  const conversations = convsData?.data || [];

  // Default to first conversation
  useEffect(() => {
    if (conversations.length > 0 && !activeConversationId) {
      setActiveConversationId(conversations[0].id);
    }
  }, [conversations, activeConversationId]);

  const { data: messagesData, isLoading: loadingMessages } = useQuery({
    queryKey: ['messages', activeConversationId],
    queryFn: () => api.copilot.getMessages(activeConversationId!),
    enabled: Boolean(activeConversationId)
  });

  const messages = messagesData?.data || [];

  const askMutation = useMutation({
    mutationFn: (msg: string) =>
      api.copilot.ask({
        investigationId: investigationId!,
        conversationId: activeConversationId,
        message: msg
      }),
    onSuccess: (res) => {
      if (res.data?.conversationId && !activeConversationId) {
        setActiveConversationId(res.data.conversationId);
      }
      queryClient.invalidateQueries({ queryKey: ['messages', activeConversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations', investigationId] });
      setInputMessage('');
    }
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || askMutation.isPending) return;
    askMutation.mutate(inputMessage.trim());
  };

  const handlePromptPill = (prompt: string) => {
    setInputMessage(prompt);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col h-[750px]">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center">
            <Bot size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">AI Research Copilot Chat</h3>
            <p className="text-[11px] text-slate-500">
              Retrieval-Augmented Generation strictly grounded on collected workspace evidence.
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {loadingMessages ? (
          <div className="py-20 flex justify-center"><Spinner /></div>
        ) : messages.length === 0 ? (
          <div className="py-16 text-center max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mx-auto">
              <Sparkles size={24} />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Ask Anything About Collected Findings</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every generated response cites collected academic sources or explicitly states evidence insufficiency.
            </p>

            <div className="pt-4 flex flex-col gap-2">
              <button
                onClick={() => handlePromptPill('What are the primary methodological differences across the reviewed studies?')}
                className="text-left text-xs bg-slate-50 hover:bg-slate-100 p-2.5 rounded-lg border border-slate-200 text-slate-700 transition-colors"
              >
                "What are the primary methodological differences across the reviewed studies?"
              </button>
              <button
                onClick={() => handlePromptPill('Which specific studies identify dataset or cohort demographic limitations?')}
                className="text-left text-xs bg-slate-50 hover:bg-slate-100 p-2.5 rounded-lg border border-slate-200 text-slate-700 transition-colors"
              >
                "Which specific studies identify dataset or cohort demographic limitations?"
              </button>
            </div>
          </div>
        ) : (
          messages.map((m) => <ChatMessage key={m.id} message={m} />)
        )}

        {askMutation.isPending && (
          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg text-xs text-slate-500 animate-pulse">
            <Spinner size="sm" />
            <span>Retrieving evidence and formulating citation-backed answer...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3.5 border-t border-slate-200 bg-white flex items-center gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask a grounded research question..."
          className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
        />
        <Button type="submit" size="sm" loading={askMutation.isPending} icon={<Send size={14} />}>
          Send
        </Button>
      </form>
    </div>
  );
};

