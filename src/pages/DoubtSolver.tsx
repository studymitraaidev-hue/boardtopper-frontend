import { Link, useSearchParams } from 'react-router-dom';
import { useEffect, useRef, useState, useCallback } from 'react';



import { cn } from '../utils/cn';
import { useAuth } from '../context/AuthContext';
import { api, ApiError } from '../utils/api';
import {
  Send, Sparkles, MessageCircle, History, Lightbulb, ChevronRight,
  BookOpen, X, Zap, Crown, Loader2, Camera, Calculator,
  FlaskConical, PenTool, ImagePlus,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'ai' | 'user';
  text: string;
  time: string;
  isImage?: boolean;
}

interface QuickPrompt {
  label: string;
  subject: string;
  sample: string;
  icon: typeof Calculator;
  gradient: string;
  chip: string;
  text: string;
  border: string;
}

const QUICK_PROMPTS: QuickPrompt[] = [
  {
    label: 'Math', subject: 'mathematics',
    sample: 'Solve: If the sum of first n terms of an AP is 3n² + 5n, find the 20th term.',
    icon: Calculator,
    gradient: 'from-violet-500/10 to-purple-500/10',
    chip: 'bg-violet-100/80 text-violet-700',
    text: 'text-violet-700',
    border: 'border-violet-200/50',
  },
  {
    label: 'Science', subject: 'science',
    sample: 'Explain the process of photosynthesis with a labeled diagram.',
    icon: FlaskConical,
    gradient: 'from-emerald-500/10 to-teal-500/10',
    chip: 'bg-emerald-100/80 text-emerald-700',
    text: 'text-emerald-700',
    border: 'border-emerald-200/50',
  },
  {
    label: 'English', subject: 'english',
    sample: 'Write a letter to the editor about traffic problems in your city.',
    icon: BookOpen,
    gradient: 'from-amber-500/10 to-orange-500/10',
    chip: 'bg-amber-100/80 text-amber-700',
    text: 'text-amber-700',
    border: 'border-amber-200/50',
  },
  {
    label: 'History', subject: 'social-science',
    sample: 'Describe the causes and effects of the French Revolution.',
    icon: PenTool,
    gradient: 'from-rose-500/10 to-pink-500/10',
    chip: 'bg-rose-100/80 text-rose-700',
    text: 'text-rose-700',
    border: 'border-rose-200/50',
  },
];

