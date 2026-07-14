import { motion } from 'framer-motion';
import { Trophy, Star, Zap, Share2, RotateCcw, Home, Target, TrendingUp, Award } from 'lucide-react';

interface BattleResultProps {
  score: number;
  totalMarks: number;
  bossName: string;
  bossEmoji: string;
  subjectName: string;
  mode: 'quick' | 'final';
  onRetry: () => void;
  onHome: () => void;
}

export default function BattleResult({ score, totalMarks, bossName, bossEmoji, subjectName, mode, onRetry, onHome }: BattleResultProps) {
  const percentage = Math.round((score / totalMarks) * 100);
  const isVictory = percentage >= 40;
  
  // Rank calculation
  const getRank = (pct: number) => {
    if (pct >= 90) return { rank: 'S', title: 'Legendary', color: 'from-yellow-400 to-amber-500', glow: 'shadow-yellow-500/30' };
    if (pct >= 75) return { rank: 'A', title: 'Elite', color: 'from-red-400 to-orange-500', glow: 'shadow-red-500/30' };
    if (pct >= 60) return { rank: 'B', title: 'Veteran', color: 'from-blue-400 to-cyan-500', glow: 'shadow-blue-500/30' };
    if (pct >= 40) return { rank: 'C', title: 'Survivor', color: 'from-gray-400 to-gray-500', glow: 'shadow-gray-500/30' };
    return { rank: 'D', title: 'Trainee', color: 'from-gray-600 to-gray-700', glow: 'shadow-gray-700/30' };
  };

  const rank = getRank(percentage);
  const xpGained = Math.round(percentage * (mode === 'final' ? 10 : 5));
  const streakBonus = isVictory ? 1 : 0;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-8">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-6"
      >
        {/* Boss Avatar & Result */}
        <div className="text-center space-y-4">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="relative inline-block"
          >
            <div className={`
              w-24 h-24 rounded-3xl flex items-center justify-center text-5xl mx-auto
              ${isVictory 
                ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/30' 
                : 'bg-gradient-to-br from-red-500/20 to-gray-800 border-2 border-red-500/30'
              }
            `}>
              {isVictory ? '🏆' : bossEmoji}
            </div>
            {isVictory && (
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-3xl border-2 border-dashed border-yellow-500/20"
              />
            )}
          </motion.div>

          <div>
            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className={`text-3xl font-black ${isVictory ? 'text-white' : 'text-gray-400'}`}
            >
              {isVictory ? 'VICTORY' : 'DEFEAT'}
            </motion.h2>
            <p className="text-gray-500 text-sm">
              {isVictory 
                ? `${bossName} has been defeated` 
                : `${bossName} remains undefeated`}
            </p>
          </div>
        </div>

        {/* Rank Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className={`
            relative overflow-hidden rounded-2xl p-6 text-center
            bg-gradient-to-br ${rank.color} bg-opacity-10
            border border-white/10
          `}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${rank.color} opacity-5`} />
          <div className="relative">
            <div className={`
              w-20 h-20 mx-auto rounded-2xl flex items-center justify-center text-4xl font-black text-white
              bg-gradient-to-br ${rank.color} shadow-lg ${rank.glow}
            `}>
              {rank.rank}
            </div>
            <div className="mt-3 text-white font-bold text-lg">{rank.title}</div>
            <div className="text-white/60 text-sm">{percentage}% Accuracy</div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-3 gap-3"
        >
          <div className="rounded-xl bg-white/5 border border-white/5 p-4 text-center">
            <Target className="w-5 h-5 text-red-400 mx-auto mb-2" />
            <div className="text-white font-bold text-lg">{score}</div>
            <div className="text-gray-600 text-xs">Score</div>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/5 p-4 text-center">
            <TrendingUp className="w-5 h-5 text-blue-400 mx-auto mb-2" />
            <div className="text-white font-bold text-lg">{totalMarks}</div>
            <div className="text-gray-600 text-xs">Total</div>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/5 p-4 text-center">
            <Award className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
            <div className="text-white font-bold text-lg">{percentage}%</div>
            <div className="text-gray-600 text-xs">Accuracy</div>
          </div>
        </motion.div>

        {/* Rewards */}
        {isVictory && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 p-4 space-y-3"
          >
            <div className="text-yellow-400 font-bold text-sm flex items-center gap-2">
              <Star className="w-4 h-4" /> REWARDS
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" /> XP Gained
              </span>
              <span className="text-white font-bold">+{xpGained}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-orange-500" /> Streak
              </span>
              <span className="text-white font-bold">+{streakBonus} day</span>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="space-y-3"
        >
          <button
            onClick={onRetry}
            className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-red-900/30 transition-all"
          >
            <RotateCcw className="w-5 h-5" /> {isVictory ? 'Fight Again' : 'Retry Battle'}
          </button>
          
          <button
            onClick={onHome}
            className="w-full py-3 bg-white/5 text-gray-400 font-medium rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 hover:text-white transition-all"
          >
            <Home className="w-5 h-5" /> Return to Arena
          </button>

          {isVictory && (
            <button
              onClick={() => {
                const text = `I defeated ${bossName} in ${subjectName} with ${percentage}% accuracy! Rank: ${rank.rank}-${rank.title} 🏆`;
                if (navigator.share) {
                  navigator.share({ title: 'BoardTopper Victory', text });
                } else {
                  navigator.clipboard.writeText(text);
                }
              }}
              className="w-full py-3 bg-white/5 text-gray-400 font-medium rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 hover:text-white transition-all"
            >
              <Share2 className="w-5 h-5" /> Share Victory
            </button>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
