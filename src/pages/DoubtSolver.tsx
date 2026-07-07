import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, X, Sparkles, History, Crown, Loader2, ImagePlus } from 'lucide-react';
import { cn } from '../utils/cn';

interface Message { id: string; role: 'user' | 'ai'; text: string; time: string; }

export default function DoubtSolver() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);
  useEffect(() => { if (taRef.current) { taRef.current.style.height = 'auto'; taRef.current.style.height = Math.min(taRef.current.scrollHeight, 120) + 'px'; } }, [query]);

  const clearImg = useCallback(() => { setSelectedImage(null); if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl); setImagePreviewUrl(null); if (fileRef.current) fileRef.current.value = ''; }, [imagePreviewUrl]);

  const onSend = useCallback(async () => {
    if ((!query.trim() && !selectedImage) || isTyping) return;
    const token = localStorage.getItem('bt_token') || '';
    const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const um: Message = { id: Math.random().toString(36).substring(2, 9), role: 'user', text: query.trim() || 'Image question', time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) };
    setMessages(p => [...p, um]); setQuery(''); setIsTyping(true);
    try {
      let r: Response;
      if (selectedImage) {
        const d = new FormData(); d.append('image', selectedImage); if (query.trim()) d.append('question', query.trim()); d.append('subject', 'general');
        r = await fetch(`${BASE_URL}/api/ai/doubt-image`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: d }); clearImg();
      } else {
        r = await fetch(`${BASE_URL}/api/ai/ask`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ question: query.trim(), subject: 'general' }) });
      }
      const b = await r.json(); const a = b.data?.answer || b.error || 'Could not process. Try again.'; setMessages(p => [...p, { id: Math.random().toString(36).substring(2, 9), role: 'ai', text: a, time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) }]); setCount(c => c + 1);
    } catch { setMessages(p => [...p, { id: Math.random().toString(36).substring(2, 9), role: 'ai', text: 'Failed to connect.', time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) }]); }
    finally { setIsTyping(false); }
  }, [query, selectedImage, isTyping, clearImg]);

  const onKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); } };

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 flex items-center justify-center"><Sparkles className="w-4 h-4 text-white" /></div>
            <div><h1 className="text-sm font-bold text-slate-900">AI Doubt Solver</h1><p className="text-[10px] text-slate-500 uppercase">Maharashtra SSC</p></div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/history')} className="p-2 hover:bg-slate-100"><History className="w-4 h-4 text-slate-600" /></button>
            <div className="px-2.5 py-1 bg-slate-100"><Crown className="w-3 h-3 text-amber-600 inline" /><span className="text-[11px] font-bold text-slate-700 ml-1">{count}/5</span></div>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-2xl mx-auto px-4 pt-8 pb-32">
        {messages.length === 0 && (
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Board Exam Precision</p>
              <h2 className="text-3xl font-bold text-slate-900">What would you like to master today?</h2>
              <p className="text-sm text-slate-500">Step-by-step answers for Maharashtra SSC.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {['Mathematics', 'Science', 'English', 'History'].map((s, i) => (
                <button key={s} onClick={() => { setQuery(`Explain ${s.toLowerCase()} concept`); taRef.current?.focus(); }} className="p-4 border border-slate-200 hover:border-indigo-300 hover:bg-slate-50 text-left">
                  <p className="text-xs font-bold text-slate-900 uppercase">{s}</p>
                  <p className="text-[10px] text-slate-500 mt-1">Try now &rarr;</p>
                </button>
              ))}
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 text-left">
              <h3 className="text-sm font-bold text-slate-900">Unlock Unlimited Doubts</h3>
              <p className="text-xs text-slate-500 mt-1">Examiner-style marking, image solving.</p>
              <button onClick={() => navigate('/pricing')} className="mt-3 px-4 py-2 bg-indigo-600 text-white text-xs font-bold">Upgrade to Pro</button>
            </div>
          </div>
        )}
        <div className="space-y-1">
          {messages.map(m => (
            <div key={m.id} className={cn('flex mb-4', m.role === 'user' ? 'justify-end' : 'justify-start')}>
              <div className={cn('max-w-[80%] px-4 py-3 text-sm', m.role === 'user' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-800')}>
                <div className="whitespace-pre-wrap">{m.text}</div>
                <div className="text-[10px] mt-1 text-slate-400">{m.time}</div>
              </div>
            </div>
          ))}
          {isTyping && <div className="flex mb-4"><div className="px-4 py-3 bg-white border border-slate-200"><div className="flex gap-1.5"><div className="w-1.5 h-1.5 bg-slate-400 animate-pulse"/><div className="w-1.5 h-1.5 bg-slate-400 animate-pulse" style={{animationDelay:'200ms'}}/><div className="w-1.5 h-1.5 bg-slate-400 animate-pulse" style={{animationDelay:'400ms'}}/></div></div></div>}
          <div ref={endRef} />
        </div>
      </main>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200">
        <div className="max-w-2xl mx-auto px-4 py-3">
          {selectedImage && imagePreviewUrl && (
            <div className="flex items-center gap-3 px-3 py-2 mb-2 bg-slate-50 border border-slate-200">
              <img src={imagePreviewUrl} alt="Preview" className="w-10 h-10 object-cover" />
              <div className="flex-1 min-w-0"><p className="text-xs font-medium truncate">{selectedImage.name}</p><p className="text-[10px] text-slate-400">{Math.round(selectedImage.size/1024)} KB</p></div>
              <button onClick={clearImg} className="p-1 hover:bg-slate-200"><X className="w-4 h-4 text-slate-500"/></button>
            </div>
          )}
          <div className="flex items-end gap-2">
            <button onClick={() => fileRef.current?.click()} className="p-2.5 hover:bg-slate-100"><ImagePlus className={cn('w-5 h-5', selectedImage ? 'text-indigo-600' : 'text-slate-400')} /></button>
            <textarea ref={taRef} value={query} onChange={e => setQuery(e.target.value)} onKeyDown={onKey} placeholder="Ask any board exam question..." rows={1} className="flex-1 bg-transparent border-0 resize-none py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none max-h-[120px]" />
            <button onClick={onSend} disabled={(!query.trim() && !selectedImage) || isTyping} className={cn('p-2.5', (query.trim() || selectedImage) && !isTyping ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 cursor-not-allowed')}>{isTyping ? <Loader2 className="w-5 h-5 animate-spin"/> : <Send className="w-5 h-5"/>}</button>
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={e => { const f = e.target.files?.[0]; if (!f) return; if (!f.type.startsWith('image/')) { alert('JPG/PNG/WebP only'); return; } if (f.size > 5*1024*1024) { alert('Under 5MB'); return; } setSelectedImage(f); setImagePreviewUrl(URL.createObjectURL(f)); if (fileRef.current) fileRef.current.value = ''; }} className="hidden" />
          <p className="text-center text-[10px] text-slate-400 mt-1.5">Press Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  );
                             }
