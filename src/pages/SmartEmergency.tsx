import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../utils/api';
import { Loader2, AlertTriangle, Clock, BookOpen, Target, TrendingDown, TrendingUp, Zap, ChevronRight, Calendar, Flame } from 'lucide-react';

interface ChapterWeakness {
  chapterId: string;
  chapterName: string;
  subjectId: string;
  subjectName: string;
  score: number;
  attempts: number;
  lastAttempted: string | null;
}

interface HeatmapChapter {
  chapterId: string;
  chapterName: string;
  frequency: number;
  totalMarks: number;
  avgMarks: number;
  lastAppeared: number;
  likelihood: string;
  trend: string;
}

interface TimeSession {
  subject: string;
  chapter: string;
  duration: number;
  priority: string;
  action: string;
}

interface SmartEmergencyData {
  mode: string;
  checklist: Array<{
    title: string;
    content: string;
    tag?: string;
    priority?: string;
  }>;
  weaknessReport: {
    hasData: boolean;
    overallScore: number;
    weakChapters: ChapterWeakness[];
    strongChapters: ChapterWeakness[];
    weakSubjects: string[];
    subjectAverages: Record<string, number>;
  };
  heatmap: {
    subjectId: string;
    subjectName: string;
    chapters: HeatmapChapter[];
    hotChapters: HeatmapChapter[];
    totalPYQs: number;
  } | null;
  timeBlock: {
    hoursLeft: number;
    totalSessions: number;
    sessions: TimeSession[];
  };
  userContext: {
    name: string;
    examDate: string | null;
    weakSubjects: string[];
    streakCount: number;
    urgencyLevel: string;
  };
}

