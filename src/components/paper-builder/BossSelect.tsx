import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Zap, ChevronRight, Trophy, Timer, Target, AlertTriangle, RefreshCw } from 'lucide-react';
import { api } from '../../utils/api';

interface BossSubject {
  id: string;
  name: string;
  emoji: string;
  boss: string;
  available: boolean;
}

interface BossSelectProps {
  onSelectBoss: (subjectId: string, subjectName: string, bossName: string) => void;
  tasksDone?: number;
  totalTasks?: number;
}

// Fallback data so the UI NEVER stays empty
const FALLBACK_SUBJECTS: BossSubject[] = [
  { id: 'algebra', name: 'Algebra', emoji: '📐', boss: 'Algebra Dragon', available: true },
  { id: 'geometry', name: 'Geometry', emoji: '📏', boss: 'Geometry Titan', available: true },
  { id: 'science1', name: 'Science Part 1', emoji: '⚗️', boss: 'Physics Phantom', available: true },
  { id: 'science2', name: 'Science Part 2', emoji: '🌿', boss: 'Bio Beast', available: true },
  { id: 'english', name: 'English', emoji: '📖', boss: 'Literature Leviathan', available: true },
  { id: 'history', name: 'History & Pol Sc', emoji: '🏛️', boss: 'History Hydra', available: false },
  { id: 'geography', name: 'Geography', emoji: '🌍', boss: 'Geo Golem', available: false },
];

export default function BossSelect({ onSelectBoss, tasksDone = 0, totalTasks = 1 }: BossSelectProps) {
  const [subjects, setSubjects] = useState<BossSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const fetchSubjects = () => {
    setLoading(true);
    setError(null);
    
    api.get('/api/papers/subjects')
      .then((res: any) => {
        const data = res?.subjects || res?.data?.subjects || [];
        if (Array.isArray(data) && data.length > 0) {
          setSubjects(data);
          setError(null);
        } else {
          setSubjects(FALLBACK_SUBJECTS);
        }
      })
      .catch((err: any) => {
        setError(err?.message || 'Failed to load arena data');
        setSubjects(FALLBACK_SUBJECTS);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const progressPct = Math.min((tasksDone / totalTasks) * 100, 100);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border border-white/10 border-t-red-500 animate-spin" />
          <div className="absolute inset-0 w-16 h-16 rounded-full bg-red-500/20 blur-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 px-4 py-6">
      {/* Cinematic Header */}
      <motion.div 
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-medium text-gray-400 tracking-widest uppercase">Exam Simulation</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none">
          Final Boss
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-red-500">
            Exam Arena
          </span>
        </h1>
        <p className="text-gray-500 text-sm max-w-md mx-auto">
          Real board exam papers assembled from past-year questions. Defeat the boss to prove you're ready.
        </p>
      </motion.div>

      {/* Power Status */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/80 to-black/80 border border-white/5 backdrop-blur-xl p-5"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-orange-500/5" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center text-xl">
                🧑‍🎓
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-red-500 border-2 border-gray-900 flex items-center justify-center">
                <Zap className="w-3 h-3 text-white" />
              </div>
            </div>
            <div>
              <div className="text-white font-bold text-sm">Combat Readiness</div>
              <div className="text-gray-500 text-xs">{tasksDone} of {totalTasks} objectives complete</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-white">{Math.round(progressPct)}<span className="text-red-500 text-lg">%</span></div>
            <div className="text-gray-600 text-xs uppercase tracking-wider">Boss weakened</div>
          </div>
        </div>
        <div className="mt-4 h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-red-400 rounded-full"
          />
        </div>
      </motion.div>

      {/* Error Banner */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 flex items-center gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-400 text-sm font-medium">{error}</p>
            <p className="text-red-400/60 text-xs">Using cached data. Some features may be limited.</p>
          </div>
          <button 
            onClick={fetchSubjects}
            className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </motion.div>
      )}



      {/* Boss Cards */}
      <div className="space-y-3">
        <AnimatePresence>
          {subjects.map((subject, i) => {
            const locked = !subject.available;
            const hovered = hoveredId === subject.id;
            const hpRemaining = Math.max(100 - Math.round(progressPct), 25);

            return (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onMouseEnter={() => setHoveredId(subject.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => !locked && onSelectBoss(subject.id, subject.name, subject.boss)}
                style={{ perspective: '1000px' }}
                className={`group relative ${locked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div 
                  className={`
                    relative overflow-hidden rounded-2xl border transition-all duration-500
                    ${locked 
                      ? 'border-white/5 bg-gray-900/30' 
                      : hovered 
                        ? 'border-red-500/30 bg-gradient-to-br from-gray-800/40 to-black/60 shadow-2xl shadow-red-900/10' 
                        : 'border-white/5 bg-gradient-to-br from-gray-800/20 to-black/40'
                    }
                  `}
                  style={{
                    transform: hovered && !locked ? 'rotateX(2deg) rotateY(-1deg) translateZ(20px)' : 'none',
                    transformStyle: 'preserve-3d'
                  }}
                >
                  {hovered && !locked && (
                    <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-red-500/20 via-orange-500/10 to-transparent blur-sm" />
                  )}

                  <div className="relative p-5 flex items-center gap-5">
                    <div className="relative">
                      <div className={`
                        w-16 h-16 rounded-2xl flex items-center justify-center text-3xl
                        transition-all duration-500
                        ${locked 
                          ? 'bg-gray-800/50 grayscale opacity-40' 
                          : 'bg-gradient-to-br from-gray-700 to-gray-900 border border-white/10 shadow-xl'
                        }
                      `}>
                        {subject.emoji}
                      </div>
                      {!locked && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-red-500 to-orange-500 border-2 border-gray-900 flex items-center justify-center">
                          <Target className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-bold text-base truncate ${locked ? 'text-gray-600' : 'text-white'}`}>
                          {subject.boss}
                        </h3>
                        {locked && <Lock className="w-3.5 h-3.5 text-gray-700 flex-shrink-0" />}
                      </div>
                      <p className={`text-sm ${locked ? 'text-gray-700' : 'text-gray-400'}`}>
                        {subject.name}
                      </p>

                      {!locked && (
                        <div className="mt-3 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-red-400 font-semibold tracking-wider uppercase">Threat Level</span>
                            <span className="text-gray-500">{hpRemaining}% HP</span>
                          </div>
                          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${hpRemaining}%` }}
                              transition={{ duration: 1, delay: i * 0.1 }}
                              className={`
                                h-full rounded-full
                                ${hpRemaining > 70 ? 'bg-gradient-to-r from-red-600 to-red-400' :
                                  hpRemaining > 40 ? 'bg-gradient-to-r from-orange-500 to-yellow-500' :
                                  'bg-gradient-to-r from-green-500 to-emerald-400'}
                              `}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className={`
                      w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                      transition-all duration-300
                      ${locked 
                        ? 'bg-gray-800/50 text-gray-600' 
                        : hovered 
                          ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' 
                          : 'bg-white/5 text-gray-400'
                      }
                    `}>
                      {locked ? <Lock className="w-4 h-4" /> : <ChevronRight className="w-5 h-5" />}
                    </div>
                  </div>

                  {!locked && (
                    <div className="relative px-5 pb-4 pt-0 flex gap-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Timer className="w-3 h-3" />
                        <span>120 min</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Trophy className="w-3 h-3" />
                        <span>40 marks</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Target className="w-3 h-3" />
                        <span>Board pattern</span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
