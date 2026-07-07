import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send, X, Sparkles, History, Crown, Loader2, ImagePlus, ChevronRight,
  Flame, Zap, Star, Target, MessageCircle, ThumbsUp, Copy, RotateCcw,
  Sigma, Atom, BookText, Landmark
} from 'lucide-react';

interface Message { id: string; role: 'user' | 'ai'; text: string; time: string; isImage?: boolean; }
interface QuickPrompt { icon: React.ReactNode; label: string; text: string; subject: string; }
interface LikelyQuestion { subject: string; question: string; probability: string; icon: React.ReactNode; }

const QUICK_PROMPTS: QuickPrompt[] = [
  { icon: <Sigma className="w-5 h-5" />, label: 'Mathematics', text: 'If the sum of first n terms of an AP is 3n2+5n, find the 20th term.', subject: 'mathematics' },
  { icon: <Atom className="w-5 h-5" />, label: 'Science', text: 'Explain the process of photosynthesis with a labeled diagram.', subject: 'science' },
  { icon: <BookText className="w-5 h-5" />, label: 'English', text: 'Write a letter to the editor about traffic problems in your city.', subject: 'english' },
  { icon: <Landmark className="w-5 h-5" />, label: 'History', text: 'Describe the causes and effects of the French Revolution.', subject: 'history' },
];

const LIKELY_QUESTIONS: LikelyQuestion[] = [
  { subject: 'Mathematics', question: 'Prove that root 5 is irrational using the contradiction method.', probability: '92%', icon: <Target className="w-4 h-4" /> },
  { subject: 'Science', question: 'Draw the human heart diagram and label its 4 chambers.', probability: '88%', icon: <Flame className="w-4 h-4" /> },
  { subject: 'English', question: 'Write a formal letter to the Principal requesting leave.', probability: '85%', icon: <Star className="w-4 h-4" /> },
];

const ROTATOR_LINES = [
  'What will you score today?',
  'Best likely questions inside',
  'Board exam precision',
  'Step-by-step mastery',
  'AI that thinks like your examiner',
];

function generateId() { return Math.random().toString(36).substring(2, 9); }
function formatTime() { return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }); }

function ParticleBackground() {
  const particles = Array.from({ length: 8 }, (_, i) => ({
    id: i, left: `${8 + i * 11}%`, delay: `${i * 1.4}s`, duration: `${7 + i * 0.6}s`, size: `${4 + (i % 3) * 2}px`,
  }));
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <div key={p.id} className="particle" style={{ left: p.left, bottom: '-10px', width: p.size, height: p.size, animationDelay: p.delay, animationDuration: p.duration, background: p.id % 2 === 0 ? 'rgba(79,70,229,0.25)' : 'rgba(124,58,237,0.25)' }} />
      ))}
    </div>
  );
}

function TextRotator() {
  return (
    <div className="text-rotator-wrap mx-auto max-w-md mb-6">
      <div className="text-rotator-track">
        {ROTATOR_LINES.map((line, i) => <div key={i} className="text-rotator-item">{line}</div>)}
        <div className="text-rotator-item">{ROTATOR_LINES[0]}</div>
      </div>
    </div>
  );
      }
