/**
 * DoubtSolver
 *
 * AI doubt-solving chat for Maharashtra SSC students.
 * - Text or photographed questions, answered by the backend AI.
 * - Subject tag (General/Math/Science/English/History) is sent with
 *   every request so the backend can eventually answer subject-aware.
 * - AI answers render through react-markdown, not hand-rolled regex —
 *   headings, bold, and lists always render correctly.
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import {
  Send,
  ImagePlus,
  X,
  Sparkles,
  BookOpen,
  FlaskConical,
  Calculator,
  PenTool,
  History,
  ChevronRight,
  Crown,
  Copy,
  Check,
  RotateCcw,
  Plus,
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { cn } from '../utils/cn';

/* ──────────────────────────────────────────
   Types
   ────────────────────────────────────────── */

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  time: string;
  isImage?: boolean;
  isError?: boolean;
}

interface QuickPrompt {
  icon: React.ReactNode;
  label: string;
  text: string;
  subject: string;
}

interface Subject {
  id: string;
  label: string;
  icon: React.ReactNode;
}

/* ──────────────────────────────────────────
   Constants
   ────────────────────────────────────────── */

const SUBJECTS: Subject[] = [
  { id: 'general', label: 'General', icon: <Sparkles className="w-3.5 h-3.5" /> },
  { id: 'mathematics', label: 'Math', icon: <Calculator className="w-3.5 h-3.5" /> },
  { id: 'science', label: 'Science', icon: <FlaskConical className="w-3.5 h-3.5" /> },
  { id: 'english', label: 'English', icon: <BookOpen className="w-3.5 h-3.5" /> },
  { id: 'history', label: 'History', icon: <PenTool className="w-3.5 h-3.5" /> },
];

const QUICK_PROMPTS: QuickPrompt[] = [
  {
    icon: <Calculator className="w-4 h-4" />,
    label: 'Math',
    text: 'Solve: If the sum of first n terms of an AP is 3n²+5n, find the 20th term.',
    subject: 'mathematics',
  },
  {
    icon: <FlaskConical className="w-4 h-4" />,
    label: 'Science',
    text: 'Explain the process of photosynthesis with a labeled diagram.',
    subject: 'science',
  },
  {
    icon: <BookOpen className="w-4 h-4" />,
    label: 'English',
    text: 'Write a letter to the editor about traffic problems in your city.',
    subject: 'english',
  },
  {
    icon: <PenTool className="w-4 h-4" />,
    label: 'History',
    text: 'Describe the causes and effects of the French Revolution.',
    subject: 'history',
  },
];

const WELCOME_MESSAGES = [
  'What would you like to master today?',
  'Ask me any board exam question…',
  "Stuck on a problem? I'm here to help.",
  "Let's crack this together.",
];

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

