import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, X, Sparkles, History, Crown, Loader2, ImagePlus, Sigma, Atom, BookText, Landmark } from 'lucide-react';
import { cn } from '../utils/cn';

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  time: string;
  isImage?: boolean;
}

interface QuickPrompt {
  icon: React.ReactNode;
  label: string;
  text: string;
  subject: string;
}

const QUICK_PROMPTS: QuickPrompt[] = [
  { icon: <Sigma className="w-5 h-5" />, label: 'Mathematics', text: 'If the sum of first n terms of an AP is 3n² + 5n, find the 20th term.', subject: 'mathematics' },
  { icon: <Atom className="w-5 h-5" />, label: 'Science', text: 'Explain the process of photosynthesis with a labeled diagram.', subject: 'science' },
  { icon: <BookText className="w-5 h-5" />, label: 'English', text: 'Write a letter to the editor about traffic problems in your city.', subject: 'english' },
  { icon: <Landmark className="w-5 h-5" />, label: 'History', text: 'Describe the causes and effects of the French Revolution.', subject: 'history' },
];

function generateId(): string { return Math.random().toString(36).substring(2, 9); }
function formatTime(): string { return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }); }

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  return (
    <div className={cn('flex w-full mb-4', isUser ? 'justify-end' : 'justify-start')}>
      <div className={cn('flex max-w-[80%] gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}>
        <div className={cn('flex-shrink-0 w-8 h-8 flex items-center justify-center text-xs font-semibold', isUser ? 'bg-slate-900 text-white' : 'bg-indigo-600 text-white')}>
          {isUser ? 'You' : <Sparkles className="w-4 h-4" />}
        </div>
        <div className={cn('px-4 py-3 text-sm leading-relaxed', isUser ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-800')}>
          <div className="whitespace-pre-wrap">{message.text}</div>
          <div className={cn('text-[10px] mt-1.5 font-medium tracking-wide uppercase', isUser ? 'text-slate-400' : 'text-slate-400')}>{message.time}</div>
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex w-full mb-4">
      <div className="flex gap-3">
        <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white animate-pulse" />
        </div>
        <div className="px-4 py-3 bg-white border border-slate-200">
          <div className="flex gap-1.5 items-center h-5">
            <div className="w-1.5 h-1.5 bg-slate-400 animate-pulse" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 bg-slate-400 animate-pulse" style={{ animationDelay: '200ms' }} />
            <div className="w-1.5 h-1.5 bg-slate-400 animate-pulse" style={{ animationDelay: '400ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DoubtSolver() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [dailyCount, setDailyCount] = useState(0);
  const [activeSubject, setActiveSubject] = useState('general');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [query]);

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Please select an image file (JPG, PNG, WebP)'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('Image must be under 5MB'); return; }
    setSelectedImage(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  }, []);

  const clearImage = useCallback(() => {
    setSelectedImage(null);
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImagePreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [imagePreviewUrl]);

  const handleQuickPrompt = useCallback((prompt: QuickPrompt) => {
    setQuery(prompt.text);
    setActiveSubject(prompt.subject);
    textareaRef.current?.focus();
  }, []);

  const handleSend = useCallback(async () => {
    if ((!query.trim() && !selectedImage) || isTyping) return;
    const token = localStorage.getItem('bt_token') ?? '';
    const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';
    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      text: query.trim() || 'Image question',
      time: formatTime(),
      isImage: !!selectedImage,
    };
    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setIsTyping(true);
    try {
      let res: Response;
      if (selectedImage) {
        const formData = new FormData();
        formData.append('image', selectedImage);
        if (query.trim()) formData.append('question', query.trim());
        formData.append('subject', activeSubject);
        res = await fetch(`${BASE_URL}/api/ai/doubt-image`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        clearImage();
      } else {
        res = await fetch(`${BASE_URL}/api/ai/ask`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ question: query.trim(), subject: activeSubject }),
        });
      }
      const body = await res.json();
      const answerText = body.data?.answer ?? body.error ?? 'Could not process your question. Please try again.';
      setMessages((prev) => [...prev, { id: generateId(), role: 'ai', text: answerText, time: formatTime() }]);
      setDailyCount((prev) => prev + 1);
    } catch {
      setMessages((prev) => [...prev, {
        id: generateId(),
        role: 'ai',
        text: 'Failed to connect. Please check your connection and try again.',
        time: formatTime(),
      }]);
    } finally {
      setIsTyping(false);
    }
  }, [query, selectedImage, isTyping, activeSubject, clearImage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 tracking-tight">AI Doubt Solver</h1>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">Maharashtra SSC</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/history')} className="p-2 hover:bg-slate-100 transition-colors">
              <History className="w-4 h-4 text-slate-600" />
            </button>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100">
              <Crown className="w-3 h-3 text-amber-600" />
              <span className="text-[11px] font-bold text-slate-700">{dailyCount}/5</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 pt-8 pb-32">
        {messages.length === 0 && (
          <div className="space-y-8">
            <div className="text-center space-y-3">
              <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Board Exam Precision</p>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight leading-tight">
                What would you like<br />to master today?
              </h2>
              <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                Step-by-step answers tailored for Maharashtra SSC. Marking schemes, common traps, and examiner tips.
              </p>
            </div>

            <div className="space-y-2">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt.label}
                  onClick={() => handleQuickPrompt(prompt)}
                  className="w-full flex items-start gap-4 p-4 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-slate-50 transition-all group text-left"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    {prompt.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">{prompt.label}</span>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                    </div>
                    <p className="text-sm text-slate-600 leading-snug">{prompt.text}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="p-5 bg-slate-50 border border-slate-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-indigo-600 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-slate-900 mb-1">Unlock Unlimited Doubts</h3>
                  <p className="text-xs text-slate-500 mb-3 leading-relaxed">Examiner-style marking, image solving, and priority support.</p>
                  <button onClick={() => navigate('/pricing')} className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors">
                    Upgrade to Pro
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-1">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200">
        <div className="max-w-2xl mx-auto px-4 py-3">
          {selectedImage && imagePreviewUrl && (
            <div className="flex items-center gap-3 px-3 py-2 mb-2 bg-slate-50 border border-slate-200">
              <img src={imagePreviewUrl} alt="Preview" className="w-10 h-10 object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-700 truncate">{selectedImage.name}</p>
                <p className="text-[10px] text-slate-400">{(selectedImage.size / 1024).toFixed(0)} KB</p>
              </div>
              <button onClick={clearImage} className="p-1 hover:bg-slate-200 transition-colors">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          )}

          <div className="flex items-end gap-2">
            <button onClick={() => fileInputRef.current?.click()} className="flex-shrink-0 p-2.5 hover:bg-slate-100 transition-colors">
              <ImagePlus className={cn("w-5 h-5", selectedImage ? "text-indigo-600" : "text-slate-400")} />
            </button>
            <textarea
              ref={textareaRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask any board exam question..."
              rows={1}
              className="flex-1 bg-transparent border-0 resize-none py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 max-h-[120px]"
            />
            <button
              onClick={handleSend}
              disabled={(!query.trim() && !selectedImage) || isTyping}
              className={cn(
                "flex-shrink-0 p-2.5 transition-all",
                (query.trim() || selectedImage) && !isTyping
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed",
              )}
            >
              {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageSelect} className="hidden" />
          <p className="text-center text-[10px] text-slate-400 mt-1.5 font-medium">Press Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  );
}
