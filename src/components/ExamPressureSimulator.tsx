import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, AlertTriangle, Timer, Volume2, VolumeX } from 'lucide-react';

interface ExamPressureSimulatorProps {
  subjectName?: string;
  durationMinutes?: number;
  totalMarks?: number;
}

type Phase = 'idle' | 'running' | 'paused' | 'finished';

const WARNING_THRESHOLDS = [
  { minutes: 10, message: '10 minutes left!', intensity: 'low' },
  { minutes: 5, message: '5 MINUTES LEFT!', intensity: 'medium' },
  { minutes: 2, message: '2 MINUTES - HURRY!', intensity: 'high' },
  { minutes: 1, message: '1 MINUTE LEFT!', intensity: 'extreme' },
];

export const ExamPressureSimulator: React.FC<ExamPressureSimulatorProps> = ({
  subjectName = 'Mathematics',
  durationMinutes = 40,
  totalMarks = 40,
}) => {
  const [phase, setPhase] = useState<Phase>('idle');
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [currentWarning, setCurrentWarning] = useState<string | null>(null);
  const [shakeIntensity, setShakeIntensity] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const totalSeconds = durationMinutes * 60;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio();
      // Simple heartbeat using Web Audio API if needed
    }
  }, []);

  const playHeartbeat = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = 60; // Low heartbeat
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.5);
    } catch (e) {
      // Audio not supported
    }
  }, [soundEnabled]);

  useEffect(() => {
    if (phase === 'running' && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          const minutesLeft = Math.ceil(newTime / 60);

          // Check warnings
          const warning = WARNING_THRESHOLDS.find(w => w.minutes === minutesLeft);
          if (warning) {
            setCurrentWarning(warning.message);
            setShakeIntensity(
              warning.intensity === 'extreme' ? 4 :
              warning.intensity === 'high' ? 3 :
              warning.intensity === 'medium' ? 2 : 1
            );
            playHeartbeat();
            setTimeout(() => setCurrentWarning(null), 5000);
          }

          if (newTime <= 0) {
            setPhase('finished');
            return 0;
          }
          return newTime;
        });
      }, 1000);

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [phase, playHeartbeat]);

  const start = () => {
    setPhase('running');
    setTimeLeft(durationMinutes * 60);
    setShakeIntensity(0);
  };

  const pause = () => {
    setPhase('paused');
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const resume = () => {
    setPhase('running');
  };

  const reset = () => {
    setPhase('idle');
    setTimeLeft(durationMinutes * 60);
    setShakeIntensity(0);
    setCurrentWarning(null);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  const getBorderColor = () => {
    if (timeLeft <= 60) return 'border-red-500';
    if (timeLeft <= 300) return 'border-orange-500';
    if (timeLeft <= 600) return 'border-yellow-500';
    return 'border-white/10';
  };

  const getTimerColor = () => {
    if (timeLeft <= 60) return 'text-red-400';
    if (timeLeft <= 300) return 'text-orange-400';
    if (timeLeft <= 600) return 'text-yellow-400';
    return 'text-white';
  };

  return (
    <div 
      className={`relative overflow-hidden rounded-2xl border-2 ${getBorderColor()} bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-5 transition-all duration-200`}
      style={{
        animation: shakeIntensity > 0 ? `shake ${0.5 / shakeIntensity}s infinite` : 'none',
      }}
    >
      {/* CSS for shake animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(${-2 * shakeIntensity}px); }
          75% { transform: translateX(${2 * shakeIntensity}px); }
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-red-500/20 border border-red-500/30">
            <AlertTriangle size={14} className="text-red-400" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-red-400">Exam Pressure Mode</span>
        </div>
        <button 
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
        >
          {soundEnabled ? <Volume2 size={14} className="text-white/60" /> : <VolumeX size={14} className="text-white/60" />}
        </button>
      </div>

      {/* Subject & Marks */}
      <div className="mb-4">
        <h3 className="text-lg font-black text-white">{subjectName}</h3>
        <p className="text-xs text-white/50">{totalMarks} marks • {durationMinutes} minutes</p>
      </div>

      {/* Warning Banner */}
      {currentWarning && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/40 animate-pulse">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-400" />
            <span className="text-sm font-bold text-red-300">{currentWarning}</span>
          </div>
        </div>
      )}

      {/* Timer Display */}
      <div className="text-center mb-5">
        <div className={`text-5xl font-black tabular-nums ${getTimerColor()} transition-colors duration-300`}>
          {formatTime(timeLeft)}
        </div>
        <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-red-500 rounded-full transition-all duration-1000"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        {phase === 'idle' && (
          <button
            onClick={start}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold flex items-center justify-center gap-2 hover:from-indigo-500 hover:to-violet-500 transition-all active:scale-95"
          >
            <Play size={18} />
            Start Exam
          </button>
        )}

        {phase === 'running' && (
          <button
            onClick={pause}
            className="flex-1 py-3 rounded-xl bg-white/10 text-white font-bold flex items-center justify-center gap-2 hover:bg-white/20 transition-all active:scale-95"
          >
            <Pause size={18} />
            Pause
          </button>
        )}

        {phase === 'paused' && (
          <>
            <button
              onClick={resume}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold flex items-center justify-center gap-2 hover:from-indigo-500 hover:to-violet-500 transition-all active:scale-95"
            >
              <Play size={18} />
              Resume
            </button>
            <button
              onClick={reset}
              className="px-4 py-3 rounded-xl bg-white/10 text-white font-bold flex items-center justify-center gap-2 hover:bg-white/20 transition-all active:scale-95"
            >
              <RotateCcw size={18} />
            </button>
          </>
        )}

        {phase === 'finished' && (
          <button
            onClick={reset}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold flex items-center justify-center gap-2 hover:from-emerald-500 hover:to-green-500 transition-all active:scale-95"
          >
            <RotateCcw size={18} />
            Try Again
          </button>
        )}
      </div>

      {/* Status Text */}
      <p className="text-center text-xs text-white/40 mt-3">
        {phase === 'idle' && 'Press Start to begin timed practice'}
        {phase === 'running' && 'Stay focused. Time is ticking.'}
        {phase === 'paused' && 'Paused. Take a deep breath.'}
        {phase === 'finished' && 'Time up! Check your answers.'}
      </p>
    </div>
  );
};

export default ExamPressureSimulator;