/* ──────────────────────────────────────────
   Helpers
   ────────────────────────────────────────── */

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function formatTime(): string {
  return new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

type AnswerResult =
  | { ok: true; text: string }
  | { ok: false; rateLimited: boolean };

async function extractAnswer(res: Response): Promise<AnswerResult> {
  const body = await res.json().catch(() => ({} as any));
  if (res.status === 429) return { ok: false, rateLimited: true };
  if (!res.ok) return { ok: false, rateLimited: false };
  const text: string =
    body.data?.answer ?? body.answer ?? 'Could not process your question. Please try again.';
  return { ok: true, text };
}

/* ──────────────────────────────────────────
   GlassCard
   ────────────────────────────────────────── */

function GlassCard({
  children,
  className,
  hover = true,
  onClick,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  return (
    <div
      onClick={onClick}
      style={style}
      className={cn(
        'relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_rgba(79,70,229,0.06)] transition-all duration-500 ease-out',
        hover && 'hover:shadow-[0_20px_48px_rgba(79,70,229,0.12)] hover:-translate-y-1',
        onClick && 'cursor-pointer',
        className,
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent pointer-events-none" />
      <div className="relative">{children}</div>
    </div>
  );
}

/* ──────────────────────────────────────────
   AnswerMarkdown — real markdown, not regex
   ────────────────────────────────────────── */

function AnswerMarkdown({ text }: { text: string }) {
  return (
    <div className="prose-doubt">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-lg font-black text-slate-900 mt-4 mb-2 first:mt-0">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-900 mt-5 mb-2 first:mt-0">
              <span className="w-1 h-4 rounded-full bg-gradient-to-b from-indigo-500 to-violet-600" />
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-[15px] font-bold text-indigo-700 mt-4 mb-1.5 first:mt-0">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-[15px] text-slate-700 leading-relaxed mb-2.5 last:mb-0">
              {children}
            </p>
          ),
          strong: ({ children }) => <strong className="font-bold text-slate-900">{children}</strong>,
          em: ({ children }) => <em className="italic text-slate-700">{children}</em>,
          ul: ({ children }) => <ul className="space-y-1.5 mb-3 ml-1">{children}</ul>,
          ol: ({ children }) => <ol className="space-y-1.5 mb-3 ml-1 list-none">{children}</ol>,
          li: (liProps: any) => {
            const { children, ordered, index } = liProps;
            return (
              <li className="flex items-start gap-2.5 text-[15px] text-slate-700 leading-relaxed">
                {ordered ? (
                  <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 text-[11px] font-bold flex items-center justify-center">
                    {(index ?? 0) + 1}
                  </span>
                ) : (
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                )}
                <span className="flex-1">{children}</span>
              </li>
            );
          },
          code: ({ children }) => (
            <code className="px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[13px] font-mono border border-indigo-100">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="p-3 rounded-xl bg-slate-900 text-slate-100 text-[13px] font-mono overflow-x-auto mb-3">
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-indigo-300 pl-3 italic text-slate-500 my-2">
              {children}
            </blockquote>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 underline underline-offset-2 hover:text-indigo-700"
            >
              {children}
            </a>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

/* ──────────────────────────────────────────
   MessageBubble
   ────────────────────────────────────────── */

function MessageBubble({
  message,
  onRetry,
}: {
  message: Message;
  onRetry?: () => void;
}) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable — non-critical, fail silently */
    }
  };

  return (
    <div className={cn('flex w-full mb-5 animate-fade-in-up', isUser ? 'justify-end' : 'justify-start')}>
      <div className={cn('flex max-w-[88%] sm:max-w-[80%] gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}>
        <div
          className={cn(
            'flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shadow-lg shadow-indigo-500/20 mt-0.5',
            message.isError && !isUser ? 'bg-slate-200 text-slate-500' : 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white',
          )}
        >
          {isUser ? 'You' : <Sparkles className="w-4 h-4" />}
        </div>

        <div className="min-w-0">
          <div
            className={cn(
              'relative px-5 py-4 rounded-2xl shadow-[0_4px_20px_rgba(79,70,229,0.06)]',
              isUser
                ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-tr-sm'
                : message.isError
                ? 'bg-rose-50 border border-rose-100 rounded-tl-sm'
                : 'bg-white/85 backdrop-blur-md border border-slate-100/80 rounded-tl-sm',
            )}
          >
            {message.isImage && (
              <div className="flex items-center gap-1.5 text-xs font-medium mb-2 opacity-80">
                <ImagePlus className="w-3.5 h-3.5" />
                Photo attached
              </div>
            )}

            {isUser ? (
              <p className="text-[15px] leading-relaxed text-white/95 whitespace-pre-wrap">{message.text}</p>
            ) : message.isError ? (
              <p className="text-[15px] leading-relaxed text-rose-700">{message.text}</p>
            ) : (
              <AnswerMarkdown text={message.text} />
            )}

            <div
              className={cn(
                'flex items-center justify-between gap-3 mt-2.5 pt-2',
                !isUser && !message.isError && 'border-t border-slate-100',
              )}
            >
              <span className={cn('text-[11px] font-medium', isUser ? 'text-indigo-200' : 'text-slate-400')}>
                {message.time}
              </span>
              {!isUser && !message.isError && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" /> Copy
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {message.isError && onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-rose-200 text-rose-600 text-xs font-semibold hover:bg-rose-50 transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────
   TypingIndicator
   ────────────────────────────────────────── */

function TypingIndicator() {
  return (
    <div className="flex w-full mb-5 animate-fade-in-up">
      <div className="flex gap-3">
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Sparkles className="w-4 h-4 text-white animate-pulse" />
        </div>
        <div className="px-5 py-4 rounded-2xl bg-white/85 backdrop-blur-md border border-slate-100/80 rounded-tl-sm shadow-[0_4px_20px_rgba(79,70,229,0.06)]">
          <div className="flex gap-1.5 items-center h-5">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────
   SubjectSelector
   ────────────────────────────────────────── */

function SubjectSelector({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
      {SUBJECTS.map((s) => {
        const active = selected === s.id;
        return (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 flex-shrink-0',
              active
                ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-slate-100/80 text-slate-500 hover:bg-slate-200/80',
            )}
          >
            {s.icon}
            {s.label}
          </button>
        );
      })}
    </div>
  );
}

/* ──────────────────────────────────────────
   DoubtSolver
   ────────────────────────────────────────── */

export default function DoubtSolver() {
  const navigate = useNavigate();

  const [chatHistory, setChatHistory] = useState<Array<{question: string; answer: string; subject: string}>>([]);
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState('general');
  const [showWelcome, setShowWelcome] = useState(true);
  const [welcomeIndex, setWelcomeIndex] = useState(0);
  const [lastFailed, setLastFailed] = useState<{
    id: string;
    text: string;
    subject: string;
    image: File | null;
  } | null>(null);

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
      textareaRef.current.style.height = `${Math.min(120, textareaRef.current.scrollHeight)}px`;
    }
  }, [query]);

  // Fetch chat history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data, error } = await supabase
        .rpc('get_recent_chat_history', { limit_count: 10 });
      if (!error && data) {
        setChatHistory(data.map((h: any) => ({
          question: h.question,
          answer: h.answer,
          subject: h.subject,
        })));
      }
    };
    fetchHistory();
  }, []);


  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, WebP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be under 5MB');
      return;
    }
    setSelectedImage(file);
    setImagePreviewUrl(URL.createObjectURL(file));
    setShowWelcome(false);
  }, []);

  const clearImage = useCallback(() => {
    setSelectedImage(null);
    setImagePreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleQuickPrompt = useCallback((prompt: QuickPrompt) => {
    setQuery(prompt.text);
    setSelectedSubject(prompt.subject);
    setShowWelcome(false);
    textareaRef.current?.focus();
  }, []);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setQuery('');
    clearImage();
    setSelectedSubject('general');
    setLastFailed(null);
    setShowWelcome(true);
  }, [clearImage]);

  const sendRequest = useCallback(async (questionText: string, subject: string, image: File | null) => {
    const token = localStorage.getItem('bt_token') ?? '';

    if (image) {
      const formData = new FormData();
      formData.append('image', image);
      if (questionText) formData.append('question', questionText);
      formData.append('subject', subject);
      return fetch(`${BASE_URL}/api/ai/doubt-image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
    }

    return fetch(`${BASE_URL}/api/ai/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ question: questionText, subject, history: chatHistory.slice(0, 5) }),
    });
  }, []);

  const handleSend = useCallback(async () => {
    if ((!query.trim() && !selectedImage) || isTyping) return;
    setShowWelcome(false);

    const questionText = query.trim();
    const imageToSend = selectedImage;
    const subjectToSend = selectedSubject;

    setMessages((prev) => [
      ...prev,
      {
        id: generateId(),
        role: 'user',
        text: questionText || 'Image question',
        time: formatTime(),
        isImage: !!imageToSend,
      },
    ]);
    setQuery('');
    clearImage();
    setIsTyping(true);
    setLastFailed(null);

    try {
      const res = await sendRequest(questionText, subjectToSend, imageToSend);
      const result = await extractAnswer(res);

      if (!result.ok) {
        const errorId = generateId();
        if (!result.rateLimited) {
          setLastFailed({ id: errorId, text: questionText, subject: subject, image: imageToSend });
        }
        setMessages((prev) => [
          ...prev,
          {
            id: errorId,
            role: 'ai',
            text: result.rateLimited
              ? "You've reached your free plan limit. Upgrade to Pro for unlimited doubts, image solving, and priority support."
              : 'Something went wrong on our end. Please try again.',
            time: formatTime(),
            isError: true,
          },
        ]);
        return;
      }

      setMessages((prev) => [...prev, { id: generateId(), role: 'ai', text: result.text, time: formatTime() }]);

        // Save to chat history
        const { error: saveErr } = await supabase.from('ai_chat_history').insert({
          question: questionText,
          answer: result.text,
          subject: subject,
        });
        if (!saveErr) {
          setChatHistory(prev => [{ question: questionText, answer: result.text, subject: subject || 'general' }, ...prev].slice(0, 10));
        }

    } catch {
      const errorId = generateId();
      setLastFailed({ id: errorId, text: questionText, subject: subject, image: imageToSend });
      setMessages((prev) => [
        ...prev,
        {
          id: errorId,
          role: 'ai',
          text: 'Failed to connect. Please check your connection and try again.',
          time: formatTime(),
          isError: true,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }, [query, selectedImage, selectedSubject, isTyping, clearImage, sendRequest]);

  const handleRetry = useCallback(async () => {
    if (!lastFailed || isTyping) return;
    setIsTyping(true);
    try {
      const res = await sendRequest(lastFailed.text, lastFailed.subject, lastFailed.image);
      const result = await extractAnswer(res);

      if (!result.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: generateId(),
            role: 'ai',
            text: result.rateLimited
              ? "You've reached your free plan limit. Upgrade to Pro for unlimited doubts, image solving, and priority support."
              : 'Still unable to process this. Please try again in a moment.',
            time: formatTime(),
            isError: true,
          },
        ]);
        return;
      } 
      setMessages((prev) => [...prev, { id: generateId(), role: 'ai', text: result.text, time: formatTime() }]);
      setLastFailed(null);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: 'ai',
          text: 'Still unable to connect. Please check your connection and try again.',
          time: formatTime(),
          isError: true,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }, [lastFailed, isTyping, sendRequest]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasContent = query.trim().length > 0 || !!selectedImage;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-violet-50/30 relative overflow-hidden">
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes blobFloat { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(-16px, 20px) scale(1.06); } }
        .animate-fade-in-up { animation: fadeInUp 0.45s ease-out both; }
        .animate-fade-in { animation: fadeIn 0.5s ease-out both; }
        .animate-blob-float { animation: blobFloat 10s ease-in-out infinite; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-200/30 rounded-full blur-3xl animate-blob-float" />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-200/25 rounded-full blur-3xl animate-blob-float"
          style={{ animationDelay: '3s' }}
        />
      </div>
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b border-white/40">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent truncate">
                AI Doubt Solver
              </h1>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Online
                <span className="text-slate-300">·</span>
                <span className="text-indigo-500 font-semibold">MH Board</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={handleNewChat}
              title="New chat"
              className="p-2.5 rounded-xl hover:bg-slate-100/80 transition-colors duration-200 group"
            >
              <Plus className="w-5 h-5 text-slate-500 group-hover:text-indigo-500 transition-colors" />
            </button>
            <button
              onClick={() => navigate('/history')}
              title="History"
              className="p-2.5 rounded-xl hover:bg-slate-100/80 transition-colors duration-200 group"
            >
              <History className="w-5 h-5 text-slate-500 group-hover:text-indigo-500 transition-colors" />
            </button>
            <button
              onClick={() => navigate('/pricing')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 hover:border-amber-300 transition-colors"
            >
              <Crown className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-bold text-amber-700">Pro</span>
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto px-4 pt-6 pb-48">

      {/* Recent Questions History */}
      {chatHistory.length > 0 && (
        <div className="mb-4 animate-fade-in">
          <details className="group">
            <summary className="flex items-center justify-between p-3 rounded-xl bg-white/80 backdrop-blur-md border border-slate-200/60 shadow-sm cursor-pointer list-none">
              <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-500" />
                Recent Questions ({chatHistory.length})
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400 transition-transform group-open:rotate-90" />
            </summary>
            <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
              {chatHistory.map((h, i) => (
                <button
                  key={i}
                  onClick={() => { setQuery(h.question); setSelectedSubject(h.subject || 'general'); }}
                  className="w-full text-left p-3 rounded-lg bg-white/60 hover:bg-indigo-50 border border-slate-100 transition-colors"
                >
                  <p className="text-xs font-medium text-indigo-600 mb-1">{h.subject || 'General'}</p>
                  <p className="text-sm text-slate-700 line-clamp-2">{h.question}</p>
                </button>
              ))}
            </div>
          </details>
        </div>
      )}

        {showWelcome && messages.length === 0 ? (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center pt-10 pb-2">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3 tracking-tight min-h-[2.4em] sm:min-h-[1.2em] flex items-center justify-center">
                <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  {WELCOME_MESSAGES[welcomeIndex]}
                </span>
              </h2>
              <p className="text-slate-500 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
                Step-by-step answers tailored for Maharashtra SSC — marking schemes, common traps, and examiner tips.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {QUICK_PROMPTS.map((prompt, i) => (
                <GlassCard
                  key={prompt.label}
                  onClick={() => handleQuickPrompt(prompt)}
                  className="p-4 animate-fade-in-up"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">{prompt.icon}</div>
                    <span className="text-sm font-bold text-slate-700">{prompt.label}</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{prompt.text}</p>
                  <div className="flex items-center gap-1 mt-2 text-[11px] font-semibold text-indigo-500">
                    Try now <ChevronRight className="w-3 h-3" />
                  </div>
                </GlassCard>
              ))}
            </div>

            <GlassCard
              hover={false}
              className="p-5 bg-gradient-to-br from-indigo-500/[0.04] to-violet-500/[0.04] border-indigo-100"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800 mb-1">Unlock Unlimited Doubts</h3>
                  <p className="text-sm text-slate-500 mb-3">
                    Get examiner-style marking, image solving, and priority support.
                  </p>
                  <button
                    onClick={() => navigate('/pricing')}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    Upgrade to Pro
                  </button>
                </div>
              </div>
            </GlassCard>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                onRetry={msg.id === lastFailed?.id ? handleRetry : undefined}
              />
            ))}
            {isTyping && <TypingIndicator />}
          </>
        )}
        <div ref={messagesEndRef} />
      </main>

      <div
        className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-white via-white/95 to-transparent pt-8 px-4"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="max-w-3xl mx-auto space-y-2.5">
          {selectedImage && imagePreviewUrl && (
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-3 px-3 py-2 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200/60 shadow-lg">
                <img src={imagePreviewUrl} alt="Preview" className="w-11 h-11 rounded-lg object-cover shadow-sm" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate max-w-[160px]">{selectedImage.name}</p>
                  <p className="text-xs text-slate-400">{(selectedImage.size / 1024).toFixed(0)} KB</p>
                </div>
                <button onClick={clearImage} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors" aria-label="Remove image">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>
          )}

          <SubjectSelector selected={selectedSubject} onSelect={setSelectedSubject} />

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl opacity-20 group-focus-within:opacity-40 transition-opacity duration-500 blur-sm" />
            <div className="relative flex items-end gap-2 bg-white/95 backdrop-blur-xl rounded-2xl border border-white/60 shadow-[0_8px_32px_rgba(79,70,229,0.08)] p-2.5">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleImageSelect}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-shrink-0 p-2.5 rounded-xl hover:bg-slate-100/80 transition-colors duration-200 group/btn"
                aria-label="Upload image"
                title="Upload a photo of your question"
              >
                <ImagePlus
                  className={cn(
                    'w-5 h-5 transition-colors',
                    selectedImage ? 'text-indigo-500' : 'text-slate-400 group-hover/btn:text-indigo-500',
                  )}
                />
          {saveStatus && (
            <div className={"text-xs text-center py-1 " + (saveStatus === "Saved!" ? "text-green-600" : "text-red-500")}>
              {saveStatus}
            </div>
          )}

              </button>
              <textarea
                ref={textareaRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask any board exam question…"
                rows={1}
                aria-label="Type your doubt"
                className="flex-1 bg-transparent border-0 resize-none py-2.5 px-2 text-[15px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-0 max-h-[120px]"
              />
              <button
                onClick={handleSend}
                disabled={!hasContent || isTyping}
                className={cn(
                  'flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300',
                  hasContent && !isTyping
                    ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:-translate-y-0.5'
                    : 'bg-slate-100 text-slate-300 cursor-not-allowed',
                )}
              >
                {isTyping ? (
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Ask</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 text-center">Press Enter to send · Shift+Enter for a new line</p>
        </div>
      </div>
    </div>
  );
}

                             
