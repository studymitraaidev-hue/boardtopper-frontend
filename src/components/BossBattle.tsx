import { motion } from 'framer-motion';
import { Skull, Zap, Trophy } from 'lucide-react';

interface BossBattleProps {
  bossName: string;
  bossHp: number;
  bossMaxHp: number;
  defeatedSections: number;
  totalSections: number;
  doneCount: number;
  totalItems: number;
}

export default function BossBattle({
  bossName,
  bossHp,
  bossMaxHp,
  defeatedSections,
  totalSections,
  doneCount,
  totalItems,
}: BossBattleProps) {
  const hpPercent = Math.max(0, Math.round((bossHp / bossMaxHp) * 100));
  const isDefeated = bossHp <= 0;
  const progressPercent = totalItems > 0 ? Math.round((doneCount / totalItems) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-2xl border border-red-500/20 bg-gradient-to-br from-[#1a0a0a] via-[#0f0f0f] to-[#0a0a0a] p-5 shadow-2xl shadow-red-900/20"
    >
      {/* Ambient glow */}
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-red-600/10 blur-3xl" />
      <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-orange-600/10 blur-3xl" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isDefeated ? 'bg-emerald-500/20' : 'bg-red-500/20'} border ${isDefeated ? 'border-emerald-500/30' : 'border-red-500/30'}`}>
              {isDefeated ? (
                <Trophy size={20} className="text-emerald-400" />
              ) : (
                <Skull size={20} className="text-red-400" />
              )}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-red-300/60">
                {isDefeated ? 'BOSS DEFEATED' : 'CURRENT THREAT'}
              </p>
              <h3 className="text-lg font-black text-white tracking-tight">
                {isDefeated ? 'Exam Conquered!' : bossName}
              </h3>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-white tabular-nums">
              {hpPercent}<span className="text-sm text-white/40">%</span>
            </p>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider">HP Remaining</p>
          </div>
        </div>

        {/* HP Bar */}
        <div className="relative h-4 bg-black/40 rounded-full overflow-hidden border border-white/5">
          <motion.div
            className={`h-full rounded-full ${isDefeated ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-red-500 via-orange-500 to-red-400'}`}
            initial={{ width: '100%' }}
            animate={{ width: `${hpPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          />
          {/* Segments overlay */}
          <div className="absolute inset-0 flex">
            {Array.from({ length: totalSections }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 border-r border-black/30 last:border-r-0 ${i < defeatedSections ? 'bg-white/5' : ''}`}
              />
            ))}
          </div>
          {/* Glow effect on bar */}
          {!isDefeated && (
            <div className="absolute top-0 left-0 h-full w-20 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse rounded-full" />
          )}
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Zap size={14} className={isDefeated ? 'text-emerald-400' : 'text-orange-400'} />
              <span className="text-xs font-bold text-white/60">
                {defeatedSections}/{totalSections} Sections
              </span>
            </div>
            <div className="h-3 w-px bg-white/10" />
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white/60">
                {doneCount}/{totalItems} Tasks Done
              </span>
            </div>
          </div>
          {isDefeated && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20"
            >
              VICTORY
            </motion.span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
