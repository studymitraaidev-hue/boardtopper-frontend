import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import BossSelect from '../components/paper-builder/BossSelect';
import ChapterPicker from '../components/paper-builder/ChapterPicker';
import BattleArena from '../components/paper-builder/BattleArena';
import BattleResult from '../components/paper-builder/BattleResult';
import { api } from '../utils/api';

type Screen = 'boss-select' | 'mode-select' | 'chapter-pick' | 'battle' | 'result';

interface PaperData {
  subjectId: string;
  subjectName: string;
  bossName: string;
  mode: 'quick' | 'final';
  paper: any;
}

export default function PaperBuilder() {
  const [screen, setScreen] = useState<Screen>('boss-select');
  const [paperData, setPaperData] = useState<PaperData | null>(null);
  const [result, setResult] = useState<{ score: number; totalMarks: number } | null>(null);
  const [loading, setLoading] = useState(false);

  // Step 1: Boss selected
  const handleBossSelect = (subjectId: string, subjectName: string, bossName: string) => {
    setPaperData({ subjectId, subjectName, bossName, mode: 'quick', paper: null });
    setScreen('mode-select');
  };

  // Step 2: Mode selected
  const handleModeSelect = (mode: 'quick' | 'final') => {
    if (!paperData) return;
    setPaperData({ ...paperData, mode });
    setScreen('chapter-pick');
  };

  // Step 3: Chapters confirmed → build paper
  const handleChaptersConfirm = async (chapterIds: string[]) => {
    if (!paperData) return;
    setLoading(true);
    
    try {
      const res: any = await api.post('/papers/build', {
        subjectId: paperData.subjectId,
        chapterIds,
        mode: paperData.mode,
      });
      
      console.log('[PaperBuilder] Build response:', res.data);
      const paper = res.data?.data?.paper || res.data?.paper;
      
      if (!paper) {
        throw new Error('No paper data in response');
      }
      
      setPaperData({ ...paperData, paper });
      setScreen('battle');
    } catch (err: any) {
      console.error('[PaperBuilder] Failed to build paper:', err?.response?.status, err?.message);
      const msg = err?.response?.data?.message || err?.message || 'Failed to assemble paper';
      alert(msg + '. Please try again or select different chapters.');
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Battle complete
  const handleBattleComplete = (score: number, totalMarks: number) => {
    setResult({ score, totalMarks });
    setScreen('result');
  };

  // Reset
  const handleReset = useCallback(() => {
    setScreen('boss-select');
    setPaperData(null);
    setResult(null);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
          >
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full border-2 border-white/10 border-t-red-500 animate-spin mx-auto" />
              <p className="text-gray-400 text-sm">Assembling your paper...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screen Router */}
      <AnimatePresence mode="wait">
        {screen === 'boss-select' && (
          <motion.div 
            key="boss-select"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <BossSelect 
              onSelectBoss={handleBossSelect}
              tasksDone={0}
              totalTasks={1}
            />
          </motion.div>
        )}

        {screen === 'mode-select' && paperData && (
          <motion.div 
            key="mode-select"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="max-w-2xl mx-auto px-4 py-12 space-y-8"
          >
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-white">Choose Your Battle</h2>
              <p className="text-gray-500 text-sm">How do you want to face {paperData.bossName}?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Quick Raid */}
              <motion.button
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleModeSelect('quick')}
                className="group relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-950/30 to-gray-900 p-6 text-left transition-all hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-900/20"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-2xl mb-4">⚡</div>
                  <h3 className="text-white font-bold text-lg mb-1">Quick Raid</h3>
                  <p className="text-gray-500 text-sm mb-4">1-2 chapters • ~20 min • ~25 marks</p>
                  <div className="flex gap-2 text-xs text-blue-400">
                    <span className="bg-blue-500/10 px-2 py-1 rounded-full">Perfect for focused practice</span>
                  </div>
                </div>
              </motion.button>

              {/* Final Boss */}
              <motion.button
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleModeSelect('final')}
                className="group relative overflow-hidden rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-950/30 to-gray-900 p-6 text-left transition-all hover:border-red-500/40 hover:shadow-lg hover:shadow-red-900/20"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center text-2xl mb-4">👑</div>
                  <h3 className="text-white font-bold text-lg mb-1">Final Boss</h3>
                  <p className="text-gray-500 text-sm mb-4">All chapters • ~3 hours • Full marks</p>
                  <div className="flex gap-2 text-xs text-red-400">
                    <span className="bg-red-500/10 px-2 py-1 rounded-full">Real board exam simulation</span>
                  </div>
                </div>
              </motion.button>
            </div>

            <button 
              onClick={handleReset}
              className="w-full py-3 text-gray-500 hover:text-white text-sm transition-colors"
            >
              ← Back to Arena
            </button>
          </motion.div>
        )}

        {screen === 'chapter-pick' && paperData && (
          <motion.div
            key="chapter-pick"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <ChapterPicker
              subjectId={paperData.subjectId}
              subjectName={paperData.subjectName}
              bossName={paperData.bossName}
              mode={paperData.mode}
              onBack={() => setScreen('mode-select')}
              onConfirm={handleChaptersConfirm}
            />
          </motion.div>
        )}

        {screen === 'battle' && paperData?.paper && (
          <motion.div
            key="battle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <BattleArena
              paper={paperData.paper}
              onComplete={handleBattleComplete}
            />
          </motion.div>
        )}

        {screen === 'result' && result && paperData && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <BattleResult
              score={result.score}
              totalMarks={result.totalMarks}
              bossName={paperData.bossName}
              bossEmoji={paperData.paper?.bossEmoji || '❓'}
              subjectName={paperData.subjectName}
              mode={paperData.mode}
              onRetry={handleReset}
              onHome={handleReset}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
