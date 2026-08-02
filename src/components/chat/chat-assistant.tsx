"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/stores/auth-store";
import { useNavStore, type PageKey } from "@/stores/nav-store";
import { cn } from "@/lib/utils";
import {
  Bot,
  X,
  Send,
  Sparkles,
  Trash2,
  AlertCircle,
  Lightbulb,
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

const QUICK_SUGGESTIONS = [
  "Apakah kadar caruman PERKESO?",
  "Bagaimana untuk buat tuntutan pampasan?",
  "Apakah skim di bawah ASIP?",
  "Di mana saya boleh lihat pekeliling wajib?",
];

const GREETING =
  "Selamat datang! Saya ASIP Assistant 🤖 — pembantu AI PERKESO Bulletin Dashboard. Tanya saya apa-apa tentang pengumuman, Akta, ASIP, SOP, pekeliling, atau soalan lazim PERKESO.";

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function ChatAssistant() {
  const { user } = useAuthStore();
  const { setPage } = useNavStore();
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Focus input when opened
  React.useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setError(null);
    const userMsg: ChatMessage = {
      id: uid(),
      role: "user",
      content: trimmed,
      timestamp: Date.now(),
    };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Gagal menghantar mesej");
      }
      const aiMsg: ChatMessage = {
        id: uid(),
        role: "assistant",
        content: data.response,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (e) {
      setError((e as Error).message);
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: "assistant",
          content:
            "Maaf, saya tidak dapat memproses permintaan anda sekarang. Sila cuba lagi sebentar, atau rujuk modul di sidebar untuk maklumat PERKESO.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  if (!user) return null;
  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-5 right-5 z-50 group"
            aria-label="Buka pembantu AI"
          >
            <span className="absolute inset-0 rounded-full bg-gradient-to-br from-[#007DC5] to-[#8DC63E] blur-lg opacity-60 group-hover:opacity-90 transition-opacity animate-pulse-soft" />
            <span className="relative flex items-center gap-2 px-4 py-3.5 rounded-full bg-gradient-to-br from-[#007DC5] to-[#004E7A] text-white shadow-xl ring-2 ring-white/30 group-hover:shadow-2xl transition-shadow">
              <Bot className="w-5 h-5" />
              <span className="hidden sm:inline text-sm font-semibold">
                ASIP Assistant
              </span>
              <Sparkles className="w-3.5 h-3.5 text-[#FFBF00]" />
              {messages.length === 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#8DC63E] ring-2 ring-background animate-pulse" />
              )}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop (mobile only) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="sm:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="fixed bottom-0 right-0 sm:bottom-5 sm:right-5 z-50 w-full sm:w-[26rem] h-[80vh] sm:h-[36rem] sm:max-h-[calc(100vh-3rem)] flex flex-col glass-strong sm:rounded-3xl rounded-none overflow-hidden border border-border shadow-2xl"
              style={{ background: "var(--glass-bg)" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-gradient-to-r from-[#007DC5]/10 to-[#8DC63E]/5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#007DC5] to-[#004E7A] flex items-center justify-center shadow-lg ring-1 ring-white/20">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#8DC63E] ring-2 ring-background" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold truncate">ASIP Assistant</span>
                      <Sparkles className="w-3 h-3 text-[#FFBF00] flex-shrink-0" />
                    </div>
                    <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#8DC63E] animate-pulse" />
                      Dalam talian • Dikuasakan AI
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {messages.length > 0 && (
                    <button
                      onClick={clearChat}
                      className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      aria-label="Padam perbualan"
                      title="Padam perbualan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setOpen(false)}
                    className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    aria-label="Tutup"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto scroll-pretty px-3 py-4 space-y-3"
              >
                {messages.length === 0 && (
                  <div className="space-y-4">
                    {/* Greeting */}
                    <div className="flex gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#007DC5] to-[#004E7A] flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="glass rounded-2xl rounded-tl-sm px-3.5 py-2.5 max-w-[85%]">
                        <p className="text-sm leading-relaxed">{GREETING}</p>
                      </div>
                    </div>
                    {/* Quick suggestions */}
                    <div className="space-y-1.5" style={{ paddingLeft: "2.6rem" }}>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                        <Lightbulb className="w-3 h-3 text-[#FFBF10]" />
                        Cadangan soalan
                      </div>
                      {QUICK_SUGGESTIONS.map((s) => (
                        <button
                          key={s}
                          onClick={() => send(s)}
                          className="block w-full text-left text-xs px-3 py-2 rounded-xl glass hover:border-primary/40 hover:shadow-sm transition-all border border-border/40"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((m) => (
                  <MessageBubble
                    key={m.id}
                    message={m}
                    userInitials={initials}
                    userAvatar={user.avatarUrl}
                    onNavigate={setPage}
                  />
                ))}

                {/* Typing indicator */}
                {loading && (
                  <div className="flex gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#007DC5] to-[#004E7A] flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="glass rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 text-xs text-red-500 px-2">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="border-t border-border/40 p-3 bg-gradient-to-b from-transparent to-muted/20">
                <div className="flex items-end gap-2">
                  <div className="flex-1 relative">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Tanya apa-apa tentang PERKESO..."
                      rows={1}
                      className="w-full resize-none rounded-xl bg-background/60 border border-border/60 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all placeholder:text-muted-foreground/60 max-h-28 scroll-pretty"
                      style={{ minHeight: "2.5rem" }}
                      disabled={loading}
                    />
                  </div>
                  <button
                    onClick={() => send(input)}
                    disabled={!input.trim() || loading}
                    className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-[#007DC5] to-[#004E7A] text-white flex items-center justify-center shadow-lg hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
                    aria-label="Hantar mesej"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[9px] text-muted-foreground/60 mt-1.5 text-center">
                  Dikuasakan oleh GLM AI • Prototaip — rujuk dokumen rasmi untuk binding perundangan
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ---- Message bubble with markdown-lite rendering + module navigation ----
function MessageBubble({
  message,
  userInitials,
  userAvatar,
  onNavigate,
}: {
  message: ChatMessage;
  userInitials: string;
  userAvatar?: string | null;
  onNavigate: (page: PageKey) => void;
}) {
  const isUser = message.role === "user";

  // Detect module references in AI response and offer navigation
  const navSuggestions = React.useMemo(() => {
    if (isUser) return [];
    const lower = message.content.toLowerCase();
    const found: { key: PageKey; label: string }[] = [];
    if (lower.includes("pengumuman")) found.push({ key: "announcements", label: "Buka Pengumuman" });
    if (lower.includes("akta") && !lower.includes("asip")) found.push({ key: "acts", label: "Buka Akta" });
    if (lower.includes("asip")) found.push({ key: "asip", label: "Buka ASIP" });
    if (lower.includes("sop")) found.push({ key: "sop", label: "Buka SOP" });
    if (lower.includes("pekeliling")) found.push({ key: "circulars", label: "Buka Pekeliling" });
    if (lower.includes("soalan lazim") || lower.includes("faq")) found.push({ key: "faq", label: "Buka FAQ" });
    if (lower.includes("dashboard")) found.push({ key: "dashboard", label: "Buka Dashboard" });
    // Dedupe + max 3
    return found
      .filter((v, i, a) => a.findIndex((x) => x.key === v.key) === i)
      .slice(0, 3);
  }, [message.content, isUser]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn("flex gap-2.5", isUser && "flex-row-reverse")}
    >
      {/* Avatar */}
      {isUser ? (
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8DC63E] to-[#597E26] flex items-center justify-center flex-shrink-0 text-white text-xs font-bold ring-1 ring-white/20 overflow-hidden">
          {userAvatar ? (
            <img
              src={userAvatar}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            userInitials
          )}
        </div>
      ) : (
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#007DC5] to-[#004E7A] flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}

      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3.5 py-2.5",
          isUser
            ? "bg-gradient-to-br from-[#007DC5] to-[#004E7A] text-white rounded-tr-sm shadow-md"
            : "glass rounded-tl-sm"
        )}
      >
        {/* Render content with basic line breaks + bold */}
        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {renderContent(message.content)}
        </div>

        {/* Navigation suggestions */}
        {navSuggestions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2.5 border-t border-border/30">
            {navSuggestions.map((s) => (
              <button
                key={s.key}
                onClick={() => onNavigate(s.key)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 transition-colors"
              >
                {s.label} →
              </button>
            ))}
          </div>
        )}

        <div
          className={cn(
            "text-[9px] mt-1.5 opacity-60",
            isUser ? "text-white/70" : "text-muted-foreground"
          )}
        >
          {new Date(message.timestamp).toLocaleTimeString("ms-MY", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </motion.div>
  );
}

// Simple markdown-lite: bold **text**
function renderContent(text: string): React.ReactNode {
  const lines = text.split("\n");
  return lines.map((line, i) => (
    <React.Fragment key={i}>
      {renderInline(line)}
      {i < lines.length - 1 && <br />}
    </React.Fragment>
  ));
}

function renderInline(text: string): React.ReactNode {
  // Split by **bold** markers
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold">
          {p.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={i}>{p}</React.Fragment>;
  });
}
