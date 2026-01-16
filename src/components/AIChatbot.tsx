import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Loader2, Sparkles, Trash2, Copy, Check, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp?: number;
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mieayam-chat`;
const STORAGE_KEY = "mieayam-chat-history";
const MAX_MESSAGES = 50;

// Parse markdown links and render as clickable links
const renderMessageContent = (content: string) => {
  if (!content) return null;

  // Match markdown links: [text](/path) or [text](url) or [text](ID:xxx)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }
    const [, linkText, rawUrl] = match;

    // Normalize the URL - handle various formats AI might generate
    let linkUrl = rawUrl;
    
    // Handle ID:xxx format -> /review/xxx
    if (rawUrl.startsWith('ID:')) {
      linkUrl = `/review/${rawUrl.slice(3)}`;
    }
    // Handle SLUG:xxx format -> /reviews/xxx
    else if (rawUrl.startsWith('SLUG:')) {
      linkUrl = `/reviews/${rawUrl.slice(5)}`;
    }
    // Handle bare UUID format -> /review/uuid
    else if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawUrl)) {
      linkUrl = `/review/${rawUrl}`;
    }

    // Check if it's an internal link (starts with /)
    if (linkUrl.startsWith('/')) {
      parts.push(
        <Link 
          key={match.index} 
          to={linkUrl} 
          className="text-primary underline hover:text-primary/80 font-medium"
        >
          {linkText}
        </Link>
      );
    } else {
      parts.push(
        <a 
          key={match.index} 
          href={linkUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-primary underline hover:text-primary/80 font-medium"
        >
          {linkText}
        </a>
      );
    }
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }
  return parts.length > 0 ? parts : content;
};

// Format timestamp
const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString('id-ID', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

interface AIChatbotProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const AIChatbot = ({
  isOpen: controlledIsOpen,
  onOpenChange
}: AIChatbotProps = {}) => {
  const { toast } = useToast();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setInternalIsOpen(open);
    }
  };

  // Load messages from localStorage on mount
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to load chat history:", e);
    }
    return [{
      role: "assistant",
      content: "Halo! 👋 Saya adalah asisten AI Mie Ayam Ranger. Saya bisa membantu kamu menemukan warung mie ayam terbaik berdasarkan preferensimu. Mau cari mie ayam seperti apa hari ini?",
      timestamp: Date.now()
    }];
  });

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isButtonVisible, setIsButtonVisible] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Save messages to localStorage
  useEffect(() => {
    try {
      // Keep only last MAX_MESSAGES
      const toSave = messages.slice(-MAX_MESSAGES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.error("Failed to save chat history:", e);
    }
  }, [messages]);

  // Smooth auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  }, []);

  // Initial button entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setIsButtonVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const clearHistory = () => {
    const initialMessage: Message = {
      role: "assistant",
      content: "Halo! 👋 Saya adalah asisten AI Mie Ayam Ranger. Saya bisa membantu kamu menemukan warung mie ayam terbaik berdasarkan preferensimu. Mau cari mie ayam seperti apa hari ini?",
      timestamp: Date.now()
    };
    setMessages([initialMessage]);
    toast({
      title: "Riwayat dihapus",
      description: "Percakapan telah direset",
    });
  };

  const copyMessage = async (content: string, index: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (e) {
      console.error("Failed to copy:", e);
    }
  };

  const handleSend = async (directMessage?: string) => {
    const messageToSend = directMessage || input.trim();
    if (!messageToSend || isLoading) return;
    const userMessage: Message = {
      role: "user",
      content: messageToSend,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMessage]);
    if (!directMessage) setInput("");
    setIsLoading(true);
    let assistantContent = "";
    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
        },
        body: JSON.stringify({
          messages: [...messages, userMessage]
        })
      });
      if (!response.ok || !response.body) {
        throw new Error("Failed to get response");
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      // Add empty assistant message to stream into
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "",
        timestamp: Date.now()
      }]);
      while (true) {
        const {
          done,
          value
        } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, {
          stream: true
        });
        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  role: "assistant",
                  content: assistantContent,
                  timestamp: Date.now()
                };
                return newMessages;
              });
            }
          } catch {
            // Incomplete JSON, put back and wait
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Maaf, terjadi kesalahan. Silakan coba lagi.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Dynamic quick suggestions based on conversation length
  const getQuickSuggestions = () => {
    if (messages.length <= 2) {
      return [
        { label: "🏆 Rekomendasi terbaik", query: "Apa rekomendasi mie ayam terbaik?" },
        { label: "💰 Mie ayam murah", query: "Mie ayam murah yang enak dimana?" },
        { label: "🍜 Kuah terenak", query: "Mie ayam kuah paling enak?" },
        { label: "🍝 Goreng favorit", query: "Mie ayam goreng yang recommended?" },
      ];
    } else if (messages.length <= 6) {
      return [
        { label: "📍 Di Jakarta", query: "Mie ayam enak di Jakarta?" },
        { label: "🧹 Paling bersih", query: "Mie ayam dengan fasilitas paling bersih?" },
        { label: "⭐ Editor's Choice", query: "Mie ayam yang dapat Editor's Choice?" },
        { label: "🔥 Paling kompleks", query: "Mie ayam dengan rasa paling kompleks?" },
      ];
    }
    return [
      { label: "🆕 Review terbaru", query: "Review mie ayam terbaru?" },
      { label: "🗺️ Bandingkan", query: "Bandingkan 3 mie ayam terbaik" },
    ];
  };

  return <>
      {/* Floating Button with entrance/exit animation */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${
          isButtonVisible 
            ? 'translate-y-0 opacity-100' 
            : 'translate-y-8 opacity-0'
        } ${isOpen ? 'scale-90' : ''}`}
        style={{ 
          transitionProperty: 'transform, opacity, box-shadow',
          transitionDuration: isOpen ? '200ms' : '500ms',
          transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
        aria-label={isOpen ? "Tutup chat" : "Buka chat AI"}
      >
        <span className={`transition-transform duration-300 ${isOpen ? 'rotate-90 scale-110' : 'rotate-0'}`}>
          {isOpen ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
        </span>
        <span className={`font-medium transition-all duration-200 overflow-hidden ${isOpen ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
          Tanya Asisten
        </span>
      </button>

      {/* Chat Window */}
      {isOpen && <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
          {/* Header */}
          <div className="bg-primary px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary-foreground animate-pulse" />
              <h3 className="font-semibold text-primary-foreground">Mie Ayam AI Assistant</h3>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
              onClick={clearHistory}
              title="Hapus riwayat"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="h-[320px] p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in group`}>
                  <div className="flex flex-col max-w-[85%]">
                    <div className={`px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted text-foreground rounded-bl-md"}`}>
                      {msg.content ? renderMessageContent(msg.content) : isLoading && idx === messages.length - 1 && (
                        <div className="flex items-center gap-2">
                          <span className="flex gap-1">
                            <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </span>
                        </div>
                      )}
                    </div>
                    {/* Message footer with timestamp and copy */}
                    <div className={`flex items-center gap-2 mt-1 ${msg.role === "user" ? "justify-end" : "justify-start"} opacity-0 group-hover:opacity-100 transition-opacity`}>
                      {msg.timestamp && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(msg.timestamp)}
                        </span>
                      )}
                      {msg.role === "assistant" && msg.content && (
                        <button 
                          onClick={() => copyMessage(msg.content, idx)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          title="Salin"
                        >
                          {copiedIndex === idx ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Quick Suggestions */}
          {!isLoading && (
            <div className="px-3 pb-2 flex flex-wrap gap-2">
              {getQuickSuggestions().map((suggestion) => (
                <button
                  key={suggestion.label}
                  onClick={() => handleSend(suggestion.query)}
                  className="text-xs px-3 py-1.5 bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-full border border-border hover:border-primary/30 transition-all duration-200"
                >
                  {suggestion.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-border p-3 flex gap-2">
            <Input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Ketik pesan..." disabled={isLoading} className="flex-1" />
            <Button size="icon" onClick={() => handleSend()} disabled={!input.trim() || isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>}
    </>;
};
export default AIChatbot;
