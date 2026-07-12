import { motion } from 'framer-motion';
import { Share2, MessageCircle, TrendingUp, CheckCircle2, Clock, BookOpen } from 'lucide-react';

interface ParentReportProps {
  studentName: string;
  doneCount: number;
  totalItems: number;
  streakCount: number;
  prioritySubjects: string[];
  timeSpentMinutes: number;
  predictedUnlocked: number;
}

export default function ParentReport({
  studentName,
  doneCount,
  totalItems,
  streakCount,
  prioritySubjects,
  timeSpentMinutes,
  predictedUnlocked,
}: ParentReportProps) {
  const progressPercent = totalItems > 0 ? Math.round((doneCount / totalItems) * 100) : 0;

  const generateMessage = () => {
    const subjects = prioritySubjects.slice(0, 3).join(', ') || 'All subjects';
    return `*${studentName}'s Study Update* \uD83D\uDCDA\n\n\u2705 Completed ${doneCount}/${totalItems} tasks (${progressPercent}%)\n\uD83D\uDD25 ${streakCount}-day streak\n\u23F0 ${timeSpentMinutes} min focused study\n\uD83D\uDD0D Priority: ${subjects}\n\uD83D\uDDDD\uFE0F Predicted questions unlocked: ${predictedUnlocked}\n\nPowered by BoardTopper AI`;
  };

  const handleShare = () => {
    const text = encodeURIComponent(generateMessage());
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-[#0a1a0f] via-[#0f0f0f] to-[#0a0a0a] p-5 shadow-2xl shadow-emerald-900/10"
    >
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-600/10 blur-3xl" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
              <Share2 size={18} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-300/60">Parent Report</p>
              <h3 className="text-base font-black text-white tracking-tight">Share Progress</h3>
            </div>
          </div>
        </div>

        {/* Stats preview */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/5">
            <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
            <div>
              <p className="text-xs font-black text-white">{doneCount}/{totalItems}</p>
              <p className="text-[9px] text-white/30 font-bold">Tasks</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/5">
            <TrendingUp size={14} className="text-emerald-400 shrink-0" />
            <div>
              <p className="text-xs font-black text-white">{progressPercent}%</p>
              <p className="text-[9px] text-white/30 font-bold">Progress</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/5">
            <Clock size={14} className="text-emerald-400 shrink-0" />
            <div>
              <p className="text-xs font-black text-white">{timeSpentMinutes}m</p>
              <p className="text-[9px] text-white/30 font-bold">Focused</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/5">
            <BookOpen size={14} className="text-emerald-400 shrink-0" />
            <div>
              <p className="text-xs font-black text-white">{predictedUnlocked}</p>
              <p className="text-[9px] text-white/30 font-bold">Predictions</p>
            </div>
          </div>
        </div>

        {/* Share button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleShare}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-sm shadow-lg shadow-emerald-900/30 hover:shadow-emerald-900/50 transition-shadow"
        >
          <MessageCircle size={16} />
          Share on WhatsApp
        </motion.button>

        <p className="mt-2 text-[9px] text-center text-white/20 font-medium">
          Generates a formatted summary for parents
        </p>
      </div>
    </motion.div>
  );
}
