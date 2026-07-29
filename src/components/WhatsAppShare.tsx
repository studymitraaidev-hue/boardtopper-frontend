import React from 'react';
import { Share2, Trophy, Target, TrendingUp, Clock, AlertTriangle, Zap } from 'lucide-react';

interface WhatsAppShareProps {
  userName: string;
  streakCount: number;
  totalCompleted: number;
  mockScoreAvg: number | null;
  weakTopics: string[];
  targetPercent: number;
  isPro: boolean;
}

const getStudyAbility = (mockScore: number | null, target: number): { label: string; emoji: string; color: string } => {
  const score = mockScore ?? 0;
  const ratio = score / target;
  if (ratio >= 0.9) return { label: 'Board Topper Level', emoji: '🏆', color: '#22c55e' };
  if (ratio >= 0.7) return { label: 'Strong Performer', emoji: '💪', color: '#3b82f6' };
  if (ratio >= 0.5) return { label: 'Needs Practice', emoji: '📚', color: '#f59e0b' };
  return { label: 'Urgent Attention', emoji: '⚠️', color: '#ef4444' };
};

const getDailyHoursNeeded = (mockScore: number | null, target: number): number => {
  const score = mockScore ?? 0;
  const gap = Math.max(0, target - score);
  return Math.round((gap / 10) * 10) / 10 || 0.5;
};

export const WhatsAppShare: React.FC<WhatsAppShareProps> = ({
  userName,
  streakCount,
  totalCompleted,
  mockScoreAvg,
  weakTopics,
  targetPercent,
  isPro,
}) => {
  const studyAbility = getStudyAbility(mockScoreAvg, targetPercent);
  const dailyHours = getDailyHoursNeeded(mockScoreAvg, targetPercent);
  const accuracy = mockScoreAvg ? Math.round(mockScoreAvg) : 0;

  const generateShareMessage = (): string => {
    const lines = [
      `🎯 *${userName}'s BoardTopper Report*`,
      ``,
      `📊 *Progress Overview*`,
      `🔥 Streak: ${streakCount} days`,
      `✅ Chapters Completed: ${totalCompleted}`,
      `🎯 Target: ${targetPercent}%`,
      ``,
      `${studyAbility.emoji} *Study Ability: ${studyAbility.label}*`,
      accuracy > 0 ? `📈 Mock Score Average: ${accuracy}%` : '',
      ``,
      weakTopics.length > 0 ? `📚 *Weak Areas:* ${weakTopics.slice(0, 3).join(', ')}` : '📚 No weak areas! Keep it up!',
      ``,
      `⏰ *Daily Study Needed: ${dailyHours} hours*`,
      ``,
      `💡 "Study ${dailyHours} hrs/day to reach ${targetPercent}%"`,
      ``,
      `🚀 Preparing for Maharashtra SSC 2026 with BoardTopper!`,
      isPro ? '⭐ Pro Member' : '',
      `🔗 boardtopper.vercel.app`,
    ];
    return lines.filter(Boolean).join('%0A');
  };

  const handleShare = () => {
    const message = generateShareMessage();
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#111] to-[#0a0a0a] p-4">
      <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-green-600/10 blur-2xl" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-green-500/20 border border-green-500/30">
            <Share2 size={14} className="text-green-400" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Share Progress</span>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-lg">
            {studyAbility.emoji}
          </div>
          <div>
            <div className="text-sm font-bold text-white">{studyAbility.label}</div>
            <div className="text-xs text-white/50">
              {streakCount} day streak • {totalCompleted} chapters done
            </div>
          </div>
        </div>

        {weakTopics.length > 0 && (
          <div className="mb-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="flex items-center gap-1.5 mb-1">
              <AlertTriangle size={12} className="text-red-400" />
              <span className="text-xs font-semibold text-red-400">Focus Areas</span>
            </div>
            <div className="text-xs text-red-300/80">
              {weakTopics.slice(0, 3).join(' • ')}
            </div>
          </div>
        )}

        <div className="mb-3 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock size={12} className="text-blue-400" />
            <span className="text-xs font-semibold text-blue-400">Daily Target</span>
          </div>
          <div className="text-xs text-blue-300/80">
            Study <strong className="text-white">{dailyHours} hours/day</strong> to reach {targetPercent}%
          </div>
        </div>

        <button
          onClick={handleShare}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-bold flex items-center justify-center gap-2 hover:from-green-400 hover:to-emerald-500 transition-all active:scale-95"
        >
          <Share2 size={16} />
          Share on WhatsApp
        </button>
      </div>
    </div>
  );
};

export default WhatsAppShare;