function LikelyQuestions({ onSelect }: { onSelect: (q: string) => void }) {
  return (
    <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.4s', opacity: 1 }}>
      <div className="flex items-center gap-2 mb-4 px-1">
        <Flame className="w-5 h-5 text-orange-500" />
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Best Likely This Year</h3>
        <span className="ml-auto text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">AI Predicted</span>
      </div>
      <div className="space-y-3">
        {LIKELY_QUESTIONS.map((q, i) => (
          <button key={i} onClick={() => onSelect(q.question)} className="w-full text-left group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-100 card-3d animate-fade-in-up" style={{ animationDelay: `${0.5 + i * 0.15}s` }}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform duration-300">{q.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">{q.subject}</span>
                  <span className="text-xs font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded">{q.probability}</span>
                </div>
                <p className="text-sm text-slate-700 font-medium leading-relaxed group-hover:text-slate-900 transition-colors">{q.question}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all flex-shrink-0 mt-2" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function SubjectCard({ prompt, index, onClick }: { prompt: QuickPrompt; index: number; onClick: () => void }) {
  const gradients = ['from-blue-500 to-indigo-600', 'from-emerald-500 to-teal-600', 'from-amber-500 to-orange-600', 'from-rose-500 to-pink-600'];
  const shadows = ['shadow-blue-200', 'shadow-emerald-200', 'shadow-amber-200', 'shadow-rose-200'];
  return (
    <button onClick={onClick} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-100 card-3d animate-fade-in-up text-left w-full" style={{ animationDelay: `${0.2 + index * 0.1}s`, opacity: 1 }}>
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${gradients[index]} flex items-center justify-center text-white shadow-lg ${shadows[index]} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>{prompt.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">{prompt.label}</span>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
          </div>
          <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{prompt.text}</p>
        </div>
      </div>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-violet-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </button>
  );
}

function renderMarkdown(text: string): React.ReactNode {
  const html = text
    .replace(/^### (.*$)/gim, '<h3 class="text-base font-bold text-slate-900 mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold text-slate-900 mt-5 mb-2">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-xl font-black text-slate-900 mt-6 mb-3">$1</h1>')
    .replace(/^\\* (.*$)/gim, '<li class="flex items-start gap-2"><span class="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0"></span><span>$1</span></li>')
    .replace(/^\\d+\\. (.*$)/gim, '<li class="flex items-start gap-2"><span class="text-xs font-bold text-indigo-600 mt-0.5 flex-shrink-0 w-5">$&</span><span>$1</span></li>')
    .replace(/\\*\\*(.*?)\\*\\*/g, '<strong class="font-bold text-slate-900">$1</strong>')
    .replace(/^(?!<[hl]|<li)(.*$)/gim, '<p class="text-sm text-slate-700 leading-relaxed mb-2">$1</p>');
  return <div className="space-y-1" dangerouslySetInnerHTML={{ __html: html }} />;
}
function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const handleCopy = () => { navigator.clipboard.writeText(message.text); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div className={`flex w-full mb-4 animate-fade-in-up ${isUser ? 'justify-end' : 'justify-start'}`} style={{ opacity: 1 }}>
      <div className={`flex gap-3 max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-slate-200 text-slate-700' : 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-200'}`}>
          {isUser ? <MessageCircle className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
        </div>
        <div className="space-y-1">
          <div className={`relative px-4 py-3 rounded-2xl ${isUser ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm'}`}>
            {message.isImage && <div className="mb-2 text-xs opacity-70 font-medium">Image attached</div>}
            <div className="text-sm leading-relaxed">{renderMarkdown(message.text)}</div>
            {!isUser && (
              <div className="flex items-center gap-3 mt-3 pt-2 border-t border-slate-100">
                <button onClick={handleCopy} className="flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-600 transition-colors">{copied ? <Zap className="w-3 h-3" /> : <Copy className="w-3 h-3" />}{copied ? 'Copied!' : 'Copy'}</button>
                <button className="flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-600 transition-colors"><ThumbsUp className="w-3 h-3" />Helpful</button>
                <button className="flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-600 transition-colors"><RotateCcw className="w-3 h-3" />Retry</button>
              </div>
            )}
          </div>
          <div className={`text-[10px] text-slate-400 ${isUser ? 'text-right' : 'text-left'}`}>{message.time}</div>
        </div>
      </div>
    </div>
  );
}

function TypingWave() {
  return (
    <div className="flex w-full mb-4 animate-fade-in-up" style={{ opacity: 1 }}>
      <div className="flex gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
          <Sparkles className="w-4 h-4 animate-pulse" />
        </div>
        <div className="px-4 py-3 bg-white border border-slate-200 rounded-2xl rounded-bl-sm shadow-sm">
          <div className="flex gap-1.5 items-center h-5">
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-wave-dot" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-wave-dot" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-wave-dot" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DoubtSolver() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [dailyCount, setDailyCount] = useState(0);
  const [activeSubject, setActiveSubject] = useState('general');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('bt_doubt_count');
    const savedDate = localStorage.getItem('bt_doubt_date');
    const today = new Date().toDateString();
    if (saved && savedDate === today) { setDailyCount(parseInt(saved, 10)); }
    else { localStorage.setItem('bt_doubt_date', today); localStorage.setItem('bt_doubt_count', '0'); }
  }, []);

  const clearImage = useCallback(() => { setSelectedImage(null); setImagePreviewUrl(''); if (fileInputRef.current) fileInputRef.current.value = ''; }, []);
  const handleQuickPrompt = useCallback((prompt: QuickPrompt) => { setQuery(prompt.text); setActiveSubject(prompt.subject); textareaRef.current?.focus(); }, []);
  const handleLikelySelect = useCallback((question: string) => { setQuery(question); textareaRef.current?.focus(); }, []);

  const handleSend = useCallback(async () => {
    if ((!query.trim() && !selectedImage) || isTyping) return;
    if (dailyCount >= 5) { alert('Daily limit reached (5/5). Upgrade to Pro for unlimited doubts.'); return; }
    const token = localStorage.getItem('bt_token') ?? '';
    const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';
    const userMsg: Message = { id: generateId(), role: 'user', text: query.trim() || 'Image question', time: formatTime(), isImage: !!selectedImage };
    setMessages((prev) => [...prev, userMsg]); setQuery(''); setIsTyping(true);
    try {
      let res: Response;
      if (selectedImage) {
        const formData = new FormData(); formData.append('image', selectedImage);
        if (query.trim()) formData.append('question', query.trim());
        formData.append('subject', activeSubject);
        res = await fetch(`${BASE_URL}/api/ai/doubt-image`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
        clearImage();
      } else {
        res = await fetch(`${BASE_URL}/api/ai/ask`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ question: query.trim(), subject: activeSubject }) });
      }
      const body = await res.json();
      const answerText = body.data?.answer ?? body.error ?? 'Could not process your question. Please try again.';
      setMessages((prev) => [...prev, { id: generateId(), role: 'ai', text: answerText, time: formatTime() }]);
      setDailyCount((prev) => { const next = prev + 1; localStorage.setItem('bt_doubt_count', next.toString()); return next; });
    } catch {
      setMessages((prev) => [...prev, { id: generateId(), role: 'ai', text: 'Failed to connect. Check your internet connection.', time: formatTime() }]);
    } finally { setIsTyping(false); }
  }, [query, selectedImage, isTyping, activeSubject, dailyCount, clearImage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }, [handleSend]);
    return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
      <ParticleBackground />
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200"><Sparkles className="w-4 h-4" /></div>
            <div><h1 className="text-sm font-bold text-slate-900 leading-tight">AI Doubt Solver</h1><p className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">Maharashtra SSC</p></div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/history')} className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><History className="w-4 h-4 text-slate-600" /></button>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg"><Crown className="w-3 h-3 text-amber-500" /><span className="text-[11px] font-bold text-slate-700">{dailyCount}/5</span></div>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 pt-8 pb-32 relative z-10">
        {messages.length === 0 ? (
          <div className="space-y-8">
            <div className="text-center space-y-3 animate-fade-in-up" style={{ opacity: 1 }}>
              <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Board Exam Precision</p>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">What would you like<br/>to master today?</h2>
              <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">Step-by-step answers tailored for Maharashtra SSC. Marking schemes, common traps, and examiner tips.</p>
            </div>
            <TextRotator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {QUICK_PROMPTS.map((prompt, i) => <SubjectCard key={prompt.label} prompt={prompt} index={i} onClick={() => handleQuickPrompt(prompt)} />)}
            </div>
            <LikelyQuestions onSelect={handleLikelySelect} />
            <div className="animate-fade-in-up" style={{ animationDelay: '0.8s', opacity: 1 }}>
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white shadow-xl shadow-indigo-200">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-10 -mb-10 blur-xl" />
                <div className="relative flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center"><Crown className="w-6 h-6 text-amber-300" /></div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">Unlock Unlimited Doubts</h3>
                    <p className="text-sm text-indigo-100 mb-4 leading-relaxed">Get examiner-style marking, image solving, and priority support.</p>
                    <button className="px-5 py-2.5 bg-white text-indigo-700 font-bold text-sm rounded-xl hover:bg-indigo-50 transition-colors shadow-lg">Upgrade to Pro</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-1 pt-4">{messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)} {isTyping && <TypingWave />}</div>
        )}
      </main>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-slate-200">
        <div className="max-w-2xl mx-auto px-4 py-3">
          {selectedImage && imagePreviewUrl && (
            <div className="flex items-center gap-3 px-3 py-2 mb-2 bg-slate-50 rounded-xl border border-slate-200">
              <img src={imagePreviewUrl} alt="Preview" className="w-10 h-10 object-cover rounded-lg" />
              <div className="flex-1 min-w-0"><p className="text-xs font-medium text-slate-700 truncate">{selectedImage.name}</p><p className="text-[10px] text-slate-400">{(selectedImage.size / 1024).toFixed(0)} KB</p></div>
              <button onClick={clearImage} className="p-1 hover:bg-slate-200 rounded transition-colors"><X className="w-4 h-4 text-slate-500" /></button>
            </div>
          )}
          <div className="flex items-end gap-2">
            <button onClick={() => fileInputRef.current?.click()} className="flex-shrink-0 p-3 hover:bg-slate-100 rounded-xl transition-colors"><ImagePlus className={`w-5 h-5 ${selectedImage ? 'text-indigo-600' : 'text-slate-400'}`} /></button>
            <textarea ref={textareaRef} value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={handleKeyDown} placeholder="Ask any board exam question..." rows={1} className="flex-1 bg-transparent border-0 resize-none py-3 px-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 max-h-[120px]" />
            <button onClick={handleSend} disabled={(!query.trim() && !selectedImage) || isTyping} className={`flex-shrink-0 p-3 rounded-xl transition-all ${(query.trim() || selectedImage) && !isTyping ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>{isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}</button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; if (!f.type.startsWith('image/')) { alert('JPG/PNG/WebP only'); return; } if (f.size > 5 * 1024 * 1024) { alert('Under 5MB'); return; } setSelectedImage(f); setImagePreviewUrl(URL.createObjectURL(f)); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="hidden" />
          <p className="text-center text-[10px] text-slate-400 mt-1.5">Press Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  );
                                                                                                                                                             }
