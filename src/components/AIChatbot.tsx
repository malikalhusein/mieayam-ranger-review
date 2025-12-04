import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
type Message = {
  role: "user" | "assistant";
  content: string;
};
const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mieayam-chat`;

// Parse markdown links and render as clickable links
const renderMessageContent = (content: string) => {
  if (!content) return null;

  // Match markdown links: [text](/path) or [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }
    const [, linkText, linkUrl] = match;

    // Check if it's an internal link (starts with /)
    if (linkUrl.startsWith('/')) {
      parts.push(<Link key={match.index} to={linkUrl} className="text-primary underline hover:text-primary/80 font-medium">
          {linkText}
        </Link>);
    } else {
      parts.push(<a key={match.index} href={linkUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80 font-medium">
          {linkText}
        </a>);
    }
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }
  return parts.length > 0 ? parts : content;
};
interface AIChatbotProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}
const AIChatbot = ({
  isOpen: controlledIsOpen,
  onOpenChange
}: AIChatbotProps = {}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setInternalIsOpen(open);
    }
  };
  const [messages, setMessages] = useState<Message[]>([{
    role: "assistant",
    content: "Halo! 👋 Saya adalah asisten AI Mie Ayam Ranger. Saya bisa membantu kamu menemukan warung mie ayam terbaik berdasarkan preferensimu. Mau cari mie ayam seperti apa hari ini?"
  }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);
  const handleSend = async (directMessage?: string) => {
    const messageToSend = directMessage || input.trim();
    if (!messageToSend || isLoading) return;
    const userMessage: Message = {
      role: "user",
      content: messageToSend
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
        content: ""
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
                  content: assistantContent
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
        content: "Maaf, terjadi kesalahan. Silakan coba lagi."
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
  return <>
      {/* Floating Button */}
      <button onClick={() => setIsOpen(!isOpen)} className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" aria-label={isOpen ? "Tutup chat" : "Buka chat AI"}>
        {isOpen ? <X className="h-5 w-5" /> : <>
            <MessageCircle className="h-5 w-5" />
            <span className="font-medium">Tanya Asisten </span>
          </>}
      </button>

      {/* Chat Window */}
      {isOpen && <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-primary px-4 py-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
            <h3 className="font-semibold text-primary-foreground">Mie Ayam AI Assistant</h3>
          </div>

          {/* Messages */}
          <ScrollArea className="h-[300px] p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((msg, idx) => <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted text-foreground rounded-bl-md"}`}>
                    {msg.content ? renderMessageContent(msg.content) : isLoading && idx === messages.length - 1 && <Loader2 className="h-4 w-4 animate-spin" />}
                  </div>
                </div>)}
            </div>
          </ScrollArea>

          {/* Quick Suggestions */}
          {messages.length <= 2 && !isLoading && (
            <div className="px-3 pb-2 flex flex-wrap gap-2">
              {[
                { label: "🏆 Rekomendasi terbaik", query: "Apa rekomendasi mie ayam terbaik?" },
                { label: "💰 Mie ayam murah", query: "Mie ayam murah yang enak dimana?" },
                { label: "🍜 Kuah terenak", query: "Mie ayam kuah paling enak?" },
                { label: "🍝 Goreng favorit", query: "Mie ayam goreng yang recommended?" },
              ].map((suggestion) => (
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