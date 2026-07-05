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
    <div style={{
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      borderRadius: '24px',
      padding: '2px',
      maxWidth: '720px',
      margin: '0 auto 48px auto',
      boxShadow: '0 25px 60px rgba(99,102,241,0.25)',
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #13111c, #1e1b2e)',
        borderRadius: '22px',
        padding: '36px 32px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: '-60px',
          right: '-60px',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }} />

        <div style={{ marginBottom: '16px' }}>
          <span style={{
            background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
            color: 'white',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.1em',
            padding: '4px 12px',
            borderRadius: '99px',
            textTransform: 'uppercase',
          }}>
            Free Trial - No Sign Up Needed
          </span>
        </div>

        <h2 style={{
          color: 'white',
          fontSize: '22px',
          fontWeight: 800,
          margin: '0 0 6px 0',
          lineHeight: 1.3,
        }}>
          Ask any board exam doubt - instantly
        </h2>
        <p style={{
          color: 'rgba(255,255,255,0.5)',
          fontSize: '14px',
          margin: '0 0 24px 0',
        }}>
          Powered by AI trained for Maharashtra SSC board pattern
        </p>

        {!used && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '14px',
              padding: '4px',
            }}>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g. Explain photosynthesis with diagram"
                rows={3}
                maxLength={1000}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'white',
                  fontSize: '15px',
                  padding: '12px 14px',
                  resize: 'none',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <button
              onClick={handleAsk}
              disabled={loading}
              style={{
                background: loading
                  ? 'rgba(99,102,241,0.4)'
                  : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '14px',
                fontSize: '15px',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {loading ? 'AI is thinking...' : 'Ask AI - Free'}
            </button>
          </div>
        )}

        {error && (
          <p style={{ color: '#f87171', fontSize: '13px', marginTop: '12px' }}>
            {error}
          </p>
        )}

        {answer && (
          <div style={{
            marginTop: '20px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: '14px',
            padding: '16px 18px',
            color: 'rgba(255,255,255,0.85)',
            fontSize: '14px',
            lineHeight: 1.7,
            maxHeight: '240px',
            overflowY: 'auto',
            whiteSpace: 'pre-wrap',
          }}>
            <div style={{
              fontSize: '11px',
              color: '#818cf8',
              fontWeight: 600,
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}>
              AI Answer
            </div>
            {answer}
          </div>
        )}

        {used && (
          <div style={{
            marginTop: '20px',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: '14px',
            padding: '20px',
            textAlign: 'center',
          }}>
            <p style={{
              color: 'white',
              fontWeight: 700,
              fontSize: '16px',
              margin: '0 0 4px 0',
            }}>
              Want unlimited doubts like this?
            </p>
            <p style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: '13px',
              margin: '0 0 16px 0',
            }}>
              Get 3 free doubts every hour - no credit card needed
            </p>
            
              <a href="/signup"
              style={{
                display: 'inline-block',
                background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                color: 'white',
                fontWeight: 700,
                fontSize: '14px',
                padding: '12px 28px',
                borderRadius: '10px',
                textDecoration: 'none',
              }}
            >
              Create Free Account
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
