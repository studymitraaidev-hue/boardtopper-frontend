import { useState, useMemo } from 'react';
import { api } from '../../utils/api';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, ChevronRight, BookOpen, Award, ArrowRight } from 'lucide-react';

interface PaperQuestion {
  id: string;
  question: string;
  marks: number;
  type: 'mcq' | 'very_short' | 'short' | 'long';
  answerHint: string;
  source: 'pyq' | 'ai';
  options?: string[];
  correctIndex?: number;
  chapterId?: string;
  subjectId?: string;
  appearedYears?: number[];
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

interface ReviewScreenProps {
  paper: BuiltPaper;
  answers: Record<string, string>;
  selectedOptions: Record<string, number>;
  onComplete: () => void;
}

export default function ReviewScreen({ paper, answers, selectedOptions, onComplete }: ReviewScreenProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean[]>>({});
  const [subjectiveScores, setSubjectiveScores] = useState<Record<string, number>>({});

  // Flatten all questions with their section index and question index
  const allQuestions = useMemo(() => {
    const list: { sectionIdx: number; questionIdx: number; question: PaperQuestion; key: string }[] = [];
    paper.sections.forEach((sec, si) => {
      sec.questions.forEach((q, qi) => {
        list.push({ sectionIdx: si, questionIdx: qi, question: q, key: `${si}-${qi}` });
      });
    });
    return list;
  }, [paper]);

  const currentQ = allQuestions[currentIdx];
  const totalQuestions = allQuestions.length;

  // Parse answerHint into steps (split by newlines, numbered lists, or sentences)
  const parseSteps = (hint: string): string[] => {
    if (!hint) return [];
    // Try splitting by newlines first
    const byNewline = hint.split(/\n+/).map(s => s.trim()).filter(s => s.length > 0);
    if (byNewline.length >= 2) return byNewline;
    // Fallback: split by sentence endings
    return hint.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(s => s.length > 10);
  };

  const handleStepToggle = (qKey: string, stepIdx: number) => {
    setCheckedSteps(prev => {
      const current = prev[qKey] || [];
      const updated = [...current];
      updated[stepIdx] = !updated[stepIdx];
      return { ...prev, [qKey]: updated };
    });
  };

  const calculateSubjectiveScore = (q: PaperQuestion, qKey: string) => {
    const steps = parseSteps(q.answerHint);
    if (steps.length === 0) return q.marks; // No hint = full marks (can't verify)
    const checked = checkedSteps[qKey] || [];
    const checkedCount = checked.filter(Boolean).length;
    return Math.round((checkedCount / steps.length) * q.marks);
  };

  const handleSubjectiveSubmit = (qKey: string, q: PaperQuestion) => {
    const score = calculateSubjectiveScore(q, qKey);
    setSubjectiveScores(prev => ({ ...prev, [qKey]: score }));
  };

  const isMCQCorrect = (q: PaperQuestion, qKey: string) => {
    if (q.type !== 'mcq' || !q.options || q.correctIndex === undefined) return false;
    return selectedOptions[qKey] === q.correctIndex;
  };

  const getMCQStudentChoice = (q: PaperQuestion, qKey: string) => {
    const idx = selectedOptions[qKey];
    if (idx === undefined || !q.options) return 'Not answered';
    return `Option ${String.fromCharCode(65 + idx)}: ${q.options[idx]}`;
  };

  const getMCQCorrectChoice = (q: PaperQuestion) => {
    if (q.correctIndex === undefined || !q.options) return 'N/A';
    return `Option ${String.fromCharCode(65 + q.correctIndex)}: ${q.options[q.correctIndex]}`;
  };

  const getTotalReviewScore = () => {
    let score = 0;
    allQuestions.forEach(({ question, key }) => {
      if (question.type === 'mcq') {
        if (isMCQCorrect(question, key)) score += question.marks;
      } else {
        score += subjectiveScores[key] || 0;
      }
    });
    return score;
  };

  const getPercentage = () => {
    return Math.round((getTotalReviewScore() / paper.totalMarks) * 100);
  };

  const submitSelfChecks = async () => {
    const checks = allQuestions.map(({ question, key }) => {
      const marksPossible = question.marks;
      let marksAwarded = 0;
      if (question.type === 'mcq') {
        marksAwarded = isMCQCorrect(question, key) ? marksPossible : 0;
      } else {
        marksAwarded = subjectiveScores[key] ?? 0;
      }
      return {
        questionId: question.id,
        marksAwarded,
        marksPossible,
      };
    });

    try {
      await api.post('/api/self-checks', {
        subjectId: paper.subjectId,
        checks,
      });
      console.log('[ReviewScreen] Self-checks submitted');
    } catch (err) {
      console.error('[ReviewScreen] Failed to submit self-checks:', err);
    }
  };

  const handleFinish = async () => {
    await submitSelfChecks();
    onComplete();
  };

  if (!currentQ) return null;

  const { question, key, sectionIdx } = currentQ;
  const steps = parseSteps(question.answerHint);
  const isMCQ = question.type === 'mcq';
  const mcqCorrect = isMCQCorrect(question, key);
  const hasSubjectiveScore = subjectiveScores[key] !== undefined;

  return (
    <div className="min-h-screen bg-black text-white px-4 py-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              Review Answers
            </h2>
            <p className="text-gray-500 text-sm">Question {currentIdx + 1} of {totalQuestions}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-yellow-400">{getPercentage()}%</div>
            <div className="text-gray-500 text-xs">Self-checked score</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-white/10 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all"
            style={{ width: `${((currentIdx + 1) / totalQuestions) * 100}%` }}
          />
        </div>

        {/* Question Card */}
        <motion.div
          key={key}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          {/* Section badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 bg-white/5 px-3 py-1 rounded-full">
              {paper.sections[sectionIdx].name}
            </span>
            <span className="text-xs text-gray-600">{question.marks} marks</span>
            <span className="text-xs text-gray-600 capitalize">{question.type.replace('_', ' ')}</span>
          </div>

          {/* Question text */}
          <div className="text-lg font-medium leading-relaxed">
            {question.question}
          </div>

          {/* MCQ Review */}
          {isMCQ && question.options && (
            <div className="space-y-3">
              <div className={`p-4 rounded-xl border ${mcqCorrect ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {mcqCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                  <span className={`font-bold ${mcqCorrect ? 'text-green-400' : 'text-red-400'}`}>
                    {mcqCorrect ? 'Correct!' : 'Wrong'}
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-400">Your answer: <span className="text-white">{getMCQStudentChoice(question, key)}</span></p>
                  {!mcqCorrect && (
                    <p className="text-gray-400">Correct answer: <span className="text-green-400">{getMCQCorrectChoice(question)}</span></p>
                  )}
                </div>
              </div>

              {/* Answer hint if available */}
              {question.answerHint && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Explanation</p>
                  <p className="text-sm text-gray-300 leading-relaxed">{question.answerHint}</p>
                </div>
              )}
            </div>
          )}

          {/* Subjective Review */}
          {!isMCQ && (
            <div className="space-y-4">
              {/* Student's answer */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Your Answer</p>
                <p className="text-sm text-gray-300 whitespace-pre-wrap">
                  {answers[key] || <span className="text-gray-600 italic">No answer provided</span>}
                </p>
              </div>

              {/* Model answer steps */}
              <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                <p className="text-xs font-medium text-blue-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Model Answer — Check steps you included
                </p>
                {steps.length > 0 ? (
                  <div className="space-y-2">
                    {steps.map((step, i) => (
                      <label
                        key={i}
                        className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={!!(checkedSteps[key] || [])[i]}
                          onChange={() => handleStepToggle(key, i)}
                          className="mt-1 w-4 h-4 rounded border-gray-600 text-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-300 leading-relaxed">{step}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No step-by-step solution available for this question.</p>
                )}

                {/* Submit self-check */}
                {!hasSubjectiveScore && steps.length > 0 && (
                  <button
                    onClick={() => handleSubjectiveSubmit(key, question)}
                    className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors"
                  >
                    Submit Self-Check
                  </button>
                )}

                {/* Show score after submit */}
                {hasSubjectiveScore && (
                  <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                    <p className="text-green-400 font-bold text-sm">
                      Self-checked: {subjectiveScores[key]} / {question.marks} marks
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      Based on {((checkedSteps[key] || []).filter(Boolean).length)} of {steps.length} steps checked
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4">
          <button
            onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
            disabled={currentIdx === 0}
            className="px-4 py-2 bg-white/5 text-gray-400 rounded-lg disabled:opacity-30 hover:bg-white/10 transition-colors"
          >
            Previous
          </button>

          {currentIdx < totalQuestions - 1 ? (
            <button
              onClick={() => setCurrentIdx(prev => prev + 1)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg flex items-center gap-2 transition-colors"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-lg flex items-center gap-2 transition-colors"
            >
              Finish Review <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Question dots */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {allQuestions.map(({ key: k }, i) => {
            const q = allQuestions[i].question;
            const isDone = q.type === 'mcq' ? true : subjectiveScores[k] !== undefined;
            const isCorrect = q.type === 'mcq' ? isMCQCorrect(q, k) : isDone;
            return (
              <button
                key={k}
                onClick={() => setCurrentIdx(i)}
                className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
                  i === currentIdx
                    ? 'bg-blue-500 text-white scale-110'
                    : isDone
                    ? isCorrect
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                    : 'bg-white/5 text-gray-600'
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
