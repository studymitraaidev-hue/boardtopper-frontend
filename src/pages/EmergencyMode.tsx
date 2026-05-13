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
  ChevronRight, Loader2, X,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface EmergencyItem {
  title: string;
  content: string;
}

type EmergencyMode = 'notes' | 'doubts' | 'fallback' | 'empty';

interface EmergencyData {
  mode: EmergencyMode;
  items: EmergencyItem[];
}

type LoadState = 'idle' | 'loading' | 'success' | 'error';

// ─── Mode metadata ────────────────────────────────────────────────────────────

const MODE_META: Record<
  EmergencyMode,
  {
    label: string;
    description: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
  }
> = {
  notes: {
    label: 'Your Notes',
    description: 'Showing your most recently edited personal notes — revise what you wrote.',
    icon: FileText,
  },
  doubts: {
    label: 'Your Doubts',
    description: 'Showing your most recent doubt-solver questions — review these topics.',
    icon: MessageCircle,
  },
  fallback: {
    label: 'Syllabus Chapters',
    description: 'No notes or doubts found. Showing key chapters from the syllabus.',
    icon: Library,
  },
  empty: {
    label: 'No Data',
    description: 'Nothing found. Start by generating notes or asking doubts.',
    icon: BookOpen,
  },
};

// ─── Upgrade Modal ────────────────────────────────────────────────────────────

/**
 * UpgradeModal — inline upgrade modal for EmergencyMode Pro gate.
 * Shows plan benefits and redirects to /pricing for Razorpay payment.
 * Does NOT initiate payment directly — payment happens on /pricing page.
 * This keeps the modal simple and avoids duplicating payment logic.
 */
function UpgradeModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center
                 justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal panel */}
      <div
        className="relative bg-white w-full sm:max-w-md rounded-t-3xl
                   sm:rounded-3xl shadow-2xl z-10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-400
                        via-amber-500 to-orange-500" />

        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-amber-50 p-2.5 rounded-2xl">
                <Crown size={24} className="text-amber-500" />
              </div>
              <div>
                <p className="text-base font-black text-slate-900">
                  Unlock Topper Pro
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Get Emergency Mode + all premium features
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-100 transition-colors
                         text-slate-400 hover:text-slate-600"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Price */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800
                          rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-white">₹99</p>
              <p className="text-xs text-slate-400">per month</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-black text-emerald-400 uppercase
                             tracking-wider">
                Most popular
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Cancel anytime
              </p>
            </div>
          </div>

          {/* Features list */}
          <div className="space-y-2.5">
            {[
              { icon: Zap,           text: 'Emergency Mode — last-minute revision'  },
              { icon: MessageCircle, text: 'Unlimited AI doubts (no hourly limit)'  },
              { icon: FileText,      text: 'PDF export for all board notes'          },
              { icon: BookOpen,      text: 'All chapters unlocked in Smart Notes'    },
              { icon: Crown,         text: 'Priority AI response quality'            },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="p-1.5 bg-emerald-50 rounded-lg shrink-0">
                  <Icon size={13} className="text-emerald-600" />
                </div>
                <p className="text-sm text-slate-700">{text}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Button
            variant="gold"
            fullWidth
            className="gap-2 justify-center font-black"
            onClick={handleUpgrade}
          >
            <Crown size={14} />
            Upgrade to Topper Pro — ₹99/mo
          </Button>

          <Link
            to="/pricing"
            className="block text-xs text-center text-slate-400 hover:text-slate-600
                       transition-colors"
          >
            See full plan details →
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Pro gate (free-plan users) ───────────────────────────────────────────────

function ProGate({ onUpgradeClick }: { onUpgradeClick: () => void }) {
  return (
    <AppLayout>
      <main className="flex-1 min-w-0 overflow-y-auto h-screen page-enter">
        <header className="sticky top-0 z-20 bg-gradient-to-r from-red-600
                           to-orange-500 px-4 sm:px-6 h-14 sm:h-16
                           flex items-center shadow-lg shadow-red-200">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-1.5 rounded-lg">
              <Zap size={18} className="text-white fill-white" />
            </div>
            <h1 className="text-sm sm:text-base font-black text-white">
              Emergency Mode
            </h1>
          </div>
        </header>
        <div className="flex flex-col items-center justify-center min-h-[60vh]
                        p-6 text-center">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl
                          p-8 max-w-md w-full space-y-5">
            <div className="bg-amber-50 p-4 rounded-2xl inline-flex mx-auto">
              <Crown size={36} className="text-amber-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 mb-2">
                Pro Feature
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Emergency Mode is exclusive to Topper Pro. Get your latest
                notes, doubts, and syllabus at a glance for last-minute
                revision.
              </p>
            </div>
            <div className="space-y-2 text-left">
              {[
                'Your latest personal notes',
                'Your recent doubt-solver questions',
                'Syllabus chapters as fallback',
                'Real data — no fake content',
              ].map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm
                                         text-slate-700">
                  <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                  {f}
                </div>
              ))}
            </div>
            <Button
              variant="gold"
              fullWidth
              className="gap-2 justify-center font-black"
              onClick={onUpgradeClick}
            >
              <Crown size={14} />
              Upgrade to Topper Pro — ₹99/mo
            </Button>
            <Link
              to="/pricing"
              className="block text-xs text-slate-400 hover:text-slate-600
                         transition-colors"
            >
              See full plan details →
            </Link>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export const EmergencyModePage = () => {
  // DAY 9: Use server-verified isPro — not just JWT user.plan
  const { isPro } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [data, setData]           = useState<EmergencyData | null>(null);
  const [errorMsg, setErrorMsg]   = useState<string>('');

  // Server enforces this too (requirePro middleware), but show UI gate early
  if (!isPro) return (
    <>
      <ProGate onUpgradeClick={() => setShowUpgradeModal(true)} />
      {showUpgradeModal && (
        <UpgradeModal onClose={() => setShowUpgradeModal(false)} />
      )}
    </>
  );

  // ── API call ────────────────────────────────────────────────────────────────

  const handleStart = async () => {
    setLoadState('loading');
    setData(null);
    setErrorMsg('');

    try {
      const result = await api.get<EmergencyData>('/api/emergency');

      // Defensive: guard against malformed server response
      if (!result || typeof result.mode !== 'string' || !Array.isArray(result.items)) {
        setErrorMsg('Invalid response from server. Please try again.');
        setLoadState('error');
        return;
      }

      // Sanitise items — guarantee title is never blank, content is never undefined
      const safeItems: EmergencyItem[] = result.items.slice(0, 5).map((item) => ({
        title:   ((item?.title ?? '').trim()) || 'Untitled',
        content: item?.content ?? '',
      }));

      setData({ mode: result.mode, items: safeItems });
      setLoadState('success');
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message || 'Request failed. Please try again.');
      } else {
        setErrorMsg('Something went wrong. Please try again.');
      }
      setLoadState('error');
    }
  };

  // ── Derived display values ──────────────────────────────────────────────────

  const meta     = data ? (MODE_META[data.mode] ?? MODE_META.empty) : null;
  const ModeIcon = meta?.icon ?? BookOpen;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <AppLayout>
      <main className="flex-1 min-w-0 overflow-y-auto h-screen page-enter">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-20 bg-gradient-to-r from-red-600 to-orange-500 px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between shadow-lg shadow-red-200">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-1.5 rounded-lg">
              <Zap size={18} className="text-white fill-white" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black text-white">Emergency Mode</h1>
              <p className="text-[10px] text-red-100 uppercase tracking-widest font-black hidden sm:block">
                Exam Survival · Real Data
              </p>
            </div>
          </div>
          {/* Show source label in header once loaded */}
          {loadState === 'success' && data && (
            <span className="text-xs font-black text-white bg-white/20 px-3 py-1.5 rounded-full border border-white/30">
              {meta?.label}
            </span>
          )}
        </header>

        <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 max-w-2xl mx-auto">

          {/* ── Start / Error panel ─────────────────────────────────────────── */}
          {(loadState === 'idle' || loadState === 'error') && (
            <div className="bg-gradient-to-r from-slate-950 to-red-950 rounded-2xl sm:rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl space-y-4">
              {/* Background decoration */}
              <div className="absolute inset-0 pointer-events-none opacity-5">
                <Zap size={280} className="absolute -right-10 -top-10 rotate-12 text-white" />
              </div>

              {/* Copy */}
              <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-amber-400" />
                  <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
                    Last-Minute Preparation
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  Exam soon?<br />
                  <span className="text-amber-400">See your real content.</span>
                </h2>
                <p className="text-sm text-slate-400 max-w-md">
                  Emergency Mode fetches your latest notes or doubts — real, user-specific data for focused last-minute revision.
                </p>
              </div>

              {/* CTA */}
              <div className="relative z-10">
                <Button
                  onClick={handleStart}
                  variant="secondary"
                  className="bg-red-500 hover:bg-red-400 text-white gap-2 font-black px-6 py-3 text-base"
                >
                  <Zap size={16} className="fill-white" />
                  Start Emergency Mode
                </Button>
              </div>

              {/* Inline error banner (shown below the button on retry) */}
              {loadState === 'error' && errorMsg && (
                <div className="relative z-10 bg-red-900/40 border border-red-500/40 rounded-xl p-4 flex items-start gap-3">
                  <AlertTriangle size={16} className="text-red-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-200">{errorMsg}</p>
                </div>
              )}
            </div>
          )}

          {/* ── Loading ─────────────────────────────────────────────────────── */}
          {loadState === 'loading' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 flex flex-col items-center gap-4 shadow-sm">
              <Loader2 size={36} className="text-red-500 animate-spin" />
              <p className="text-sm font-bold text-slate-600">Loading your content…</p>
            </div>
          )}

          {/* ── Success ─────────────────────────────────────────────────────── */}
          {loadState === 'success' && data && (
            <div className="space-y-4">

              {/* Source badge */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
                <div className="p-2 bg-red-50 rounded-lg shrink-0">
                  <ModeIcon size={18} className="text-red-600" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-0.5">
                    Source: {meta?.label}
                  </p>
                  <p className="text-sm text-slate-700">{meta?.description}</p>
                </div>
              </div>

              {/* Empty state (mode=empty or items array is genuinely empty) */}
              {data.mode === 'empty' || data.items.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-10 flex flex-col items-center gap-4 text-center shadow-sm">
                  <BookOpen size={32} className="text-slate-300" />
                  <div>
                    <p className="font-bold text-slate-700 mb-1">Nothing to show yet</p>
                    <p className="text-sm text-slate-500">
                      Create personal notes or ask doubts first, then come back.
                    </p>
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
                /* Item list */
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-slate-900">
                      {data.items.length} item{data.items.length !== 1 ? 's' : ''} to revise
                    </h3>
                    <button
                      onClick={() => { setLoadState('idle'); setData(null); }}
                      className="text-xs text-slate-400 hover:text-slate-600 font-semibold transition-colors"
                    >
                      Reset
                    </button>
                  </div>

                  {data.items.map((item, i) => (
                    <div
                      key={i}
                      className="bg-white border border-slate-200 hover:border-red-200 rounded-xl p-4 sm:p-5 flex items-start gap-4 transition-all shadow-sm hover:shadow-md"
                    >
                      {/* Number badge */}
                      <div className="bg-red-50 border border-red-100 rounded-lg w-8 h-8 flex items-center justify-center shrink-0">
                        <span className="text-xs font-black text-red-600">{i + 1}</span>
                      </div>
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="font-extrabold text-slate-900 text-sm leading-snug break-words">
                          {item.title}
                        </p>
                        {item.content ? (
                          <p className="text-sm text-slate-500 mt-1.5 leading-relaxed line-clamp-3 break-words">
                            {item.content}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Footer quick-actions */}
              <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4">
                <div className="text-3xl shrink-0">💪</div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-extrabold text-slate-900 mb-1 text-sm">Keep going, Topper.</h3>
                  <p className="text-xs text-slate-500">
                    Need more help? Solve doubts or run a quick mock test.
                  </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Link to="/doubt-solver" className="flex-1 sm:flex-none">
                    <Button
                      variant="secondary"
                      fullWidth
                      className="gap-1.5 text-xs justify-center bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Ask Doubt <ArrowRight size={13} />
                    </Button>
                  </Link>
                  <Link to="/simulation" className="flex-1 sm:flex-none">
                    <Button variant="secondary" fullWidth className="gap-1.5 text-xs justify-center">
                      Mock Test <ChevronRight size={13} />
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
