import { motion } from 'framer-motion';
import { Lock, Unlock, Sparkles, BookOpen } from 'lucide-react';

interface LikelyQuestion {
  topic: string;
  questionType: string;
  confidence: number;
  question?: string;
}

interface PredictedQuestionsProps {
  questions: LikelyQuestion[];
  unlockedCount: number;
  totalItems: number;
  doneCount: number;
}

export default function PredictedQuestions({
  questions,
  unlockedCount,
  totalItems,
  doneCount,
}: PredictedQuestionsProps) {
  const unlockThreshold = totalItems > 0 ? Math.ceil(totalItems / 3) : 1;
  const nextUnlockAt = Math.min(unlockThreshold * (unlockedCount + 1), totalItems);
  const progressToNext = totalItems > 0 ? doneCount / nextUnlockAt : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-[#1a1205] via-[#0f0f0f] to-[#0a0a0a] p-5 shadow-2xl shadow-amber-900/10"
    >
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-600/10 blur-3xl" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30">
              <Sparkles size={18} className="text-amber-400" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-300/60">Treasure Hunt</p>
              <h3 className="text-base font-black text-white tracking-tight">Predicted Questions</h3>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-black text-white">{unlockedCount}<span className="text-sm text-white/30">/{questions.length}</span></p>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Unlocked</p>
          </div>
        </div>

        {/* Progress to next unlock */}
        {unlockedCount < questions.length && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-white/40">Next unlock at {nextUnlockAt} tasks</span>
              <span className="text-[10px] font-bold text-amber-400">{Math.round(progressToNext * 100)}%</span>
            </div>
            <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, progressToNext * 100)}%` }}
                transition={{ duration: 0.6 }}
              />
            </div>
          </div>
        )}

        {/* Cards grid */}
        <div className="grid grid-cols-1 gap-2">
          {questions.map((q, i) => {
            const isUnlocked = i < unlockedCount;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className={`relative group rounded-xl border p-3 transition-all duration-300 ${
                  isUnlocked
                    ? 'border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50 hover:bg-amber-500/10'
                    : 'border-white/5 bg-white/[0.02] opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isUnlocked ? 'bg-amber-500/20' : 'bg-white/5'} border ${isUnlocked ? 'border-amber-500/30' : 'border-white/10'}`}>
                    {isUnlocked ? (
                      <BookOpen size={14} className="text-amber-400" />
                    ) : (
                      <Lock size={14} className="text-white/30" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold truncate ${isUnlocked ? 'text-white' : 'text-white/40'}`}>
                        {q.topic}
                      </span>
                      {isUnlocked && (
                        <span className="text-[9px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-500/20">
                          {q.confidence}% likely
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-white/30 mt-0.5">{q.questionType}</p>
                  </div>
                  {isUnlocked && q.question && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-[10px] text-amber-300/70 font-medium max-w-[40%] truncate"
                    >
                      {q.question}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {questions.length === 0 && (
          <div className="text-center py-6">
            <Lock size={24} className="text-white/10 mx-auto mb-2" />
            <p className="text-xs text-white/30 font-medium">Complete tasks to unlock predictions</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
