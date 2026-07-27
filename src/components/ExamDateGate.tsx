import { useState } from 'react';
import { Calendar, ArrowRight, Clock, AlertCircle } from 'lucide-react';
import { api } from '../utils/api';

interface ExamDateGateProps {
  userName: string;
  onDateSet: (date: string) => void;
}

export default function ExamDateGate({ userName, onDateSet }: ExamDateGateProps) {
  const [date, setDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    if (!date) { setError('Please select your exam date'); return; }
    const selected = new Date(date);
    const now = new Date();
    if (selected < now) { setError('Exam date must be in the future'); return; }
    setSaving(true); setError('');
    try {
      await api.patch('/api/auth/me', { examDate: date });
      onDateSet(date);
    } catch { setError('Failed to save. Please try again.'); }
    finally { setSaving(false); }
  }

  const quickDates = [
    { label: 'Tomorrow', days: 1 }, { label: '3 Days', days: 3 },
    { label: '1 Week', days: 7 }, { label: '2 Weeks', days: 14 }, { label: '1 Month', days: 30 },
  ];

  function setQuickDate(days: number) {
    const d = new Date(); d.setDate(d.getDate() + days);
    setDate(d.toISOString().split('T')[0]); setError('');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-7 h-7 text-indigo-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Welcome, {userName}</h1>
          <p className="text-gray-500 text-sm mt-1">Set your exam date to get a personalized study plan</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">When is your exam?</label>
            <input type="date" value={date} onChange={(e) => { setDate(e.target.value); setError(''); }}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="flex flex-wrap gap-2">
            {quickDates.map((qd) => (
              <button key={qd.days} onClick={() => setQuickDate(qd.days)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition">{qd.label}</button>
            ))}
          </div>
          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}
          <button onClick={handleSave} disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 rounded-xl transition">
            {saving ? <Clock className="w-4 h-4 animate-spin" /> : <>Build My Study Plan <ArrowRight className="w-4 h-4" /></>}
          </button>
          <button onClick={() => onDateSet('')} className="w-full text-gray-400 hover:text-gray-600 text-sm py-2 transition">Skip for now</button>
        </div>
      </div>
    </div>
  );
}