const WELCOME_MESSAGES = [
  "What would you like to master today?",
  "Ask me any board exam question...",
  "Stuck on a problem? I'm here to help.",
  "Let's crack this together.",
];

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function formatTime(): string {
  return new Date().toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

function ShimmerText({ text, className }: { text: string; className?: string }) {
  return (
    <span className={cn("relative inline-block", className)}>
      <span className="relative z-10">{text}</span>
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer bg-[length:200%_100%] z-0" />
    </span>
  );
}

function GlassCard({
  children, className, hover = true, onClick,
}: {
  children: React.ReactNode; className?: string; hover?: boolean; onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.04)] transition-all duration-500 ease-out",
        hover && "hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:scale-[1.02]",
        onClick && "cursor-pointer",
        className,
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent pointer-events-none" />
      {children}
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  return (
    <div className={cn("flex w-full mb-5 animate-fade-in-up", isUser ? "justify-end" : "justify-start")}>
      <div className={cn("flex max-w-[85%] gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
        <div className={cn(
          "flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shadow-lg",
          isUser
            ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white"
            : "bg-gradient-to-br from-emerald-400 to-teal-500 text-white",
        )}>
          {isUser ? 'You' : <Sparkles className="w-4 h-4" />}
        </div>
        <div className={cn(
          "relative px-5 py-4 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-all duration-300",
          isUser
            ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-tr-sm"
            : "bg-white/80 backdrop-blur-md border border-slate-100/80 rounded-tl-sm",
        )}>
          <div className={cn(
            "absolute top-0 left-0 right-0 h-px",
            isUser ? "bg-white/20" : "bg-gradient-to-r from-transparent via-white/60 to-transparent",
          )} />
          <div className={cn(
            "text-[15px] leading-relaxed whitespace-pre-wrap",
            isUser ? "text-white/95" : "text-slate-700",
          )}>{message.text}</div>
          <div className={cn(
            "text-[11px] mt-2 font-medium",
            isUser ? "text-indigo-200" : "text-slate-400",
          )}>{message.time}</div>
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex w-full mb-5 animate-fade-in-up">
      <div className="flex gap-3">
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
          <Sparkles className="w-4 h-4 text-white animate-pulse" />
        </div>
        <div className="px-5 py-4 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-100/80 rounded-tl-sm shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
          <div className="flex gap-2 items-center h-6">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DoubtSolver() {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] ?? 'Student';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: generateId(),
      role: 'ai',
      text: `Hi ${firstName}! I'm your BoardTopper AI tutor. Ask me any question — I'll give you a step-by-step, board-style answer with marking schemes.`,
      time: formatTime(),
    },
  ]);
  const [query, setQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [activeSubject, setActiveSubject] = useState('general');
  const [dailyCount, setDailyCount] = useState(0);
  const [showWelcome, setShowWelcome] = useState(true);
  const [welcomeIndex, setWelcomeIndex] = useState(0);

  const [recentHistory, setRecentHistory] = useState<Array<{
    id: string; role: 'user' | 'model'; text: string; subject: string | null; timestamp: string;
  }>>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!showWelcome) return;
    const interval = setInterval(() => {
      setWelcomeIndex((prev) => (prev + 1) % WELCOME_MESSAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [showWelcome]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [query]);

  useEffect(() => {
    const prefilledQ = searchParams.get('q');
    if (prefilledQ?.trim()) {
      setQuery(decodeURIComponent(prefilledQ));
      setTimeout(() => textareaRef.current?.focus(), 300);
    }
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    setHistoryLoading(true);
    api.get<Array<{
      id: string; role: 'user' | 'model'; text: string; subject: string | null; timestamp: string;
    }>>('/api/ai/history')
      .then((data) => {
        if (cancelled) return;
        setRecentHistory(data.filter((m) => m.role === 'user').slice(0, 5));
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setHistoryLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
    if (!ALLOWED.includes(file.type)) {
      alert('Only JPG, PNG, and WebP images are supported.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be under 5MB.');
      return;
    }
    setSelectedImage(file);
    setImagePreviewUrl(URL.createObjectURL(file));
    setShowWelcome(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const clearImage = useCallback(() => {
    setSelectedImage(null);
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImagePreviewUrl(null);
  }, [imagePreviewUrl]);

  const handleQuickPrompt = useCallback((prompt: QuickPrompt) => {
    setQuery(prompt.sample);
    setActiveSubject(prompt.subject);
    setShowWelcome(false);
    textareaRef.current?.focus();
  }, []);


  const handleSend = useCallback(async () => {
    if ((!query.trim() && !selectedImage) || isTyping) return;
    setShowWelcome(false);

    const token = localStorage.getItem('bt_token') ?? '';
    const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

    if (selectedImage) {
      setIsTyping(true);
      const formData = new FormData();
      formData.append('image', selectedImage);
      if (query.trim()) formData.append('question', query.trim());
      formData.append('subject', activeSubject);

      const userMsg: Message = {
        id: generateId(), role: 'user',
        text: query.trim() || '📸 Image question',
        time: formatTime(), isImage: true,
      };
      setMessages((prev) => [...prev, userMsg]);
      setQuery('');
      clearImage();

      try {
        const res = await fetch(`${BASE_URL}/api/ai/doubt-image`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        const body = await res.json() as { data?: { answer: string }; error?: string };
        const answerText = body.data?.answer ?? body.error ?? 'Could not process image. Please try again.';
        setMessages((prev) => [...prev, { id: generateId(), role: 'ai', text: answerText, time: formatTime() }]);
        setDailyCount((c) => c + 1);
      } catch {
        setMessages((prev) => [...prev, {
          id: generateId(), role: 'ai',
          text: 'Failed to process image. Please check your connection.',
          time: formatTime(),
        }]);
      } finally {
        setIsTyping(false);
      }
      return;
    }

    if (!query.trim()) return;
    const questionText = query.trim();
    const userMsg: Message = { id: generateId(), role: 'user', text: questionText, time: formatTime() };
    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setIsTyping(true);

    try {
      const data = await api.post<{
        answer: string;
        questionType: string;
        estimatedMarks: number;
      }>('/api/ai/ask', { question: questionText, subject: activeSubject, chapterId: undefined });
      setMessages((prev) => [...prev, { id: generateId(), role: 'ai', text: data.answer, time: formatTime() }]);
      setDailyCount((c) => c + 1);
    } catch (err: unknown) {
      const isRateLimit = err instanceof ApiError && err.status === 429;
      setMessages((prev) => [...prev, {
        id: generateId(), role: 'ai',
        text: isRateLimit
          ? "⚠️ You've reached the free plan limit of 3 doubts/hour. Upgrade to Pro for unlimited AI doubts."
          : 'AI service is temporarily unavailable. Please try again in a moment.',
        time: formatTime(),
      }]);
    } finally {
      setIsTyping(false);
    }
  }, [query, selectedImage, isTyping, activeSubject, clearImage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/20 relative overflow-hidden">
        {/* Ambient background orbs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-200/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        <div className="fixed inset-0 pointer-events-none opacity-[0.015]" style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

        {/* Header */}
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b border-white/40">
          <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">AI Doubt Solver</h1>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  AI Online<span className="mx-1 text-slate-300">|</span>
                  <span className="text-indigo-500 font-semibold">MH Board</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('/history')} className="p-2.5 rounded-xl hover:bg-slate-100/80 transition-all duration-300 group">
                <History className="w-5 h-5 text-slate-500 group-hover:text-indigo-500 transition-colors" />
              </button>
              <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xs font-bold text-amber-700">{dailyCount}/3</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 max-w-3xl mx-auto px-4 pt-6 pb-40">
          {showWelcome && messages.length === 1 && (
            <div className="space-y-8 animate-fade-in">
              <div className="text-center pt-12 pb-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-white/40 shadow-sm mb-6">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium text-slate-600">Board exam precision</span>
                </div>
                <h2 className="text-4xl font-bold text-slate-800 mb-3 tracking-tight">
                  <ShimmerText text={WELCOME_MESSAGES[welcomeIndex]} className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent bg-[length:200%_100%]" />
                </h2>
                <p className="text-slate-500 text-lg max-w-md mx-auto leading-relaxed">
                  Get step-by-step answers tailored for Maharashtra SSC. With marking schemes, common traps, and examiner tips.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {QUICK_PROMPTS.map((prompt, i) => {
                  const Icon = prompt.icon;
                  return (
                    <GlassCard key={prompt.label} hover onClick={() => handleQuickPrompt(prompt)} className={cn("p-4 bg-gradient-to-br", prompt.gradient, prompt.border, "animate-fade-in-up")} style={{ animationDelay: `${i * 100}ms` }}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className={cn("p-1.5 rounded-lg", prompt.chip)}><Icon className="w-4 h-4" /></div>
                        <span className={cn("text-sm font-bold", prompt.text)}>{prompt.label}</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{prompt.sample}</p>
                      <div className={cn("flex items-center gap-1 mt-2 text-[11px] font-medium", prompt.text)}>
                        Try now <ChevronRight className="w-3 h-3" />
                      </div>
                    </GlassCard>
                  );
                })}
              </div>

              <GlassCard className="p-5 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 border-indigo-200/30">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 mb-1">Unlock Unlimited Doubts</h3>
                    <p className="text-sm text-slate-500 mb-3">Get examiner-style marking, image solving, and priority support.</p>
                    <button onClick={() => navigate('/pricing')} className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 hover:-translate-y-0.5">
                      Upgrade to Pro
                    </button>
                  </div>
                </div>
              </GlassCard>
            </div>
          )}

          <div className="space-y-2">
            {messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* Input Area */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-white via-white/95 to-transparent pt-8 pb-6 px-4">
          <div className="max-w-3xl mx-auto">
            {selectedImage && imagePreviewUrl && (
              <div className="mb-3 animate-fade-in-up">
                <div className="inline-flex items-center gap-3 px-3 py-2 rounded-xl bg-white/80 backdrop-blur-md border border-slate-200/60 shadow-lg">
                  <img src={imagePreviewUrl} alt="Preview" className="w-12 h-12 rounded-lg object-cover shadow-sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{selectedImage.name}</p>
                    <p className="text-xs text-slate-400">{(selectedImage.size / 1024).toFixed(0)} KB</p>
                  </div>
                  <button onClick={clearImage} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>
            )}

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 blur-sm" />
              <div className="relative flex items-end gap-2 bg-white/90 backdrop-blur-xl rounded-2xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.08)] p-3">
                <button onClick={() => fileInputRef.current?.click()} className="flex-shrink-0 p-3 rounded-xl hover:bg-slate-100/80 transition-all duration-300 group/btn">
                  <ImagePlus className={cn("w-5 h-5 transition-colors", selectedImage ? "text-indigo-500" : "text-slate-400 group-hover/btn:text-indigo-500")} />
                </button>
                <textarea
                  ref={textareaRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask any board exam question..."
                  rows={1}
                  className="flex-1 bg-transparent border-0 resize-none py-3 px-2 text-[15px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-0 max-h-[120px]"
                />
                <button
                  onClick={handleSend}
                  disabled={(!query.trim() && !selectedImage) || isTyping}
                  className={cn(
                    "flex-shrink-0 p-3 rounded-xl transition-all duration-300",
                    (query.trim() || selectedImage) && !isTyping
                      ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed",
                  )}
                >
                  {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageSelect} className="hidden" />
            <p className="text-center text-[11px] text-slate-400 mt-2 font-medium">Press Enter to send · Shift+Enter for new line</p>
          </div>
        </div>

        <style>{`
          @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
          .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
          .animate-fade-in { animation: fade-in-up 0.6s ease-out forwards; }
          .animate-shimmer { animation: shimmer 3s ease-in-out infinite; }
        `}</style>
      </div>
    
  );
}
