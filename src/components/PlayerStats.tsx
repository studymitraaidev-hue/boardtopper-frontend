import { motion } from 'framer-motion';
import { Flame, TrendingUp, Target, Clock } from 'lucide-react';

interface PlayerStatsProps {
  playerXp: number;
  playerLevel: number;
  streakCount: number;
  urgencyLevel: string;
  timeRemainingMinutes: number | null;
  examDateSet: boolean;
}

export default function PlayerStats({
  playerXp,
  playerLevel,
  streakCount,
  urgencyLevel,
  timeRemainingMinutes,
  examDateSet,
}: PlayerStatsProps) {
  const xpToNext = playerLevel * 100;
  const xpPercent = Math.min(100, Math.round((playerXp / xpToNext) * 100));
  
  const urgencyMeta: Record<string, { color: string; bg: string; border: string; icon: typeof Flame }> = {
    panic: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: Flame },
    high: { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: Target },
    medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', icon: Clock },
    low: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: TrendingUp },
  };
  
  const meta = urgencyMeta[urgencyLevel] || urgencyMeta.low;
  const UrgencyIcon = meta.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
      className="grid grid-cols-2 gap-3"
    >
      {/* Level Card */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#111] to-[#0a0a0a] p-4">
        <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-indigo-600/10 blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30">
              <TrendingUp size={14} className="text-indigo-400" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Level</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-white">{playerLevel}</span>
            <span className="text-xs font-bold text-white/30">LVL</span>
          </div>
          <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-400 to-violet-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${xpPercent}%` }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
          </div>
          <p className="mt-1 text-[10px] font-bold text-white/30">{playerXp}/{xpToNext} XP</p>
        </div>
      </div>

      {/* Streak Card */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#111] to-[#0a0a0a] p-4">
        <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-orange-600/10 blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-orange-500/20 border border-orange-500/30">
              <Flame size={14} className="text-orange-400" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Streak</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-white">{streakCount}</span>
            <span className="text-xs font-bold text-white/30">days</span>
          </div>
          <p className="mt-2 text-[10px] font-bold text-white/30">
            {streakCount > 0 ? 'Keep it burning!' : 'Start today'}
          </p>
        </div>
      </div>

      {/* Urgency Card */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#111] to-[#0a0a0a] p-4 col-span-2">
        <div className={`absolute -right-4 -top-4 h-20 w-20 rounded-full blur-2xl ${meta.bg.replace('/10', '/20')}`} />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${meta.bg} border ${meta.border}`}>
              <UrgencyIcon size={18} className={meta.color} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Urgency</p>
              <p className={`text-sm font-black ${meta.color} capitalize`}>{urgencyLevel}</p>
            </div>
          </div>
          {examDateSet && timeRemainingMinutes !== null && (
            <div className="text-right">
              <p className="text-lg font-black text-white tabular-nums">
                {Math.floor(timeRemainingMinutes / 60)}h {timeRemainingMinutes % 60}m
              </p>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Until Exam</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
