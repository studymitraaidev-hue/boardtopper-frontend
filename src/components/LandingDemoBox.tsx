import { useState } from 'react';

export default function LandingDemoBox() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [used, setUsed] = useState(false);

  const handleAsk = async () => {
    if (question.trim().length < 3) {
      setError('Please type a real question.');
      return;
    }
    setError('');
    setLoading(true);
    setAnswer('');

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/ai/demo-ask`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question }),
        }
      );
      const json = await res.json();

      if (!res.ok) {
        setError(json.error || 'Something went wrong. Try again.');
        if (res.status === 403) setUsed(true);
        setLoading(false);
        return;
      }

      setAnswer(json.data.answer);
      setUsed(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-10 p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-1">
        Try it free — ask any board exam doubt
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        No sign up needed. 1 free question.
      </p>

      {!used && (
        <div className="flex flex-col gap-3">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. Explain photosynthesis with diagram"
            className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            maxLength={1000}
          />
          <button
            onClick={handleAsk}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            {loading ? 'Thinking...' : 'Ask AI — Free'}
          </button>
        </div>
      )}

      {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

      {answer && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-800 whitespace-pre-wrap max-h-72 overflow-y-auto">
          {answer}
        </div>
      )}

      {used && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <p className="text-sm text-blue-800 font-semibold mb-2">
            Want unlimited doubts like this?
          </p>
        <a href="/signup"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg text-sm"
        >
          Create Free Account
        </a>
        </div>
      )}
    </div>
  );
}