function urgencyColor(level: string): string {
  switch (level) {
    case 'panic': return 'text-red-600 bg-red-50 border-red-200';
    case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'low': return 'text-green-600 bg-green-50 border-green-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

function urgencyBadge(level: string): string {
  switch (level) {
    case 'panic': return '🔴 Panic Mode';
    case 'high': return '🟠 High Alert';
    case 'medium': return '🟡 Moderate';
    case 'low': return '🟢 Relaxed';
    default: return '⚪ Unknown';
  }
}

function scoreColor(score: number): string {
  if (score < 40) return 'text-red-600';
  if (score < 60) return 'text-orange-500';
  if (score < 80) return 'text-yellow-600';
  return 'text-green-600';
}

function scoreBg(score: number): string {
  if (score < 40) return 'bg-red-500';
  if (score < 60) return 'bg-orange-500';
  if (score < 80) return 'bg-yellow-500';
  return 'bg-green-500';
}

function likelihoodColor(l: string): string {
  if (l === 'very_high') return 'bg-red-100 text-red-700 border-red-200';
  if (l === 'high') return 'bg-orange-100 text-orange-700 border-orange-200';
  if (l === 'medium') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  return 'bg-gray-100 text-gray-600 border-gray-200';
}

function likelihoodLabel(l: string): string {
  if (l === 'very_high') return 'Very High';
  if (l === 'high') return 'High';
  if (l === 'medium') return 'Medium';
  return 'Low';
}

export default function SmartEmergency() {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<SmartEmergencyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hoursLeft = Number(searchParams.get('hoursLeft') || 12);
  const subjectId = searchParams.get('subjectId') || '';

  useEffect(() => {
    let cancelled = false;
    api.get(`/api/emergency/smart?hoursLeft=${hoursLeft}&subjectId=${subjectId}`)
      .then((res: any) => {
        if (cancelled) return;
        setData(res);
        setLoading(false);
      })
      .catch((err: any) => {
        if (cancelled) return;
        setError(err?.message || 'Failed to load study plan');
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [hoursLeft, subjectId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-gray-500 text-sm">Building your smart study plan...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-xl border border-red-200 p-6 max-w-md w-full text-center">
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Something went wrong</h2>
          <p className="text-gray-500 text-sm mb-4">{error || 'No data received'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { weaknessReport, heatmap, timeBlock, userContext, checklist } = data;
  const urgencyClass = urgencyColor(userContext.urgencyLevel);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Study Plan</h1>
              <p className="text-gray-500 text-sm mt-0.5">
                Hi {userContext.name}, let us plan your study
              </p>
            </div>
            <div className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${urgencyClass}`}>
              {urgencyBadge(userContext.urgencyLevel)}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            {userContext.examDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>Exam: {new Date(userContext.examDate).toLocaleDateString()}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>{timeBlock.hoursLeft}h left</span>
            </div>
            {userContext.streakCount > 0 && (
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>{userContext.streakCount} day streak</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Weak Subjects Pills */}
        {userContext.weakSubjects.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {userContext.weakSubjects.map((subj) => (
              <span key={subj} className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium border border-red-100">
                ⚠️ {subj}
              </span>
            ))}
          </div>
        )}

        {/* Overall Score Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Overall Readiness</h2>
            <span className={`text-2xl font-bold ${scoreColor(weaknessReport.overallScore)}`}>
              {weaknessReport.overallScore}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${scoreBg(weaknessReport.overallScore)}`}
              style={{ width: `${weaknessReport.overallScore}%` }}
            />
          </div>
          {!weaknessReport.hasData && (
            <p className="text-gray-500 text-sm mt-3">
              No practice data yet. Play a quiz to see your weakness radar.
            </p>
          )}
        </div>

        {/* Weakness Radar */}
        {weaknessReport.weakChapters.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="w-5 h-5 text-red-500" />
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Weakness Radar</h2>
            </div>
            <div className="space-y-3">
              {weaknessReport.weakChapters.map((ch) => (
                <div key={ch.chapterId} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{ch.chapterName}</p>
                      <span className={`text-sm font-semibold ${scoreColor(ch.score)}`}>{ch.score}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${scoreBg(ch.score)}`}
                        style={{ width: `${ch.score}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{ch.subjectName} · {ch.attempts} attempts</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Strong Chapters */}
        {weaknessReport.strongChapters.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Strong Areas</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {weaknessReport.strongChapters.map((ch) => (
                <span key={ch.chapterId} className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium border border-green-100">
                  {ch.chapterName} · {ch.score}%
                </span>
              ))}
            </div>
          </div>
        )}

        {/* PYQ Heatmap */}
        {heatmap && heatmap.chapters.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-500" />
                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">PYQ Heatmap</h2>
              </div>
              <span className="text-xs text-gray-400">{heatmap.subjectName} · {heatmap.totalPYQs} questions</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {heatmap.chapters.slice(0, 8).map((ch) => (
                <div key={ch.chapterId} className={`flex items-center justify-between px-3 py-2 rounded-lg border text-sm ${likelihoodColor(ch.likelihood)}`}>
                  <span className="font-medium truncate mr-2">{ch.chapterName}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs opacity-75">{ch.frequency}×</span>
                    <span className="text-xs font-semibold">{likelihoodLabel(ch.likelihood)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Smart Time Block */}
        {timeBlock.sessions.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-amber-500" />
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Smart Time Block</h2>
              <span className="ml-auto text-xs text-gray-400">{timeBlock.totalSessions} sessions</span>
            </div>
            <div className="space-y-2">
              {timeBlock.sessions.map((s, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-100">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${s.priority === 'critical' ? 'bg-red-500' : s.priority === 'high' ? 'bg-orange-500' : 'bg-yellow-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{s.chapter}</p>
                    <p className="text-xs text-gray-500">{s.subject} · {s.action}</p>
                  </div>
                  <span className="text-xs font-semibold text-gray-600 shrink-0">{s.duration} min</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Checklist */}
        {checklist.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-blue-500" />
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Study Checklist</h2>
            </div>
            <div className="space-y-2">
              {checklist.map((item, i) => (
                <div key={i} className="flex items-start gap-3 px-3 py-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition">
                  <ChevronRight className={`w-4 h-4 mt-0.5 shrink-0 ${item.priority === 'high' ? 'text-red-500' : 'text-gray-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.content}</p>
                  </div>
                  {item.tag && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${item.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                      {item.tag}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Start Button */}
        <div className="bg-indigo-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Quick-Start Paper</h3>
              <p className="text-indigo-200 text-sm mt-0.5">Build a focused paper on your weakest chapters</p>
            </div>
            <button
              onClick={() => {
                const weakIds = weaknessReport.weakChapters.map(c => c.chapterId).join(',');
                window.location.href = `/paper-builder?chapters=${weakIds}&mode=quick`;
              }}
              className="px-4 py-2 bg-white text-indigo-600 rounded-lg text-sm font-semibold hover:bg-indigo-50 transition shrink-0 ml-4"
            >
              Build Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
