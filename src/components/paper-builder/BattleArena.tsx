import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Zap, SkipForward, Lightbulb, Swords } from 'lucide-react';


interface PaperQuestion {
  id: string;
  question: string;
  marks: number;
  type: 'mcq' | 'very_short' | 'short' | 'long';
  answerHint: string;
  source: 'pyq' | 'ai';
  options?: string[];
}

interface PaperSection {
  name: string;
  type: string;
  marksEach: number;
  totalQuestions: number;
  questions: PaperQuestion[];
}

interface BuiltPaper {
  subjectId: string;
  subjectName: string;
  mode: 'quick' | 'final';
  totalMarks: number;
  durationMinutes: number;
  readingTimeMinutes: number;
  pacingTip: string;
  sections: PaperSection[];
  bossHp: number;
  bossName: string;
  bossEmoji: string;
}

interface BattleArenaProps {
  paper: BuiltPaper;
  onComplete: (score: number, totalMarks: number) => void;

}

export default function BattleArena({ paper, onComplete }: BattleArenaProps) {
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(paper.durationMinutes * 60);
  const [playerHp, setPlayerHp] = useState(100);
  const [bossHp, setBossHp] = useState(paper.bossHp);
  const [combo, setCombo] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [phase, setPhase] = useState<'reading' | 'battle' | 'victory' | 'defeat'>('reading');
  const [hitEffect, setHitEffect] = useState<'player' | 'boss' | null>(null);

  const section = paper.sections[currentSectionIdx];
  const question = section?.questions[currentQuestionIdx];
  const totalQuestions = paper.sections.reduce((sum, s) => sum + s.questions.length, 0);
  const answeredCount = Object.keys(answers).length;

  // Timer
  useEffect(() => {
    if (phase !== 'battle') return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  const handleTimeUp = () => {
    calculateFinalScore();
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (answer: string) => {
    if (!question) return;
    
    const qKey = `${currentSectionIdx}-${currentQuestionIdx}`;
    const isCorrect = checkAnswer(answer, question);
    
    setAnswers(prev => ({ ...prev, [qKey]: answer }));
    
    if (isCorrect) {
      setCombo(prev => prev + 1);
      const damage = Math.min(10 + (combo * 2), 25);
      setBossHp(prev => Math.max(0, prev - damage));
      setHitEffect('boss');
    } else {
      setCombo(0);
      setPlayerHp(prev => Math.max(0, prev - 15));
      setHitEffect('player');
    }
    
    setShowHint(false);
    
    setTimeout(() => setHitEffect(null), 300);
    
    // Move to next question
    setTimeout(() => {
      if (currentQuestionIdx < section.questions.length - 1) {
        setCurrentQuestionIdx(prev => prev + 1);
      } else if (currentSectionIdx < paper.sections.length - 1) {
        setCurrentSectionIdx(prev => prev + 1);
        setCurrentQuestionIdx(0);
      } else {
        calculateFinalScore();
      }
    }, 400);
  };

  const checkAnswer = (answer: string, q: PaperQuestion): boolean => {
    // For demo: MCQ with options — assume first option is correct for now
    // In production: compare against stored correct answer
    if (q.type === 'mcq' && q.options) {
      return q.options[0] === answer;
    }
    // For subjective: any non-empty answer is "correct" (self-graded later)
    return answer.trim().length > 0;
  };

  const calculateFinalScore = () => {
    let score = 0;
    paper.sections.forEach((sec, si) => {
      sec.questions.forEach((q, qi) => {
        const key = `${si}-${qi}`;
        if (answers[key] && checkAnswer(answers[key], q)) {
          score += q.marks;
        }
      });
    });
    
    const percentage = (score / paper.totalMarks) * 100;
    if (percentage >= 40) {
      setPhase('victory');
    } else {
      setPhase('defeat');
    }
    
    setTimeout(() => onComplete(score, paper.totalMarks), 2000);
  };

  const handleSkip = () => {
    setCombo(0);
    setPlayerHp(prev => Math.max(0, prev - 5));
    handleAnswer(''); // Empty answer = wrong
  };

  // Reading phase countdown
  if (phase === 'reading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-8 max-w-md"
        >
          <div className="text-6xl">{paper.bossEmoji}</div>
          <div>
            <h2 className="text-3xl font-black text-white mb-2">{paper.bossName}</h2>
            <p className="text-gray-500">Appears in {paper.readingTimeMinutes} minutes...</p>
          </div>
          
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4">
            <div className="flex items-center gap-3 text-gray-400">
              <Timer className="w-5 h-5" />
              <span>{paper.durationMinutes} minutes</span>
            </div>
            <div className="flex items-center gap-3 text-gray-400">
              <Swords className="w-5 h-5" />
              <span>{paper.totalMarks} marks</span>
            </div>
            <p className="text-sm text-gray-500 italic">"{paper.pacingTip}"</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPhase('battle')}
            className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-xl"
          >
            ENTER THE ARENA
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Battle phase
  if (phase === 'battle' && question) {
    return (
      <div className="min-h-screen bg-black text-white">
        {/* Top HUD */}
        <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-3xl mx-auto px-4 py-3">
            {/* Boss & Player HP */}
            <div className="flex items-center gap-4 mb-3">
              {/* Boss */}
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-red-400 font-bold">{paper.bossName}</span>
                  <span className="text-gray-500">{bossHp}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div 
                    animate={{ width: `${bossHp}%` }}
                    className="h-full bg-gradient-to-r from-red-600 to-orange-500 rounded-full"
                  />
                </div>
              </div>
              
              {/* VS */}
              <div className="text-gray-700 font-black text-sm">VS</div>
              
              {/* Player */}
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-blue-400 font-bold">YOU</span>
                  <span className="text-gray-500">{playerHp}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div 
                    animate={{ width: `${playerHp}%` }}
                    className={`h-full rounded-full ${playerHp > 50 ? 'bg-gradient-to-r from-blue-500 to-cyan-400' : 'bg-gradient-to-r from-red-500 to-orange-500'}`}
                  />
                </div>
              </div>
            </div>

            {/* Timer & Progress */}
            <div className="flex items-center justify-between">
              <div className={`text-2xl font-mono font-bold ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                {formatTime(timeLeft)}
              </div>
              <div className="text-sm text-gray-500">
                {answeredCount + 1} / {totalQuestions}
              </div>
              {combo > 2 && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-yellow-400 font-bold text-sm flex items-center gap-1"
                >
                  <Zap className="w-4 h-4" /> x{combo}
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Hit Effects */}
        <AnimatePresence>
          {hitEffect === 'boss' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              className="fixed inset-0 bg-red-500/10 pointer-events-none z-40"
            />
          )}
          {hitEffect === 'player' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              className="fixed inset-0 bg-blue-500/10 pointer-events-none z-40"
            />
          )}
        </AnimatePresence>

        {/* Question Card */}
        <div className="max-w-3xl mx-auto px-4 py-6">
          <motion.div
            key={`${currentSectionIdx}-${currentQuestionIdx}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            {/* Section badge */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500 bg-white/5 px-3 py-1 rounded-full">
                {section.name}
              </span>
              <span className="text-xs text-gray-600">{question.marks} marks</span>
            </div>

            {/* Question */}
            <div className="text-xl font-medium text-white leading-relaxed">
              {question.question}
            </div>

            {/* MCQ Options */}
            {question.type === 'mcq' && question.options && (
              <div className="space-y-3">
                {question.options.map((opt, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswer(opt)}
                    className="w-full text-left p-4 rounded-xl bg-white/5 border border-white/10 hover:border-red-500/30 hover:bg-red-950/10 transition-all text-gray-300 hover:text-white"
                  >
                    <span className="inline-block w-8 h-8 rounded-lg bg-white/5 text-center leading-8 text-sm font-bold mr-3 text-gray-500">
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                  </motion.button>
                ))}
              </div>
            )}

            {/* Subjective Answer */}
            {(question.type === 'short' || question.type === 'long' || question.type === 'very_short') && (
              <div className="space-y-4">
                <textarea
                  placeholder="Type your answer here..."
                  className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:border-red-500/30 focus:outline-none resize-none"
                  onBlur={(e) => handleAnswer(e.target.value)}
                />
                <button
                  onClick={() => {
                    const ta = document.querySelector('textarea');
                    if (ta) handleAnswer(ta.value);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-xl"
                >
                  Submit Answer
                </button>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10 transition-all text-sm"
              >
                <Lightbulb className="w-4 h-4" /> Hint
              </button>
              <button
                onClick={handleSkip}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm"
              >
                <SkipForward className="w-4 h-4" /> Skip (-5 HP)
              </button>
            </div>

            {/* Hint */}
            <AnimatePresence>
              {showHint && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-xl bg-yellow-500/5 border border-yellow-500/20 p-4"
                >
                  <p className="text-yellow-400/80 text-sm">{question.answerHint}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    );
  }

  // Victory / Defeat screens
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6"
      >
        <div className="text-6xl">{phase === 'victory' ? '🏆' : '💀'}</div>
        <h2 className={`text-4xl font-black ${phase === 'victory' ? 'text-yellow-400' : 'text-red-500'}`}>
          {phase === 'victory' ? 'BOSS DEFEATED' : 'DEFEATED'}
        </h2>
        <p className="text-gray-500">Calculating final score...</p>
      </motion.div>
    </div>
  );
}
