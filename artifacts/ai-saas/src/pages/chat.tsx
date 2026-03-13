import { useState, useEffect, useRef } from "react";
import { useAiStream } from "@/hooks/use-ai-stream";
import { useListOpenaiConversations, useGetOpenaiConversation, useCreateOpenaiConversation } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { Loader2, MessageSquare, Send, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function ChatAssistant() {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { data: convs, refetch: refetchConvs } = useListOpenaiConversations();
  const { data: activeConv } = useGetOpenaiConversation(activeId!, { query: { enabled: !!activeId } });
  const createMutation = useCreateOpenaiConversation();
  const { content, isLoading, generate, setContent } = useAiStream();

  // Load active conversation messages
  useEffect(() => {
    if (activeConv) {
      setMessages(activeConv.messages || []);
    } else {
      setMessages([]);
    }
  }, [activeConv, activeId]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, content]);

  // Handle stream completion logic
  const prevLoading = useRef(isLoading);
  useEffect(() => {
    if (prevLoading.current && !isLoading && content) {
      setMessages(prev => [...prev, { role: 'assistant', content, id: Date.now() }]);
      setContent('');
    }
    prevLoading.current = isLoading;
  }, [isLoading, content, setContent]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userText = input;
    setInput("");
    
    let targetId = activeId;
    
    if (!targetId) {
      // Create new chat first if none active
      try {
        const newConv = await createMutation.mutateAsync({ data: { title: userText.slice(0, 40) } });
        targetId = newConv.id;
        setActiveId(targetId);
        refetchConvs();
        setMessages([{ role: 'user', content: userText, id: Date.now() }]);
      } catch (err) {
        return; // handle error via toast in mutation if added
      }
    } else {
      setMessages(prev => [...prev, { role: 'user', content: userText, id: Date.now() }]);
    }

    // Call custom SSE endpoint
    await generate(`/api/openai/conversations/${targetId}/messages`, { content: userText });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto h-[calc(100vh-8rem)] min-h-[500px]">
      <div className="flex h-full gap-6">
        
        {/* Sidebar - Conversation List */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-72 glass-panel rounded-2xl flex-col hidden md:flex overflow-hidden"
        >
          <div className="p-4 border-b border-white/5">
            <Button 
              onClick={() => setActiveId(null)} 
              className="w-full bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 hover:text-white border border-indigo-500/20"
            >
              <Plus className="w-4 h-4 mr-2" /> New Chat
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-hide">
            {convs?.map(c => (
              <button 
                key={c.id}
                onClick={() => setActiveId(c.id)} 
                className={cn(
                  "w-full text-left px-3 py-3 rounded-xl text-sm transition-all duration-200 truncate", 
                  activeId === c.id 
                    ? "bg-indigo-500/20 text-indigo-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] border border-indigo-500/20" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-white border border-transparent"
                )}
              >
                {c.title || "New Conversation"}
              </button>
            ))}
            {(!convs || convs.length === 0) && (
              <div className="text-center text-xs text-muted-foreground p-4">No history found.</div>
            )}
          </div>
        </motion.div>

        {/* Main Chat Area */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 glass-panel rounded-2xl flex flex-col overflow-hidden relative"
        >
          {/* Header */}
          <div className="h-16 border-b border-white/5 bg-background/40 flex items-center px-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                <MessageSquare className="w-4 h-4" />
              </div>
              <h2 className="font-semibold text-white">
                {activeId ? (convs?.find(c => c.id === activeId)?.title || "Conversation") : "New Chat"}
              </h2>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            {messages.length === 0 && !isLoading && !content && (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground/50 m-auto text-center max-w-sm">
                <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
                <h3 className="text-lg font-medium text-white/70 mb-2">How can I help you today?</h3>
                <p className="text-sm">Type a message below to start a conversation with the AI assistant.</p>
              </div>
            )}

            {messages.map(m => (
              <div key={m.id} className={cn("flex w-full", m.role === 'user' ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[85%] rounded-2xl px-5 py-4 shadow-md", 
                  m.role === 'user' 
                    ? "bg-indigo-600 text-white rounded-br-sm" 
                    : "bg-[#1E1E24] border border-white/5 text-white/90 rounded-bl-sm"
                )}>
                  {m.role === 'user' ? (
                    <div className="whitespace-pre-wrap">{m.content}</div>
                  ) : (
                    <MarkdownRenderer content={m.content} className="prose-sm md:prose-base" />
                  )}
                </div>
              </div>
            ))}

            {/* Streaming message preview */}
            {(isLoading || content) && (
              <div className="flex w-full justify-start">
                <div className="max-w-[85%] rounded-2xl px-5 py-4 shadow-md bg-[#1E1E24] border border-white/5 text-white/90 rounded-bl-sm">
                  {content ? (
                    <MarkdownRenderer content={content} className="prose-sm md:prose-base" />
                  ) : (
                    <div className="flex space-x-2 h-6 items-center px-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-background/60 border-t border-white/5">
            <div className="relative max-w-4xl mx-auto flex items-end gap-3 bg-card border border-white/10 rounded-2xl p-2 shadow-xl focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all">
              <Textarea 
                value={input} 
                onChange={e => setInput(e.target.value)} 
                onKeyDown={handleKeyDown}
                className="min-h-[44px] max-h-[200px] border-0 focus-visible:ring-0 resize-none bg-transparent py-3" 
                placeholder="Message AI Assistant... (Shift+Enter for newline)" 
              />
              <Button 
                onClick={handleSend} 
                disabled={!input.trim() || isLoading} 
                size="icon" 
                className="mb-1 mr-1 h-10 w-10 shrink-0 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 active-elevate-2 hover-elevate border-0"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
            <div className="text-center mt-2 text-[10px] text-muted-foreground/60">
              AI can make mistakes. Consider verifying important information.
            </div>
          </div>
        </motion.div>
        
      </div>
    </div>
  );
}
