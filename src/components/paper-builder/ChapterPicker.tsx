import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronLeft, Sword, Shield, Sparkles, AlertTriangle, RefreshCw } from 'lucide-react';
import { api } from '../../utils/api';

interface Chapter {
  id: string;
  name: string;
  subject_id: string;
  type?: string;
  weightage?: string;
}

// Fallback chapters so UI NEVER stays empty
const FALLBACK_CHAPTERS: Record<string, Chapter[]> = {
  algebra: [
    { id: 'alg-1', name: 'Linear Equations in Two Variables', subject_id: 'algebra', weightage: 'High Weightage', type: 'Core' },
    { id: 'alg-2', name: 'Quadratic Equations', subject_id: 'algebra', weightage: 'High Weightage', type: 'Core' },
    { id: 'alg-3', name: 'Arithmetic Progression', subject_id: 'algebra', weightage: 'High Weightage', type: 'Core' },
    { id: 'alg-4', name: 'Financial Planning', subject_id: 'algebra', weightage: 'Important', type: 'Core' },
    { id: 'alg-5', name: 'Probability', subject_id: 'algebra', weightage: 'Important', type: 'Core' },
    { id: 'alg-6', name: 'Statistics', subject_id: 'algebra', weightage: 'Important', type: 'Core' },
  ],
  geometry: [
    { id: 'geo-1', name: 'Similarity', subject_id: 'geometry', weightage: 'High Weightage', type: 'Core' },
    { id: 'geo-2', name: 'Pythagoras Theorem', subject_id: 'geometry', weightage: 'High Weightage', type: 'Core' },
    { id: 'geo-3', name: 'Circle', subject_id: 'geometry', weightage: 'High Weightage', type: 'Core' },
    { id: 'geo-4', name: 'Coordinate Geometry', subject_id: 'geometry', weightage: 'High Weightage', type: 'Core' },
    { id: 'geo-5', name: 'Geometric Constructions', subject_id: 'geometry', weightage: 'Important', type: 'Core' },
    { id: 'geo-6', name: 'Trigonometry', subject_id: 'geometry', weightage: 'Important', type: 'Core' },
    { id: 'geo-7', name: 'Mensuration', subject_id: 'geometry', weightage: 'Important', type: 'Core' },
  ],
  science1: [
    { id: 'sci1-1', name: 'Gravitation', subject_id: 'science1', weightage: 'High Weightage', type: 'Core' },
    { id: 'sci1-2', name: 'Periodic Classification of Elements', subject_id: 'science1', weightage: 'High Weightage', type: 'Core' },
    { id: 'sci1-3', name: 'Chemical Reactions and Equations', subject_id: 'science1', weightage: 'High Weightage', type: 'Core' },
    { id: 'sci1-4', name: 'Effects of Electric Current', subject_id: 'science1', weightage: 'High Weightage', type: 'Core' },
    { id: 'sci1-5', name: 'Heat', subject_id: 'science1', weightage: 'Important', type: 'Core' },
    { id: 'sci1-6', name: 'Refraction of Light', subject_id: 'science1', weightage: 'Important', type: 'Core' },
    { id: 'sci1-7', name: 'Lenses', subject_id: 'science1', weightage: 'Important', type: 'Core' },
    { id: 'sci1-8', name: 'Metallurgy', subject_id: 'science1', weightage: 'Important', type: 'Core' },
    { id: 'sci1-9', name: 'Carbon Compounds', subject_id: 'science1', weightage: 'Important', type: 'Core' },
    { id: 'sci1-10', name: 'Space Missions', subject_id: 'science1', weightage: 'Important', type: 'Core' },
  ],
  science2: [
    { id: 'sci2-1', name: 'Heredity and Evolution', subject_id: 'science2', weightage: 'High Weightage', type: 'Core' },
    { id: 'sci2-2', name: 'Life Processes in Living Organisms', subject_id: 'science2', weightage: 'High Weightage', type: 'Core' },
    { id: 'sci2-3', name: 'Environmental Management', subject_id: 'science2', weightage: 'Important', type: 'Core' },
    { id: 'sci2-4', name: 'Towards Green Energy', subject_id: 'science2', weightage: 'Important', type: 'Core' },
    { id: 'sci2-5', name: 'Animal Classification', subject_id: 'science2', weightage: 'Important', type: 'Core' },
    { id: 'sci2-6', name: 'Introduction to Microbiology', subject_id: 'science2', weightage: 'Important', type: 'Core' },
    { id: 'sci2-7', name: 'Cell Biology and Biotechnology', subject_id: 'science2', weightage: 'Important', type: 'Core' },
    { id: 'sci2-8', name: 'Social Health', subject_id: 'science2', weightage: 'Important', type: 'Core' },
    { id: 'sci2-9', name: 'Disaster Management', subject_id: 'science2', weightage: 'Important', type: 'Core' },
    { id: 'sci2-10', name: 'Surface Water', subject_id: 'science2', weightage: 'Important', type: 'Core' },
  ],
  english: [
    { id: 'eng-1', name: 'Grammar & Writing Skills', subject_id: 'english', weightage: 'High Weightage', type: 'Core' },
    { id: 'eng-2', name: 'A Teenage Prayer', subject_id: 'english', weightage: 'Important', type: 'Poem' },
    { id: 'eng-3', name: 'The Sower', subject_id: 'english', weightage: 'Important', type: 'Poem' },
    { id: 'eng-4', name: 'The Twins', subject_id: 'english', weightage: 'Important', type: 'Poem' },
    { id: 'eng-5', name: 'A Lesson in Life from a Beggar', subject_id: 'english', weightage: 'Important', type: 'Prose' },
    { id: 'eng-6', name: 'A Poem on India', subject_id: 'english', weightage: 'Important', type: 'Poem' },
    { id: 'eng-7', name: 'Money', subject_id: 'english', weightage: 'Important', type: 'Poem' },
  ],
};

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
  const [error, setError] = useState<string | null>(null);

  const fetchChapters = () => {
    setLoading(true);
    setError(null);
    
    api.get(`/chapters?subject=${subjectId}`)
      .then((res: any) => {
        console.log('[ChapterPicker] API response:', res);
        const data = res || [];
        if (Array.isArray(data) && data.length > 0) {
          setChapters(data);
        } else {
          console.warn('[ChapterPicker] API returned empty, using fallback');
          setChapters(FALLBACK_CHAPTERS[subjectId] || []);
        }
      })
      .catch((err: any) => {
        console.error('[ChapterPicker] API failed:', err?.status, err?.message);
        setError(err?.message || 'Failed to load chapters');
        setChapters(FALLBACK_CHAPTERS[subjectId] || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchChapters();
  }, [subjectId]);

  const toggleChapter = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (mode === 'quick' && next.size >= 2) return prev;
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    if (mode === 'quick') {
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
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm mb-4">
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

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl bg-white/5 border border-white/5 p-4 flex items-center gap-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${mode === 'quick' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'}`}>
          {mode === 'quick' ? <Sword className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
        </div>
        <div className="flex-1">
          <div className="text-white font-semibold text-sm">{mode === 'quick' ? 'Quick Raid' : 'Final Boss Exam'}</div>
          <div className="text-gray-500 text-xs">
            {mode === 'quick' ? 'Select 1-2 chapters. ~20 min, ~25 marks.' : 'Select all relevant chapters. Full 3-hour board exam simulation.'}
          </div>
        </div>
      </motion.div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-400 text-sm font-medium">{error}</p>
            <p className="text-red-400/60 text-xs">Using cached chapter data.</p>
          </div>
          <button onClick={fetchChapters} className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30">
            <RefreshCw className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-400">
          <span className="text-white font-bold">{selected.size}</span> of {chapters.length} selected
        </div>
        <div className="flex gap-2">
          <button onClick={clearAll} className="text-xs text-gray-500 hover:text-white px-3 py-1.5 rounded-lg bg-white/5">Clear</button>
          <button onClick={selectAll} className="text-xs text-gray-500 hover:text-white px-3 py-1.5 rounded-lg bg-white/5">
            {mode === 'quick' ? 'Auto (Best 2)' : 'Select All'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <AnimatePresence>
          {chapters.map((chapter, i) => {
            const isSelected = selected.has(chapter.id);
            const isDisabled = mode === 'quick' && !isSelected && selected.size >= 2;
            return (
              <motion.div key={chapter.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                onClick={() => !isDisabled && toggleChapter(chapter.id)}
                className={`relative group rounded-xl border p-4 flex items-center gap-4 transition-all duration-300
                  ${isSelected ? 'border-red-500/30 bg-gradient-to-r from-red-950/20 to-transparent' : 
                    isDisabled ? 'border-white/5 bg-white/[0.02] opacity-40 cursor-not-allowed' : 
                    'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04] cursor-pointer'}`}>
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-red-500 border-red-500' : 'border-gray-700 group-hover:border-gray-500'}`}>
                  {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium text-sm truncate">{chapter.name}</div>
                  <div className="flex gap-2 mt-1">
                    {chapter.weightage && <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${chapter.weightage === 'High Weightage' ? 'bg-red-500/10 text-red-400' : chapter.weightage === 'Important' ? 'bg-orange-500/10 text-orange-400' : 'bg-gray-500/10 text-gray-400'}`}>{chapter.weightage}</span>}
                    {chapter.type && <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-medium">{chapter.type}</span>}
                  </div>
                </div>
                <Sparkles className="w-4 h-4 text-gray-600" />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="sticky bottom-4">
        <button onClick={() => onConfirm(Array.from(selected))} disabled={selected.size === 0}
          className={`w-full py-4 rounded-xl font-bold text-sm tracking-wide uppercase transition-all ${selected.size > 0 ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-900/30 hover:shadow-red-900/50 hover:scale-[1.02]' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}>
          {selected.size > 0 ? `Assemble ${mode === 'quick' ? 'Quick Raid' : 'Final Boss'} Paper` : 'Select at least 1 chapter'}
        </button>
      </motion.div>
    </div>
  );
}
