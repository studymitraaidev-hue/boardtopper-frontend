import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { Button } from '../components/ui/Button';
import { cn } from '../utils/cn';
import { useAuth } from '../context/AuthContext';
import { api, ApiError } from '../utils/api';
import {
  Zap, AlertTriangle, CheckCircle2, BookOpen,
  ArrowRight, Crown, FileText, MessageCircle, Library,
  ChevronRight, X, Clock, Target, Brain, Flame,
  RefreshCw, CheckCheck, Maximize2, Minimize2, ChevronLeft,
  AlertCircle, TrendingUp, Star,
} from 'lucide-react';

interface EmergencyItem {
  title:    string;
  content:  string;
  tag?:     string;
  priority?: 'high' | 'normal';
}

type EmergencyMode = 'notes' | 'doubts' | 'fallback' | 'empty';

interface UserContext {
  examDate:     string | null;
  weakSubjects: string[];
  streakCount:  number;
  targetPercent: number;
  name:         string;
}

interface EmergencyData {
  mode:        EmergencyMode;
  items:       EmergencyItem[];
  userContext: UserContext;
}

type LoadState = 'idle' | 'loading' | 'success' | 'error';

const MODE_META: Record<EmergencyMode, { label: string; description: string; icon: React.ComponentType<{ size?: number; className?: string }>; color: string; bg: string; }> = {
  notes:    { label: 'Your Notes',        description: 'Your most recently edited personal notes.',    icon: FileText,      color: 'text-blue-600',    bg: 'bg-blue-50' },
  doubts:   { label: 'Your Doubts',       description: 'Your most recent doubt-solver questions.',     icon: MessageCircle, color: 'text-violet-600',  bg: 'bg-violet-50' },
  fallback: { label: 'Syllabus Chapters', description: 'Key chapters from the syllabus to focus on.',  icon: Library,       color: 'text-emerald-600', bg: 'bg-emerald-50' },
  empty:    { label: 'No Data',           description: 'Nothing found. Create notes or ask doubts.',   icon: BookOpen,      color: 'text-slate-500',   bg: 'bg-slate-50' },
};

function useCountdown(examDate: string | null) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  useEffect(() => {
    if (!examDate) return;
    const target = new Date(examDate).getTime();
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) { setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
      setTimeLeft({
        days:    Math.floor(diff / 86400000),
        hours:   Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [examDate]);
  return timeLeft;
}

function UpgradeModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl z-10 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500" />
        <div className="p-6 space-y-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-2.5 rounded-2xl shadow-lg">
                <Crown size={22} className="text-white" />
              </div>
              <div>
                <p className="text-base font-black text-slate-900">Unlock Topper Pro</p>
                <p className="text-xs text-slate-400 mt-0.5">Emergency Mode + all premium features</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-100 transition-colors text-slate-400"><X size={18} /></button>
          </div>
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-white">Rs.99<span className="text-sm font-normal text-slate-400">/mo</span></p>
              <p className="text-xs text-slate-400 mt-0.5">Cancel anytime</p>
            </div>
            <span className="text-xs font-black text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">MOST POPULAR</span>
          </div>
          <div className="space-y-2.5">
            {[
              { icon: Zap,           text: 'Emergency Mode with Focus + Countdown' },
              { icon: AlertCircle,   text: 'Weak subject prioritization'           },
              { icon: MessageCircle, text: 'Unlimited AI doubts'                   },
              { icon: Crown,         text: 'Priority AI response quality'          },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="p-1.5 bg-emerald-50 rounded-lg shrink-0"><Icon size={13} className="text-emerald-600" /></div>
                <p className="text-sm text-slate-700">{text}</p>
              </div>
            ))}
          </div>
          <Button variant="gold" fullWidth className="gap-2 justify-center font-black" onClick={() => navigate('/pricing')}>
            <Crown size={14} /> Upgrade to Topper Pro - Rs.99/mo
          </Button>
          <Link to="/pricing" className="block text-xs text-center text-slate-400 hover:text-slate-600 transition-colors">See full plan details</Link>
        </div>
      </div>
    </div>
  );
}

