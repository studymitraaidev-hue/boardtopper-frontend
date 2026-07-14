import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronLeft, Sword, Shield, Sparkles } from 'lucide-react';
import { api } from '../../utils/api';

interface Chapter {
  id: string;
  name: string;
  subject_id: string;
  type?: string;
  weightage?: string;
}

interface ChapterPickerProps {
  subjectId: string;
  subjectName: string;
  bossName: string;
  onBack: () => void;
  onConfirm: (chapterIds: string[]) => void;
  mode: 'quick' | 'final';
}

export default function ChapterPicker({ subjectId, subjectName, bossName, onBack, onConfirm, mode }: ChapterPickerProps) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/chapters?subject=${subjectId}`)
      .then((res: any) => setChapters(res.data.data || []))
      .catch(() => setChapters([]))
      .finally(() => setLoading(false));
  }, [subjectId]);

  const toggleChapter = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        // Quick mode: max 2 chapters
        if (mode === 'quick' && next.size >= 2) {
          return prev;
        }
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    if (mode === 'quick') {
      // Quick mode: auto-select first 2 high-weightage chapters
      const highWeight = chapters
        .filter(c => c.weightage === 'High Weightage' || c.type === 'Core')
        .slice(0, 2)
        .map(c => c.id);
      setSelected(new Set(highWeight));
    } else {
      setSelected(new Set(chapters.map(c => c.id)));
    }
  };

  const clearAll = () => setSelected(new Set());

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 rounded-full border border-white/10 border-t-red-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 px-4 py-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm mb-4"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Arena
        </button>
        
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center text-2xl">
            ⚔️
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">{bossName}</h2>
            <p className="text-gray-500 text-sm">{subjectName} • {mode === 'quick' ? 'Quick Raid' : 'Final Boss'}</p>
          </div>
        </div>
      </motion.div>

      {/* Mode Info */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-xl bg-white/5 border border-white/5 p-4 flex items-center gap-4"
      >
        <div className={`
          w-10 h-10 rounded-lg flex items-center justify-center
          ${mode === 'quick' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'}
        `}>
          {mode === 'quick' ? <Sword className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
        </div>
        <div className="flex-1">
          <div className="text-white font-semibold text-sm">
            {mode === 'quick' ? 'Quick Raid' : 'Final Boss Exam'}
          </div>
          <div className="text-gray-500 text-xs">
            {mode === 'quick' 
              ? 'Select 1-2 chapters. ~20 min, ~25 marks. Perfect for focused practice.' 
              : 'Select all relevant chapters. Full 3-hour board exam simulation.'}
          </div>
        </div>
      </motion.div>

      {/* Selection Controls */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-400">
          <span className="text-white font-bold">{selected.size}</span> of {chapters.length} selected
        </div>
        <div className="flex gap-2">
          <button onClick={clearAll} className="text-xs text-gray-500 hover:text-white transition-colors px-3 py-1.5 rounded-lg bg-white/5">
            Clear
          </button>
          <button onClick={selectAll} className="text-xs text-gray-500 hover:text-white transition-colors px-3 py-1.5 rounded-lg bg-white/5">
            {mode === 'quick' ? 'Auto (Best 2)' : 'Select All'}
          </button>
        </div>
      </div>

      {/* Chapter Grid */}
      <div className="grid grid-cols-1 gap-2">
        <AnimatePresence>
          {chapters.map((chapter, i) => {
            const isSelected = selected.has(chapter.id);
            const isDisabled = mode === 'quick' && !isSelected && selected.size >= 2;

            return (
              <motion.div
                key={chapter.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => !isDisabled && toggleChapter(chapter.id)}
                className={`
                  relative group rounded-xl border p-4 flex items-center gap-4 transition-all duration-300
                  ${isSelected 
                    ? 'border-red-500/30 bg-gradient-to-r from-red-950/20 to-transparent' 
                    : isDisabled
                      ? 'border-white/5 bg-white/[0.02] opacity-40 cursor-not-allowed'
                      : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04] cursor-pointer'
                  }
                `}
              >
                {/* Checkbox */}
                <div className={`
                  w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all
                  ${isSelected 
                    ? 'bg-red-500 border-red-500' 
                    : 'border-gray-700 group-hover:border-gray-500'
                  }
                `}>
                  {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium text-sm truncate">{chapter.name}</div>
                  <div className="flex gap-2 mt-1">
                    {chapter.weightage && (
                      <span className={`
                        text-[10px] px-2 py-0.5 rounded-full font-medium
                        ${chapter.weightage === 'High Weightage' 
                          ? 'bg-red-500/10 text-red-400' 
                          : chapter.weightage === 'Important'
                            ? 'bg-orange-500/10 text-orange-400'
                            : 'bg-gray-500/10 text-gray-400'
                        }
                      `}>
                        {chapter.weightage}
                      </span>
                    )}
                    {chapter.type && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-medium">
                        {chapter.type}
                      </span>
                    )}
                  </div>
                </div>

                {/* PYQ indicator */}
                <div className="text-xs text-gray-600">
                  <Sparkles className="w-4 h-4" />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Confirm Button */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky bottom-4"
      >
        <button
          onClick={() => onConfirm(Array.from(selected))}
          disabled={selected.size === 0}
          className={`
            w-full py-4 rounded-xl font-bold text-sm tracking-wide uppercase transition-all
            ${selected.size > 0
              ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-900/30 hover:shadow-red-900/50 hover:scale-[1.02]'
              : 'bg-gray-800 text-gray-600 cursor-not-allowed'
            }
          `}
        >
          {selected.size > 0 
            ? `Assemble ${mode === 'quick' ? 'Quick Raid' : 'Final Boss'} Paper`
            : 'Select at least 1 chapter'
          }
        </button>
      </motion.div>
    </div>
  );
}
