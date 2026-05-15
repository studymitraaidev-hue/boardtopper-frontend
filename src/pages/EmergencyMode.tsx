import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { Button } from '../components/ui/Button';
import { cn } from '../utils/cn';
import { useAuth } from '../context/AuthContext';
import { api, ApiError } from '../utils/api';
import {
  Zap, AlertTriangle, CheckCircle2, BookOpen, ArrowRight, Crown,
  FileText, MessageCircle, Library, ChevronRight, X, Clock, Target,
  Brain, Flame, RefreshCw, CheckCheck, Maximize2, Minimize2,
  ChevronLeft, AlertCircle, TrendingUp, Star, Sparkles,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface EmergencyItem {
  title:     string;
  content:   string;
  tag?:      string;
  priority?: 'high' | 'normal';
}

interface AiTip {
  subject: string;
  points:  string[];
}

type EmergencyMode = 'notes' | 'doubts' | 'fallback' | 'empty';
type LoadState     = 'idle' | 'loading' | 'success' | 'error';

interface ExamContext {
  examType: 'unit_test' | 'half_yearly' | 'board' | 'other';
  chapters: string;
  hoursLeft: number;
}

interface UserContext {
  examDate:      string | null;
  weakSubjects:  string[];
  streakCount:   number;
  targetPercent: number;
  name:          string;
}

interface EmergencyData {
  mode:        EmergencyMode;
  items:       EmergencyItem[];
  aiTips:      AiTip[];
  userContext: UserContext;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MODE_META: Record<EmergencyMode, {
  label: string; description: string;
  icon:  React.ComponentType<{ size?: number; className?: string }>;
  color: string; bg: string;
}> = {
  notes:    { label: 'Your Notes',        description: 'Your most recently edited personal notes.',   icon: FileText,      color: 'text-blue-600',    bg: 'bg-blue-50'    },
  doubts:   { label: 'Your Doubts',       description: 'Your recent academic doubt-solver questions.', icon: MessageCircle, color: 'text-violet-600',  bg: 'bg-violet-50'  },
  fallback: { label: 'Syllabus Chapters', description: 'Key chapters from the syllabus to focus on.',  icon: Library,       color: 'text-emerald-600', bg: 'bg-emerald-50' },
  empty:    { label: 'No Data',           description: 'Nothing found. Create notes or ask doubts.',   icon: BookOpen,      color: 'text-slate-500',   bg: 'bg-slate-50'   },
};

const GRADIENT: Record<EmergencyMode, string> = {
  notes:    'from-blue-500 to-indigo-600',
  doubts:   'from-violet-500 to-purple-600',
  fallback: 'from-emerald-500 to-teal-600',
  empty:    'from-slate-400 to-slate-500',
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useCountdown(examDate: string | null) {
  const [left, setLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    if (!examDate) return;
    const target = new Date(examDate).getTime();
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) { setLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
      setLeft({
        days:    Math.floor(diff / 86400000),
        hours:   Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000)  / 60000),
        seconds: Math.floor((diff % 60000)    / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [examDate]);

  return left;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function UpgradeModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl z-10 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
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
            <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-white">
                Rs.99<span className="text-sm font-normal text-slate-400">/mo</span>
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Cancel anytime</p>
            </div>
            <span className="text-xs font-black text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">
              MOST POPULAR
            </span>
          </div>

          <div className="space-y-2.5">
            {[
              { icon: Zap,          text: 'Emergency Mode with Focus + Countdown'    },
              { icon: Sparkles,     text: 'AI revision tips for your weak subjects'   },
              { icon: AlertCircle,  text: 'Weak subject prioritisation'               },
              { icon: MessageCircle,text: 'Unlimited AI doubts'                       },
              { icon: Crown,        text: 'Priority AI response quality'              },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="p-1.5 bg-emerald-50 rounded-lg shrink-0">
                  <Icon size={13} className="text-emerald-600" />
                </div>
                <p className="text-sm text-slate-700">{text}</p>
              </div>
            ))}
          </div>

          <Button variant="gold" fullWidth className="gap-2 justify-center font-black" onClick={() => navigate('/pricing')}>
            <Crown size={14} /> Upgrade to Topper Pro - Rs.99/mo
          </Button>
          <Link to="/pricing" className="block text-xs text-center text-slate-400 hover:text-slate-600 transition-colors">
            See full plan details
          </Link>
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
            <div className="bg-white/20 p-1.5 rounded-lg">
              <Zap size={18} className="text-white fill-white" />
            </div>
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
              <p className="text-sm text-slate-500 leading-relaxed">
                Emergency Mode is exclusive to Topper Pro - your personal exam survival toolkit.
              </p>
            </div>
            <div className="relative space-y-2 text-left bg-slate-50 rounded-2xl p-4">
              {[
                'AI generates revision tips for your weak subjects',
                'Weak subject items shown first',
                'Exam countdown timer',
                'Focus Mode - one card at a time',
                'Only academic doubts - no off-topic noise',
              ].map(f => (
                <div key={f} className="flex items-center gap-2.5 text-sm text-slate-700">
                  <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />{f}
                </div>
              ))}
            </div>
            <div className="relative">
              <Button
                variant="gold" fullWidth
                className="gap-2 justify-center font-black py-3 text-base shadow-lg shadow-amber-200"
                onClick={onUpgradeClick}
              >
                <Crown size={16} /> Upgrade to Topper Pro - Rs.99/mo
              </Button>
              <Link to="/pricing" className="block text-xs text-slate-400 hover:text-slate-600 transition-colors mt-3">
                See full plan details
              </Link>
            </div>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}

// ─── AI Tips Card ─────────────────────────────────────────────────────────────

function AiTipsSection({ tips }: { tips: AiTip[] }) {
  const [expanded, setExpanded] = useState<string | null>(tips[0]?.subject ?? null);
  if (tips.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-indigo-950 to-slate-900 rounded-2xl overflow-hidden shadow-xl">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
        <div className="bg-indigo-500/20 p-2 rounded-xl">
          <Sparkles size={16} className="text-indigo-400" />
        </div>
        <div>
          <p className="text-sm font-black text-white">AI Revision Tips</p>
          <p className="text-[10px] text-indigo-300/60 uppercase tracking-wider">Generated for your weak subjects</p>
        </div>
      </div>

      <div className="divide-y divide-white/5">
        {tips.map(tip => {
          const isOpen = expanded === tip.subject;
          return (
            <div key={tip.subject}>
              <button
                onClick={() => setExpanded(isOpen ? null : tip.subject)}
                className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/5 transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] font-black text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full uppercase">
                    Weak
                  </span>
                  <span className="text-sm font-bold text-white">{tip.subject}</span>
                </div>
                <ChevronRight size={15} className={cn('text-white/30 transition-transform shrink-0', isOpen && 'rotate-90')} />
              </button>

              {isOpen && (
                <div className="px-5 pb-4 space-y-2.5">
                  {tip.points.map((point, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="shrink-0 w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mt-0.5">
                        <span className="text-[9px] font-black text-indigo-400">{i + 1}</span>
                      </div>
                      <p className="text-sm text-white/70 leading-relaxed">{point}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


// ─── Exam Context Sheet ───────────────────────────────────────────────────────
// helper outside component to avoid template-literal issues
function examTypeCls(current: string, val: string) {
  return current === val
    ? 'px-3 py-2.5 rounded-xl border text-sm font-bold text-left transition-all bg-red-500/20 border-red-500/50 text-red-300'
    : 'px-3 py-2.5 rounded-xl border text-sm font-bold text-left transition-all bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500';
}
function hoursCls(current: number, val: number) {
  return current === val
    ? 'px-3 py-1.5 rounded-xl border text-xs font-black transition-all bg-red-500/20 border-red-500/50 text-red-300'
    : 'px-3 py-1.5 rounded-xl border text-xs font-black transition-all bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500';
}

function ExamContextSheet({ ctx, setCtx, onStart, onClose }: {
  ctx: ExamContext;
  setCtx: (c: ExamContext) => void;
  onStart: () => void;
  onClose: () => void;
}) {
  const EXAM_TYPES = [
    { value: 'unit_test'   as const, label: 'Unit Test',   emoji: '📝' },
    { value: 'half_yearly' as const, label: 'Half Yearly', emoji: '📅' },
    { value: 'board'       as const, label: 'Board Exam',  emoji: '🎯' },
    { value: 'other'       as const, label: 'Other',       emoji: '📖' },
  ];
  const HOURS = [2, 6, 12, 24, 48];
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative bg-slate-900 border border-slate-700 w-full max-w-lg rounded-t-3xl z-10 p-6 space-y-5" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto" />
        <div>
          <h2 className="text-lg font-black text-white">Tell me about your exam</h2>
          <p className="text-xs text-slate-400 mt-0.5">I will personalise your emergency plan</p>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-black text-slate-400 uppercase tracking-wider">What type of exam?</p>
          <div className="grid grid-cols-2 gap-2">
            {EXAM_TYPES.map(t => (
              <button key={t.value} onClick={() => setCtx({...ctx, examType: t.value})}
                className={examTypeCls(ctx.examType, t.value)}>
                <span className="mr-1.5">{t.emoji}</span>{t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Which chapters? <span className="text-slate-600 normal-case font-normal">(optional)</span></p>
          <input value={ctx.chapters} onChange={e => setCtx({...ctx, chapters: e.target.value})}
            placeholder="e.g. Algebra, Heredity, Civics Ch.3"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-red-500/50"
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-black text-slate-400 uppercase tracking-wider">How much time left?</p>
          <div className="flex gap-2 flex-wrap">
            {HOURS.map(h => (
              <button key={h} onClick={() => setCtx({...ctx, hoursLeft: h})}
                className={hoursCls(ctx.hoursLeft, h)}>
                {h < 24 ? h + 'h' : (h/24) + 'd'}
              </button>
            ))}
          </div>
        </div>
        <button onClick={onStart} className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 text-base shadow-lg transition-all">
          <Zap size={18} className="fill-white" /> Generate My Emergency Plan
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export const EmergencyModePage = () => {
  const { isPro } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [loadState, setLoadState]     = useState<LoadState>('idle');
  const [data, setData]               = useState<EmergencyData | null>(null);
  const [errorMsg, setErrorMsg]       = useState('');
  const [checked, setChecked]         = useState<Set<number>>(new Set());
  const [focusIndex, setFocusIndex]   = useState<number | null>(null);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [showContext, setShowContext]   = useState(false);
  const [examContext, setExamContext]   = useState<ExamContext>({
    examType: 'board', chapters: '', hoursLeft: 12,
  });

  const countdown = useCountdown(data?.userContext?.examDate ?? null);

  if (!isPro) return (
    <>
      <ProGate onUpgradeClick={() => setShowUpgradeModal(true)} />
      {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} />}
      {showContext && <ExamContextSheet ctx={examContext} setCtx={setExamContext} onStart={() => handleStart(examContext)} onClose={() => setShowContext(false)} />}
    </>
  );

  const handleStart = async (ctx: ExamContext = examContext) => {
    setShowContext(false);
    setLoadState('loading');
    setData(null);
    setErrorMsg('');
    setChecked(new Set());
    setFocusIndex(null);
    setExpandedIdx(null);
    try {
      const params = `?examType=${ctx.examType}&chapters=${encodeURIComponent(ctx.chapters)}&hoursLeft=${ctx.hoursLeft}`;
      const result = await api.get<EmergencyData>(`/api/emergency${params}`);
      if (!result || typeof result.mode !== 'string' || !Array.isArray(result.items)) {
        setErrorMsg('Invalid response from server. Please try again.');
        setLoadState('error');
        return;
      }
      setData({
        mode:        result.mode,
        items:       result.items.slice(0, 5).map(item => ({
          title:    (item?.title ?? '').trim() || 'Untitled',
          content:  item?.content ?? '',
          tag:      item?.tag,
          priority: item?.priority,
        })),
        aiTips:      Array.isArray(result.aiTips) ? result.aiTips : [],
        userContext: result.userContext,
      });
      setLoadState('success');
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? (err.message || 'Request failed.') : 'Something went wrong.');
      setLoadState('error');
    }
  };

  const toggleChecked = (i: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setChecked(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const reset = () => { setLoadState('idle'); setData(null); setChecked(new Set()); };

  const meta       = data ? (MODE_META[data.mode] ?? MODE_META.empty) : null;
  const ModeIcon   = meta?.icon ?? BookOpen;
  const totalItems = data?.items.length ?? 0;
  const doneCount  = checked.size;
  const progress   = totalItems > 0 ? Math.round((doneCount / totalItems) * 100) : 0;
  const allDone    = totalItems > 0 && doneCount === totalItems;
  const highCount  = data?.items.filter(i => i.priority === 'high').length ?? 0;
  const firstName  = data?.userContext.name.split(' ')[0] ?? 'Topper';

  // ── Focus Mode overlay ────────────────────────────────────────────────────

  if (focusIndex !== null && data && data.items[focusIndex]) {
    const item   = data.items[focusIndex];
    const isDone = checked.has(focusIndex);
    const grad   = GRADIENT[data.mode];

    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
        {/* Focus header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="bg-red-500/20 p-1.5 rounded-lg">
              <Zap size={16} className="text-red-400 fill-red-400" />
            </div>
            <span className="text-xs font-black text-white/60 uppercase tracking-widest">Focus Mode</span>
            {item.priority === 'high' && (
              <span className="text-[10px] font-black text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
                WEAK SUBJECT
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40">{focusIndex + 1} / {data.items.length}</span>
            <button
              onClick={() => setFocusIndex(null)}
              className="p-1.5 bg-white/10 rounded-lg text-white/60 hover:bg-white/20 transition-colors"
            >
              <Minimize2 size={16} />
            </button>
          </div>
        </div>

        {/* Focus content */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 overflow-y-auto">
          <div className="w-full max-w-lg space-y-5">
            {item.tag && (
              <span className="text-xs font-black text-white/40 uppercase tracking-wider bg-white/5 px-3 py-1 rounded-full">
                {item.tag}
              </span>
            )}
            <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black text-white bg-gradient-to-br shadow-lg', grad)}>
              {focusIndex + 1}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">{item.title}</h2>
            {item.content && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <p className="text-base text-white/70 leading-relaxed whitespace-pre-wrap">{item.content}</p>
              </div>
            )}
            <button
              onClick={e => toggleChecked(focusIndex, e)}
              className={cn(
                'flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm transition-all',
                isDone ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
              )}
            >
              <CheckCheck size={16} />
              {isDone ? 'Revised!' : 'Mark as Revised'}
            </button>
          </div>
        </div>

        {/* Focus navigation */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-white/10">
          <button
            onClick={() => setFocusIndex(Math.max(0, focusIndex - 1))}
            disabled={focusIndex === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 rounded-xl text-white/70 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-bold"
          >
            <ChevronLeft size={16} /> Prev
          </button>
          <div className="flex gap-1.5">
            {data.items.map((_, i) => (
              <button
                key={i}
                onClick={() => setFocusIndex(i)}
                className={cn('h-2 rounded-full transition-all', i === focusIndex ? 'bg-red-400 w-5' : checked.has(i) ? 'bg-emerald-500 w-2' : 'bg-white/20 w-2')}
              />
            ))}
          </div>
          <button
            onClick={() => focusIndex < data.items.length - 1 ? setFocusIndex(focusIndex + 1) : setFocusIndex(null)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 rounded-xl text-white/70 hover:bg-white/20 transition-all text-sm font-bold"
          >
            {focusIndex < data.items.length - 1
              ? <><span>Next</span><ChevronRight size={16} /></>
              : <><span>Done</span><CheckCheck size={16} /></>
            }
          </button>
        </div>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────

  return (
    <AppLayout>
      <main className="flex-1 min-w-0 overflow-y-auto h-screen">

        {/* Header */}
        <header className="sticky top-0 z-20 bg-gradient-to-r from-red-600 via-red-500 to-orange-500 px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between shadow-xl shadow-red-200/60">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm p-1.5 rounded-lg border border-white/20">
              <Zap size={18} className="text-white fill-white" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black text-white tracking-tight">Emergency Mode</h1>
              <p className="text-[9px] text-red-100 uppercase tracking-widest font-bold hidden sm:block">
                Exam Survival · Real Data · AI Tips
              </p>
            </div>
          </div>
          {loadState === 'success' && data && (
            <div className="flex items-center gap-2">
              {data.items.length > 0 && (
                <button
                  onClick={() => setFocusIndex(0)}
                  className="flex items-center gap-1.5 text-xs font-black text-white bg-white/20 px-3 py-1.5 rounded-full border border-white/30 hover:bg-white/30 transition-colors"
                >
                  <Maximize2 size={11} /> Focus
                </button>
              )}
              <button
                onClick={reset}
                className="p-1.5 bg-white/20 rounded-lg border border-white/20 text-white hover:bg-white/30 transition-colors"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          )}
        </header>

        <div className="p-4 sm:p-6 space-y-4 max-w-2xl mx-auto pb-24">

          {/* Exam countdown */}
          {countdown && (
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-4 flex items-center gap-4">
              <div className="bg-red-500/20 p-2 rounded-xl shrink-0">
                <Clock size={18} className="text-red-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Exam Countdown</p>
                <div className="flex items-center gap-3">
                  {[
                    { val: countdown.days,    label: 'd' },
                    { val: countdown.hours,   label: 'h' },
                    { val: countdown.minutes, label: 'm' },
                    { val: countdown.seconds, label: 's' },
                  ].map(({ val, label }) => (
                    <div key={label} className="text-center">
                      <p className="text-xl font-black text-white tabular-nums">{String(val).padStart(2, '0')}</p>
                      <p className="text-[10px] text-slate-500 font-bold">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
              {countdown.days === 0 && (
                <div className="flex items-center gap-1 bg-red-500/20 border border-red-500/30 rounded-full px-2.5 py-1">
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-red-300">TODAY</span>
                </div>
              )}
            </div>
          )}

          {/* Weak subjects alert */}
          {loadState === 'success' && data && data.userContext.weakSubjects.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-amber-700 mb-1.5">Weak subjects prioritised first</p>
                <div className="flex flex-wrap gap-1.5">
                  {data.userContext.weakSubjects.map(s => (
                    <span key={s} className="text-[10px] font-bold text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              {highCount > 0 && (
                <span className="text-xs font-black text-amber-600 shrink-0">{highCount} priority</span>
              )}
            </div>
          )}

          {/* Stats row */}
          {loadState === 'success' && data && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Flame,      label: 'Streak',   value: `${data.userContext.streakCount}d`,   color: 'text-orange-500', bg: 'bg-orange-50'  },
                { icon: TrendingUp, label: 'Target',   value: `${data.userContext.targetPercent}%`, color: 'text-blue-600',   bg: 'bg-blue-50'    },
                { icon: Star,       label: 'Revised',  value: `${progress}%`,                       color: 'text-emerald-600',bg: 'bg-emerald-50' },
              ].map(({ icon: Icon, label, value, color, bg }) => (
                <div key={label} className={cn('rounded-2xl p-3 text-center space-y-1', bg)}>
                  <Icon size={16} className={cn('mx-auto', color)} />
                  <p className="text-xs font-black text-slate-700">{value}</p>
                  <p className="text-[10px] text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Idle / Error state */}
          {(loadState === 'idle' || loadState === 'error') && (
            <div className="relative bg-gradient-to-br from-slate-950 via-red-950 to-slate-900 rounded-3xl overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 p-6 sm:p-8 space-y-6">
                <div className="flex items-center gap-1.5 bg-red-500/20 border border-red-500/30 rounded-full px-3 py-1 w-fit">
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-red-300 uppercase tracking-widest">Exam Mode Active</span>
                </div>

                <div className="space-y-3">
                  <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                    Exam in<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                      a few hours?
                    </span>
                  </h2>
                  <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
                    Emergency Mode fetches your actual study data, filters academic doubts only, prioritises weak subjects, and generates AI revision tips — in one tap.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: FileText,    label: 'Your Notes',  sub: 'Weak first'  },
                    { icon: Brain,       label: 'AI Doubts',   sub: 'Academic only' },
                    { icon: Sparkles,    label: 'AI Tips',     sub: 'Per subject' },
                  ].map(({ icon: Icon, label, sub }) => (
                    <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center space-y-1.5">
                      <div className="bg-white/10 p-1.5 rounded-lg inline-flex">
                        <Icon size={14} className="text-white/70" />
                      </div>
                      <p className="text-xs font-bold text-white">{label}</p>
                      <p className="text-[10px] text-slate-500">{sub}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <button onClick={() => setShowContext(true)} className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-red-900/50 transition-all active:scale-95 text-base"><Zap size={18} className="fill-white" />Start Emergency Mode<ArrowRight size={16} /></button>

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

          {/* Loading state */}
          {loadState === 'loading' && (
            <div className="bg-white border border-slate-100 rounded-3xl p-12 flex flex-col items-center gap-5 shadow-sm">
              <div className="relative">
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center">
                  <Zap size={28} className="text-red-500 fill-red-500" />
                </div>
                <div className="absolute -inset-1 border-2 border-red-500/30 rounded-2xl animate-ping" />
              </div>
              <div className="text-center space-y-1">
                <p className="font-black text-slate-800">Fetching your content...</p>
                <p className="text-xs text-slate-400">Filtering academic doubts · Generating AI tips</p>
              </div>
              <div className="flex gap-1.5">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}

          {/* Success state */}
          {loadState === 'success' && data && (
            <div className="space-y-4">

              {/* Source badge */}
              {meta && (
                <div className={cn('rounded-2xl p-4 flex items-center gap-4', meta.bg)}>
                  <div className={cn('p-2.5 rounded-xl', meta.bg)}>
                    <ModeIcon size={18} className={meta.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-xs font-black uppercase tracking-wider mb-0.5', meta.color)}>
                      Source: {meta.label}
                    </p>
                    <p className="text-sm text-slate-600">{meta.description}</p>
                  </div>
                </div>
              )}

              {/* AI Tips */}
              {data.aiTips.length > 0 && <AiTipsSection tips={data.aiTips} />}

              {/* Empty state */}
              {(data.mode === 'empty' || data.items.length === 0) ? (
                <div className="bg-white border border-slate-100 rounded-3xl p-10 flex flex-col items-center gap-4 text-center shadow-sm">
                  <BookOpen size={32} className="text-slate-300" />
                  <div>
                    <p className="font-bold text-slate-700 mb-1">Nothing to show yet</p>
                    <p className="text-sm text-slate-500">Create notes or ask doubts first, then come back.</p>
                  </div>
                  <div className="flex gap-3 flex-wrap justify-center">
                    <Link to="/my-notes">
                      <Button variant="secondary" className="gap-1.5 text-sm">
                        <FileText size={14} /> Write Notes
                      </Button>
                    </Link>
                    <Link to="/doubt-solver">
                      <Button variant="secondary" className="gap-1.5 text-sm">
                        <MessageCircle size={14} /> Ask a Doubt
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">

                  {/* Progress tracker */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Flame size={15} className="text-red-500" />
                        <span className="font-extrabold text-slate-900 text-sm">
                          {doneCount}/{totalItems} revised
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {allDone && (
                          <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            All done!
                          </span>
                        )}
                        <button
                          onClick={() => setFocusIndex(0)}
                          className="flex items-center gap-1.5 text-xs font-black text-red-600 bg-red-50 px-3 py-1.5 rounded-xl hover:bg-red-100 transition-colors"
                        >
                          <Maximize2 size={12} /> Focus Mode
                        </button>
                      </div>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all duration-500', allDone ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-orange-500')}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400">
                      Tap to expand · Check off when revised · Focus Mode for distraction-free review
                    </p>
                  </div>

                  {/* Item list */}
                  {data.items.map((item, i) => {
                    const isDone     = checked.has(i);
                    const isExpanded = expandedIdx === i;
                    const isHigh     = item.priority === 'high';

                    return (
                      <div
                        key={i}
                        onClick={() => setExpandedIdx(isExpanded ? null : i)}
                        className={cn(
                          'bg-white border rounded-2xl overflow-hidden transition-all shadow-sm cursor-pointer select-none',
                          isDone   ? 'border-emerald-200 bg-emerald-50/30' :
                          isHigh   ? 'border-amber-200' :
                          isExpanded ? 'border-red-200 shadow-md' :
                          'border-slate-100 hover:border-slate-200'
                        )}
                      >
                        <div className="p-4 sm:p-5 flex items-start gap-3">
                          <div className={cn(
                            'shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-white shadow-sm bg-gradient-to-br',
                            isDone ? 'from-emerald-400 to-emerald-500' : GRADIENT[data.mode]
                          )}>
                            {isDone ? <CheckCheck size={14} /> : i + 1}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap mb-1">
                              {isHigh && (
                                <span className="text-[9px] font-black text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                  Weak Subject
                                </span>
                              )}
                              {item.tag && !isHigh && (
                                <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-full">
                                  {item.tag}
                                </span>
                              )}
                            </div>
                            <p className={cn('font-extrabold text-sm leading-snug break-words', isDone ? 'text-slate-400 line-through' : 'text-slate-900')}>
                              {item.title}
                            </p>
                            {item.content && !isExpanded && (
                              <p className="text-xs text-slate-400 mt-1 line-clamp-1">{item.content}</p>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={e => toggleChecked(i, e)}
                              className={cn(
                                'p-1.5 rounded-lg transition-all',
                                isDone
                                  ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                                  : 'bg-slate-100 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600'
                              )}
                            >
                              <CheckCheck size={14} />
                            </button>
                            <ChevronRight size={15} className={cn('text-slate-300 transition-transform', isExpanded && 'rotate-90')} />
                          </div>
                        </div>

                        {isExpanded && item.content && (
                          <div className="px-4 sm:px-5 pb-4">
                            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap break-words">
                                {item.content}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Footer CTA */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-extrabold text-white mb-1 text-sm">
                    {allDone ? `All revised, ${firstName}. You are ready!` : `You have got this, ${firstName}.`}
                  </h3>
                  <p className="text-xs text-slate-400">Need more help? Ask a doubt or run a quick mock test.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Link to="/doubt-solver" className="flex-1 sm:flex-none">
                    <Button variant="secondary" fullWidth className="gap-1.5 text-xs justify-center bg-blue-600 hover:bg-blue-700 text-white border-0">
                      Ask Doubt <ArrowRight size={12} />
                    </Button>
                  </Link>
                  <Link to="/simulation" className="flex-1 sm:flex-none">
                    <Button variant="secondary" fullWidth className="gap-1.5 text-xs justify-center bg-white/10 hover:bg-white/20 text-white border border-white/20">
                      Mock Test <ChevronRight size={12} />
                    </Button>
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











