import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Clock, AlertTriangle, Volume2, VolumeX } from 'lucide-react';
import ExamPressureSimulator from '../components/ExamPressureSimulator';

export default function ExamPressure() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div>
            <h1 className="text-sm font-black text-white">Exam Pressure Training</h1>
            <p className="text-[10px] text-white/40">Train your mind for exam day</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Info Card */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-600/20 to-violet-600/20 p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 shrink-0">
              <AlertTriangle size={16} className="text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Why This Works</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Most students know the answers but panic in the exam hall. 
                This simulator recreates exam-day pressure so you train your mind 
                to stay calm when it matters.
              </p>
            </div>
          </div>
        </div>

        {/* Simulator */}
        <ExamPressureSimulator
          subjectName="Mathematics"
          durationMinutes={40}
          totalMarks={40}
        />

        {/* Tips */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h3 className="text-sm font-bold text-white mb-3">Exam Day Tips</h3>
          <div className="space-y-2">
            {[
              'Deep breath when you feel panic',
              'Skip hard questions, come back later',
              'Keep an eye on the clock every 10 min',
              'If stuck, mark and move - dont waste time',
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-indigo-400">{i + 1}</span>
                </div>
                <p className="text-xs text-white/70">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
