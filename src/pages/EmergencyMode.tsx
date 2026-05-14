import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { Button } from '../components/ui/Button';
import { cn } from '../utils/cn';
import { useAuth } from '../context/AuthContext';
import { api, ApiError } from '../utils/api';
import {
  Zap, AlertTriangle, CheckCircle2, BookOpen,
  ArrowRight, Crown, Lock, FileText, MessageCircle, Library,
  ChevronRight, Loader2, X, Clock, Target, Brain, Flame,
  Shield, Star, TrendingUp, RefreshCw,
} from 'lucide-react';

interface EmergencyItem { title: string; content: string; }
type EmergencyMode = 'notes' | 'doubts' | 'fallback' | 'empty';
interface EmergencyData { mode: EmergencyMode; items: EmergencyItem[]; }
type LoadState = 'idle' | 'loading' | 'success' | 'error';

const MODE_META: Record<EmergencyMode, { label: string; description: string; icon: React.ComponentType<{ size?: number; className?: string }>; color: string; bg: string; }> = {
  notes:    { label: 'Your Notes',        description: 'Your most recently edited personal notes — revise what you wrote.',      icon: FileText,      color: 'text-blue-600',    bg: 'bg-blue-50' },
  doubts:   { label: 'Your Doubts',       description: 'Your most recent doubt-solver questions — review these topics.',          icon: MessageCircle, color: 'text-violet-600',  bg: 'bg-violet-50' },
  fallback: { label: 'Syllabus Chapters', description: 'No notes or doubts yet. Key chapters from the syllabus to focus on.',    icon: Library,       color: 'text-emerald-600', bg: 'bg-emerald-50' },
  empty:    { label: 'No Data',           description: 'Nothing found. Start by generating notes or asking doubts.',              icon: BookOpen,      color: 'text-slate-500',   bg: 'bg-slate-50' },
};

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
            <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-100 transition-colors text-slate-400">
              <X size={18} />
            </button>
          </div>
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-white">?99<span className="text-sm font-normal text-slate-400">/mo</span></p>
              <p className="text-xs text-slate-400 mt-0.5">Cancel anytime</p>
            </div>
            <span className="text-xs font-black text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">MOST POPULAR</span>
          </div>
          <div className="space-y-2.5">
            {[
              { icon: Zap,           text: 'Emergency Mode — last-minute revision'  },
              { icon: MessageCircle, text: 'Unlimited AI doubts (no hourly limit)'  },
                            { icon: BookOpen,      text: 'All chapters unlocked in Smart Notes'    },
              { icon: Crown,         text: 'Priority AI response quality'            },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="p-1.5 bg-emerald-50 rounded-lg shrink-0"><Icon size={13} className="text-emerald-600" /></div>
                <p className="text-sm text-slate-700">{text}</p>
              </div>
            ))}
          </div>
          <Button variant="gold" fullWidth className="gap-2 justify-center font-black" onClick={() => navigate('/pricing')}>
            <Crown size={14} /> Upgrade to Topper Pro — ?99/mo
          </Button>
          <Link to="/pricing" className="block text-xs text-center text-slate-400 hover:text-slate-600 transition-colors">See full plan details ?</Link>
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
              <p className="text-sm text-slate-500 leading-relaxed">Emergency Mode is exclusive to Topper Pro — your personal exam survival toolkit.</p>
            </div>
            <div className="relative space-y-2 text-left bg-slate-50 rounded-2xl p-4">
              {['Your latest personal notes', 'Your recent AI doubt questions', 'Syllabus chapters as fallback', 'Real data — no fake content'].map(f => (
                <div key={f} className="flex items-center gap-2.5 text-sm text-slate-700">
                  <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />{f}
                </div>
              ))}
            </div>
            <div className="relative">
              <Button variant="gold" fullWidth className="gap-2 justify-center font-black py-3 text-base shadow-lg shadow-amber-200" onClick={onUpgradeClick}>
                <Crown size={16} /> Upgrade to Topper Pro — ?99/mo
              </Button>
              <Link to="/pricing" className="block text-xs text-slate-400 hover:text-slate-600 transition-colors mt-3">See full plan details ?</Link>
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
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [data, setData] = useState<EmergencyData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

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
    setExpandedIndex(null);
    try {
      const result = await api.get<EmergencyData>('/api/emergency');
      if (!result || typeof result.mode !== 'string' || !Array.isArray(result.items)) {
        setErrorMsg('Invalid response from server. Please try again.');
        setLoadState('error');
        return;
      }
      const safeItems: EmergencyItem[] = result.items.slice(0, 5).map(item => ({
        title:   ((item?.title ?? '').trim()) || 'Untitled',
        content: item?.content ?? '',
      }));
      setData({ mode: result.mode, items: safeItems });
      setLoadState('success');
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? (err.message || 'Request failed.') : 'Something went wrong.');
      setLoadState('error');
    }
  };

  const meta = data ? (MODE_META[data.mode] ?? MODE_META.empty) : null;
  const ModeIcon = meta?.icon ?? BookOpen;

  const modeColors: Record<EmergencyMode, string> = {
    notes:    'from-blue-500 to-indigo-600',
    doubts:   'from-violet-500 to-purple-600',
    fallback: 'from-emerald-500 to-teal-600',
    empty:    'from-slate-400 to-slate-500',
  };

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
              <p className="text-[9px] text-red-100 uppercase tracking-widest font-bold hidden sm:block">Exam Survival · Real Data</p>
            </div>
          </div>
          {loadState === 'success' && data && (
            <div className="flex items-center gap-2">
              <span className={cn('text-xs font-black text-white bg-white/20 px-3 py-1.5 rounded-full border border-white/30 flex items-center gap-1.5')}>
                <ModeIcon size={11} />
                {meta?.label}
              </span>
              <button onClick={() => { setLoadState('idle'); setData(null); }} className="p-1.5 bg-white/20 rounded-lg border border-white/20 text-white hover:bg-white/30 transition-colors">
                <RefreshCw size={14} />
              </button>
            </div>
          )}
        </header>

        <div className="p-4 sm:p-6 space-y-5 max-w-2xl mx-auto pb-24">

          {/* Idle / Error */}
          {(loadState === 'idle' || loadState === 'error') && (
            <div className="relative bg-gradient-to-br from-slate-950 via-red-950 to-slate-900 rounded-3xl overflow-hidden shadow-2xl">
              {/* Decorative glows */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 p-6 sm:p-8 space-y-6">
                {/* Top badge */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-red-500/20 border border-red-500/30 rounded-full px-3 py-1">
                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-red-300 uppercase tracking-widest">Exam Mode Active</span>
                  </div>
                </div>

                {/* Headline */}
                <div className="space-y-3">
                  <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                    Exam in<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">a few hours?</span>
                  </h2>
                  <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
                    Emergency Mode fetches your actual study data — notes, doubts, syllabus — for targeted last-minute revision.
                  </p>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: FileText,    label: 'Your Notes',    sub: 'Latest 5' },
                    { icon: Brain,       label: 'AI Doubts',     sub: 'Recent Q&A' },
                    { icon: Target,      label: 'Syllabus',      sub: 'Fallback' },
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

                {/* CTA */}
                <div className="space-y-3">
                  <button
                    onClick={handleStart}
                    className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-red-900/50 transition-all active:scale-95 text-base"
                  >
                    <Zap size={18} className="fill-white" />
                    Start Emergency Mode
                    <ArrowRight size={16} />
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
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center">
                  <Zap size={28} className="text-red-500 fill-red-500" />
                </div>
                <div className="absolute -inset-1 border-2 border-red-500/30 rounded-2xl animate-ping" />
              </div>
              <div className="text-center space-y-1">
                <p className="font-black text-slate-800">Fetching your content...</p>
                <p className="text-xs text-slate-400">Scanning notes, doubts, and syllabus</p>
              </div>
              <div className="flex gap-1.5">
                {[0,1,2].map(i => (
                  <div key={i} className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}

          {/* Success */}
          {loadState === 'success' && data && (
            <div className="space-y-4">

              {/* Source card */}
              {data && meta && (
                <div className={cn('rounded-2xl p-4 flex items-center gap-4 border', meta.bg, 'border-current/10')}>
                  <div className={cn('p-2.5 rounded-xl', meta.bg, 'border border-current/20')}>
                    <ModeIcon size={18} className={meta.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-xs font-black uppercase tracking-wider mb-0.5', meta.color)}>Source: {meta.label}</p>
                    <p className="text-sm text-slate-600">{meta.description}</p>
                  </div>
                </div>
              )}

              {/* Empty state */}
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
                  {/* Count header */}
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <Flame size={16} className="text-red-500" />
                      <h3 className="font-extrabold text-slate-900">{data.items.length} item{data.items.length !== 1 ? 's' : ''} to revise</h3>
                    </div>
                    <button onClick={() => { setLoadState('idle'); setData(null); }} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 font-semibold transition-colors">
                      <RefreshCw size={12} /> Reset
                    </button>
                  </div>

                  {/* Items */}
                  {data.items.map((item, i) => {
                    const isExpanded = expandedIndex === i;
                    return (
                      <div
                        key={i}
                        onClick={() => setExpandedIndex(isExpanded ? null : i)}
                        className={cn(
                          'bg-white border rounded-2xl overflow-hidden transition-all shadow-sm cursor-pointer select-none',
                          isExpanded ? 'border-red-200 shadow-md shadow-red-50' : 'border-slate-100 hover:border-slate-200'
                        )}
                      >
                        <div className="p-4 sm:p-5 flex items-start gap-4">
                          <div className={cn('shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black bg-gradient-to-br text-white shadow-sm', data.mode === 'notes' ? 'from-blue-500 to-indigo-600' : data.mode === 'doubts' ? 'from-violet-500 to-purple-600' : 'from-emerald-500 to-teal-600')}>
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-extrabold text-slate-900 text-sm leading-snug break-words">{item.title}</p>
                            {item.content && !isExpanded && (
                              <p className="text-xs text-slate-400 mt-1 line-clamp-1">{item.content}</p>
                            )}
                          </div>
                          <ChevronRight size={16} className={cn('text-slate-300 shrink-0 transition-transform mt-0.5', isExpanded && 'rotate-90')} />
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

              {/* Footer */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4">
                <div className="text-3xl shrink-0">??</div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-extrabold text-white mb-1 text-sm">You've got this, Topper.</h3>
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