function ProGate({ onUpgradeClick }: { onUpgradeClick: () => void }) {
  return (
    <AppLayout>
      <main className="flex-1 min-w-0 overflow-y-auto h-screen">
        <header className="sticky top-0 z-20 bg-gradient-to-r from-red-600 to-orange-500 px-4 sm:px-6 h-14 sm:h-16 flex items-center shadow-lg shadow-red-200">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-1.5 rounded-lg"><Zap size={18} className="text-white fill-white" /></div>
            <h1 className="text-sm sm:text-base font-black text-white">Emergency Mode</h1>
          </div>
        </header>
        <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center">
          <div className="relative bg-white rounded-3xl border border-slate-100 shadow-2xl p-8 max-w-sm w-full space-y-6 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-orange-50/50 pointer-events-none" />
            <div className="relative">
              <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-5 rounded-3xl inline-flex mx-auto shadow-xl shadow-amber-200">
                <Crown size={36} className="text-white" />
              </div>
            </div>
            <div className="relative space-y-2">
              <h2 className="text-2xl font-black text-slate-900">Pro Feature</h2>
              <p className="text-sm text-slate-500 leading-relaxed">Emergency Mode is exclusive to Topper Pro - your personal exam survival toolkit.</p>
            </div>
            <div className="relative space-y-2 text-left bg-slate-50 rounded-2xl p-4">
              {['Exam countdown timer', 'Weak subject items shown first', 'Focus Mode - one card at a time', 'Track what you have revised'].map(f => (
                <div key={f} className="flex items-center gap-2.5 text-sm text-slate-700">
                  <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />{f}
                </div>
              ))}
            </div>
            <div className="relative">
              <Button variant="gold" fullWidth className="gap-2 justify-center font-black py-3 text-base shadow-lg shadow-amber-200" onClick={onUpgradeClick}>
                <Crown size={16} /> Upgrade to Topper Pro - Rs.99/mo
              </Button>
              <Link to="/pricing" className="block text-xs text-slate-400 hover:text-slate-600 transition-colors mt-3">See full plan details</Link>
            </div>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}

export const EmergencyModePage = () => {
  const { isPro } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [loadState, setLoadState]   = useState<LoadState>('idle');
  const [data, setData]             = useState<EmergencyData | null>(null);
  const [errorMsg, setErrorMsg]     = useState<string>('');
  const [checked, setChecked]       = useState<Set<number>>(new Set());
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const countdown = useCountdown(data?.userContext?.examDate ?? null);

  if (!isPro) return (
    <>
      <ProGate onUpgradeClick={() => setShowUpgradeModal(true)} />
      {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} />}
    </>
  );

  const handleStart = async () => {
    setLoadState('loading');
    setData(null);
    setErrorMsg('');
    setChecked(new Set());
    setFocusIndex(null);
    setExpandedIndex(null);
    try {
      const result = await api.get<EmergencyData>('/api/emergency');
      if (!result || typeof result.mode !== 'string' || !Array.isArray(result.items)) {
        setErrorMsg('Invalid response from server. Please try again.');
        setLoadState('error');
        return;
      }
      const safeItems: EmergencyItem[] = result.items.slice(0, 5).map(item => ({
        title:    ((item?.title ?? '').trim()) || 'Untitled',
        content:  item?.content ?? '',
        tag:      item?.tag,
        priority: item?.priority,
      }));
      setData({ mode: result.mode, items: safeItems, userContext: result.userContext });
      setLoadState('success');
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? (err.message || 'Request failed.') : 'Something went wrong.');
      setLoadState('error');
    }
  };

  const toggleChecked = (i: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setChecked(prev => { const next = new Set(prev); next.has(i) ? next.delete(i) : next.add(i); return next; });
  };

  const meta       = data ? (MODE_META[data.mode] ?? MODE_META.empty) : null;
  const ModeIcon   = meta?.icon ?? BookOpen;
  const totalItems = data?.items.length ?? 0;
  const doneCount  = checked.size;
  const progress   = totalItems > 0 ? Math.round((doneCount / totalItems) * 100) : 0;
  const allDone    = totalItems > 0 && doneCount === totalItems;
  const highCount  = data?.items.filter(i => i.priority === 'high').length ?? 0;

  const gradientForMode = (mode: EmergencyMode) =>
    mode === 'notes' ? 'from-blue-500 to-indigo-600' :
    mode === 'doubts' ? 'from-violet-500 to-purple-600' :
    'from-emerald-500 to-teal-600';

  // Focus Mode
  if (focusIndex !== null && data && data.items[focusIndex]) {
    const item   = data.items[focusIndex];
    const isDone = checked.has(focusIndex);
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="bg-red-500/20 p-1.5 rounded-lg"><Zap size={16} className="text-red-400 fill-red-400" /></div>
            <span className="text-xs font-black text-white/60 uppercase tracking-widest">Focus Mode</span>
            {item.priority === 'high' && (
              <span className="text-[10px] font-black text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">WEAK SUBJECT</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40">{focusIndex + 1} / {data.items.length}</span>
            <button onClick={() => setFocusIndex(null)} className="p-1.5 bg-white/10 rounded-lg text-white/60 hover:bg-white/20 transition-colors"><Minimize2 size={16} /></button>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-lg space-y-5">
            {item.tag && <span className="text-xs font-black text-white/40 uppercase tracking-wider bg-white/5 px-3 py-1 rounded-full">{item.tag}</span>}
            <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black text-white bg-gradient-to-br shadow-lg', gradientForMode(data.mode))}>{focusIndex + 1}</div>
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">{item.title}</h2>
            {item.content && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <p className="text-base text-white/70 leading-relaxed whitespace-pre-wrap">{item.content}</p>
              </div>
            )}
            <button
              onClick={e => toggleChecked(focusIndex, e)}
              className={cn('flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm transition-all', isDone ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20')}
            >
              <CheckCheck size={16} />{isDone ? 'Revised!' : 'Mark as Revised'}
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between px-5 py-4 border-t border-white/10">
          <button onClick={() => setFocusIndex(Math.max(0, focusIndex - 1))} disabled={focusIndex === 0} className="flex items-center gap-2 px-4 py-2.5 bg-white/10 rounded-xl text-white/70 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-bold">
            <ChevronLeft size={16} /> Prev
          </button>
          <div className="flex gap-1.5">
            {data.items.map((_, i) => (
              <button key={i} onClick={() => setFocusIndex(i)} className={cn('w-2 h-2 rounded-full transition-all', i === focusIndex ? 'bg-red-400 w-5' : checked.has(i) ? 'bg-emerald-500' : 'bg-white/20')} />
            ))}
          </div>
          <button onClick={() => focusIndex < data.items.length - 1 ? setFocusIndex(focusIndex + 1) : setFocusIndex(null)} className="flex items-center gap-2 px-4 py-2.5 bg-white/10 rounded-xl text-white/70 hover:bg-white/20 transition-all text-sm font-bold">
            {focusIndex < data.items.length - 1 ? <><span>Next</span><ChevronRight size={16} /></> : <><span>Done</span><CheckCheck size={16} /></>}
          </button>
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      <main className="flex-1 min-w-0 overflow-y-auto h-screen">
        <header className="sticky top-0 z-20 bg-gradient-to-r from-red-600 via-red-500 to-orange-500 px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between shadow-xl shadow-red-200/60">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm p-1.5 rounded-lg border border-white/20"><Zap size={18} className="text-white fill-white" /></div>
            <div>
              <h1 className="text-sm sm:text-base font-black text-white tracking-tight">Emergency Mode</h1>
              <p className="text-[9px] text-red-100 uppercase tracking-widest font-bold hidden sm:block">Exam Survival · Real Data</p>
            </div>
          </div>
          {loadState === 'success' && data && (
            <div className="flex items-center gap-2">
              {data.items.length > 0 && (
                <button onClick={() => setFocusIndex(0)} className="flex items-center gap-1.5 text-xs font-black text-white bg-white/20 px-3 py-1.5 rounded-full border border-white/30 hover:bg-white/30 transition-colors">
                  <Maximize2 size={11} /> Focus
                </button>
              )}
              <button onClick={() => { setLoadState('idle'); setData(null); setChecked(new Set()); }} className="p-1.5 bg-white/20 rounded-lg border border-white/20 text-white hover:bg-white/30 transition-colors">
                <RefreshCw size={14} />
              </button>
            </div>
          )}
        </header>

        <div className="p-4 sm:p-6 space-y-4 max-w-2xl mx-auto pb-24">

          {/* Countdown - shown after data loads */}
          {countdown && (
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-4 flex items-center gap-4">
              <div className="bg-red-500/20 p-2 rounded-xl shrink-0"><Clock size={18} className="text-red-400" /></div>
              <div className="flex-1">
                <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Exam Countdown</p>
                <div className="flex items-center gap-3">
                  {[{ val: countdown.days, label: 'd' }, { val: countdown.hours, label: 'h' }, { val: countdown.minutes, label: 'm' }, { val: countdown.seconds, label: 's' }].map(({ val, label }) => (
                    <div key={label} className="text-center">
                      <p className="text-xl font-black text-white tabular-nums">{String(val).padStart(2, '0')}</p>
                      <p className="text-[10px] text-slate-500 font-bold">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
              {countdown.days === 0 && <div className="flex items-center gap-1 bg-red-500/20 border border-red-500/30 rounded-full px-2.5 py-1"><div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" /><span className="text-[10px] font-black text-red-300">TODAY</span></div>}
            </div>
          )}

          {/* Weak subjects alert */}
          {loadState === 'success' && data && data.userContext.weakSubjects.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-amber-700 mb-1">Weak subjects prioritised first</p>
                <div className="flex flex-wrap gap-1.5">
                  {data.userContext.weakSubjects.map(s => (
                    <span key={s} className="text-[10px] font-bold text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
              {highCount > 0 && <span className="text-xs font-black text-amber-600 shrink-0">{highCount} priority</span>}
            </div>
          )}

          {/* User stats row */}
          {loadState === 'success' && data && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Flame,       label: 'Streak',  value: `${data.userContext.streakCount}d`,       color: 'text-orange-500', bg: 'bg-orange-50' },
                { icon: TrendingUp,  label: 'Target',  value: `${data.userContext.targetPercent}%`,     color: 'text-blue-600',   bg: 'bg-blue-50' },
                { icon: Star,        label: 'Progress', value: `${progress}%`,                           color: 'text-emerald-600', bg: 'bg-emerald-50' },
              ].map(({ icon: Icon, label, value, color, bg }) => (
                <div key={label} className={cn('rounded-2xl p-3 text-center space-y-1', bg)}>
                  <Icon size={16} className={cn('mx-auto', color)} />
                  <p className="text-xs font-black text-slate-700">{value}</p>
                  <p className="text-[10px] text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Idle / Error */}
          {(loadState === 'idle' || loadState === 'error') && (
            <div className="relative bg-gradient-to-br from-slate-950 via-red-950 to-slate-900 rounded-3xl overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 p-6 sm:p-8 space-y-6">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-red-500/20 border border-red-500/30 rounded-full px-3 py-1">
                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-red-300 uppercase tracking-widest">Exam Mode Active</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                    Exam in<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">a few hours?</span>
                  </h2>
                  <p className="text-sm text-slate-400 max-w-sm leading-relaxed">Emergency Mode fetches your actual study data, prioritises weak subjects, and gives you a focused revision plan.</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: FileText,    label: 'Your Notes',  sub: 'Latest 5' },
                    { icon: Brain,       label: 'AI Doubts',   sub: 'Recent Q&A' },
                    { icon: Target,      label: 'Syllabus',    sub: 'Weak first' },
                  ].map(({ icon: Icon, label, sub }) => (
                    <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center space-y-1.5">
                      <div className="bg-white/10 p-1.5 rounded-lg inline-flex"><Icon size={14} className="text-white/70" /></div>
                      <p className="text-xs font-bold text-white">{label}</p>
                      <p className="text-[10px] text-slate-500">{sub}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <button onClick={handleStart} className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-red-900/50 transition-all active:scale-95 text-base">
                    <Zap size={18} className="fill-white" /> Start Emergency Mode <ArrowRight size={16} />
                  </button>
                  {loadState === 'error' && errorMsg && (
                    <div className="bg-red-900/40 border border-red-500/40 rounded-xl p-3 flex items-start gap-2.5">
                      <AlertTriangle size={15} className="text-red-400 mt-0.5 shrink-0" />
                      <p className="text-xs text-red-200">{errorMsg}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Loading */}
          {loadState === 'loading' && (
            <div className="bg-white border border-slate-100 rounded-3xl p-12 flex flex-col items-center gap-5 shadow-sm">
              <div className="relative">
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center"><Zap size={28} className="text-red-500 fill-red-500" /></div>
                <div className="absolute -inset-1 border-2 border-red-500/30 rounded-2xl animate-ping" />
              </div>
              <div className="text-center space-y-1">
                <p className="font-black text-slate-800">Fetching your content...</p>
                <p className="text-xs text-slate-400">Prioritising weak subjects</p>
              </div>
              <div className="flex gap-1.5">
                {[0,1,2].map(i => <div key={i} className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
              </div>
            </div>
          )}

          {/* Success */}
          {loadState === 'success' && data && (
            <div className="space-y-4">
              {meta && (
                <div className={cn('rounded-2xl p-4 flex items-center gap-4', meta.bg)}>
                  <div className={cn('p-2.5 rounded-xl', meta.bg)}><ModeIcon size={18} className={meta.color} /></div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-xs font-black uppercase tracking-wider mb-0.5', meta.color)}>Source: {meta.label}</p>
                    <p className="text-sm text-slate-600">{meta.description}</p>
                  </div>
                </div>
              )}

              {(data.mode === 'empty' || data.items.length === 0) ? (
                <div className="bg-white border border-slate-100 rounded-3xl p-10 flex flex-col items-center gap-4 text-center shadow-sm">
                  <BookOpen size={32} className="text-slate-300" />
                  <div>
                    <p className="font-bold text-slate-700 mb-1">Nothing to show yet</p>
                    <p className="text-sm text-slate-500">Create notes or ask doubts first, then come back.</p>
                  </div>
                  <div className="flex gap-3 flex-wrap justify-center">
                    <Link to="/my-notes"><Button variant="secondary" className="gap-1.5 text-sm"><FileText size={14} /> Write Notes</Button></Link>
                    <Link to="/doubt-solver"><Button variant="secondary" className="gap-1.5 text-sm"><MessageCircle size={14} /> Ask a Doubt</Button></Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Flame size={15} className="text-red-500" />
                        <span className="font-extrabold text-slate-900 text-sm">{doneCount}/{totalItems} revised</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {allDone && <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">All done!</span>}
                        <button onClick={() => setFocusIndex(0)} className="flex items-center gap-1.5 text-xs font-black text-red-600 bg-red-50 px-3 py-1.5 rounded-xl hover:bg-red-100 transition-colors">
                          <Maximize2 size={12} /> Focus Mode
                        </button>
                      </div>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={cn('h-full rounded-full transition-all duration-500', allDone ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-orange-500')} style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-xs text-slate-400">Tap item to expand · Check off when revised · Focus Mode for distraction-free review</p>
                  </div>

                  {data.items.map((item, i) => {
                    const isDone = checked.has(i);
                    const isExpanded = expandedIndex === i;
                    const isHigh = item.priority === 'high';
                    return (
                      <div key={i} onClick={() => setExpandedIndex(isExpanded ? null : i)} className={cn('bg-white border rounded-2xl overflow-hidden transition-all shadow-sm cursor-pointer select-none', isDone ? 'border-emerald-200 bg-emerald-50/30' : isHigh ? 'border-amber-200' : isExpanded ? 'border-red-200 shadow-md' : 'border-slate-100 hover:border-slate-200')}>
                        <div className="p-4 sm:p-5 flex items-start gap-3">
                          <div className={cn('shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-white shadow-sm bg-gradient-to-br', isDone ? 'from-emerald-400 to-emerald-500' : gradientForMode(data.mode))}>
                            {isDone ? <CheckCheck size={14} /> : i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                              {isHigh && <span className="text-[9px] font-black text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full uppercase tracking-wider">Weak Subject</span>}
                              {item.tag && !isHigh && <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-full">{item.tag}</span>}
                            </div>
                            <p className={cn('font-extrabold text-sm leading-snug break-words', isDone ? 'text-slate-400 line-through' : 'text-slate-900')}>{item.title}</p>
                            {item.content && !isExpanded && <p className="text-xs text-slate-400 mt-1 line-clamp-1">{item.content}</p>}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button onClick={e => toggleChecked(i, e)} className={cn('p-1.5 rounded-lg transition-all', isDone ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' : 'bg-slate-100 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600')}>
                              <CheckCheck size={14} />
                            </button>
                            <ChevronRight size={15} className={cn('text-slate-300 transition-transform', isExpanded && 'rotate-90')} />
                          </div>
                        </div>
                        {isExpanded && item.content && (
                          <div className="px-4 sm:px-5 pb-4 pt-0">
                            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap break-words">{item.content}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-extrabold text-white mb-1 text-sm">{allDone ? `All revised, ${data.userContext.name.split(' ')[0]}. You are ready!` : `You have got this, ${data.userContext.name.split(' ')[0]}.`}</h3>
                  <p className="text-xs text-slate-400">Need more help? Ask a doubt or run a quick mock test.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Link to="/doubt-solver" className="flex-1 sm:flex-none">
                    <Button variant="secondary" fullWidth className="gap-1.5 text-xs justify-center bg-blue-600 hover:bg-blue-700 text-white border-0">Ask Doubt <ArrowRight size={12} /></Button>
                  </Link>
                  <Link to="/simulation" className="flex-1 sm:flex-none">
                    <Button variant="secondary" fullWidth className="gap-1.5 text-xs justify-center bg-white/10 hover:bg-white/20 text-white border border-white/20">Mock Test <ChevronRight size={12} /></Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </AppLayout>
  );
};

export default EmergencyModePage;
