import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";
import { cn } from "../utils/cn";
import { ChevronDown, ChevronUp, Crown, BookOpen } from "lucide-react";

type Likelihood = "very_high" | "high" | "medium";
type QuestionType = "definition" | "short_answer" | "long_answer" | "diagram" | "numerical" | "mcq";
type Source = "pyq" | "ai";

interface LikelyQuestion {
  question: string;
  marks: number;
  type: QuestionType;
  subject: string;
  chapter: string;
  likelihood: Likelihood;
  answerHint: string;
  appearedYears: number[];
  source: Source;
}

interface ApiResponse {
  questions: LikelyQuestion[];
  weakSubjects: string[];
  generatedAt: string;
}

const LIKELIHOOD_STYLE: Record<Likelihood, string> = {
  very_high: "bg-red-100 text-red-700 border border-red-200",
  high:      "bg-amber-100 text-amber-700 border border-amber-200",
  medium:    "bg-slate-100 text-slate-600 border border-slate-200",
};
const LIKELIHOOD_LABEL: Record<Likelihood, string> = {
  very_high: "Very Likely",
  high:      "Likely",
  medium:    "Possible",
};
const SOURCE_STYLE: Record<Source, string> = {
  pyq: "bg-green-100 text-green-700 border border-green-200",
  ai:  "bg-indigo-100 text-indigo-700 border border-indigo-200",
};
const SOURCE_LABEL: Record<Source, string> = {
  pyq: "Past Paper",
  ai:  "AI Predicted",
};
const TYPE_LABEL: Record<QuestionType, string> = {
  definition:   "Definition",
  short_answer: "Short Answer",
  long_answer:  "Long Answer",
  diagram:      "Diagram",
  numerical:    "Numerical",
  mcq:          "MCQ",
};

const PRIORITY_SUBJECTS = ["Mathematics", "Science"];

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-4 space-y-3">
      <div className="flex gap-2">
        <div className="h-5 w-16 rounded-full bg-slate-200" />
        <div className="h-5 w-20 rounded-full bg-slate-200" />
        <div className="h-5 w-14 rounded-full bg-slate-200" />
      </div>
      <div className="h-4 w-full rounded bg-slate-200" />
      <div className="h-4 w-5/6 rounded bg-slate-200" />
      <div className="h-3 w-1/3 rounded bg-slate-200" />
    </div>
  );
}

function QuestionCard({ q }: { q: LikelyQuestion }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-sm">
      <div className="flex flex-wrap gap-1.5">
        <span className={cn("text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full", LIKELIHOOD_STYLE[q.likelihood])}>
          {LIKELIHOOD_LABEL[q.likelihood]}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
          {TYPE_LABEL[q.type]}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
          {q.marks} marks
        </span>
        <span className={cn("text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full ml-auto", SOURCE_STYLE[q.source])}>
          {SOURCE_LABEL[q.source]}
        </span>
      </div>

      <p className="text-sm font-semibold text-slate-800 leading-snug">{q.question}</p>

      <p className="text-[11px] text-slate-400 font-medium">📖 {q.chapter}</p>

      {q.appearedYears.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {q.appearedYears.map((yr) => (
            <span key={yr} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 border border-violet-200">
              {yr}
            </span>
          ))}
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-[11px] font-black text-blue-600 uppercase tracking-wide"
      >
        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        {open ? "Hide Hint" : "Show Answer Hint"}
      </button>

      {open && (
        <div className="rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 text-xs text-slate-700 leading-relaxed">
          {q.answerHint}
        </div>
      )}
    </div>
  );
}

export default function LikelyQuestions() {
  const { isPro, user } = useAuth();
  const [data, setData]       = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!isPro) { setLoading(false); return; }
    api.get<ApiResponse>("/api/emergency/likely-questions")
      .then(setData)
      .catch(() => setError("Failed to load questions. Please try again."))
      .finally(() => setLoading(false));
  }, [isPro]);

  if (!isPro) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-sm w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto">
            <Crown size={26} className="text-amber-500" />
          </div>
          <h2 className="text-lg font-black text-slate-800">Pro Feature</h2>
          <p className="text-sm text-slate-500">Likely Questions are available for Pro users only. Upgrade to unlock AI-predicted questions for your exams.</p>
          <Link to="/pricing" className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-sm py-3 rounded-xl transition-colors">
            Upgrade to Pro — ₹99/mo
          </Link>
          <Link to="/dashboard" className="block text-xs text-slate-400 hover:text-slate-600">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const grouped: Record<string, LikelyQuestion[]> = {};
  (data?.questions ?? []).forEach((q) => {
    (grouped[q.subject] ??= []).push(q);
  });
  const subjects = Object.keys(grouped).sort((a, b) => {
    const ai = PRIORITY_SUBJECTS.indexOf(a);
    const bi = PRIORITY_SUBJECTS.indexOf(b);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.localeCompare(b);
  });

  const noWeakSubjects = !user?.weakSubjects?.length;

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-8">
      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-6">

        <div>
          <h1 className="text-xl font-black text-slate-800">Likely Questions</h1>
          <p className="text-sm text-slate-500 mt-0.5">AI-predicted + past paper questions for your weak subjects.</p>
        </div>

        {noWeakSubjects && (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <BookOpen size={16} className="text-amber-500 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-800 font-medium">
              No weak subjects set.{" "}
              <Link to="/settings" className="font-black underline">Go to Settings</Link>{" "}
              to add them and get personalised questions.
            </p>
          </div>
        )}

        {loading && (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium">
            {error}
          </div>
        )}

        {!loading && !error && subjects.length === 0 && (
          <div className="text-center py-16 space-y-2">
            <p className="text-slate-400 font-semibold text-sm">No questions found.</p>
            <Link to="/settings" className="text-blue-600 text-xs font-black underline">
              Set weak subjects in Settings
            </Link>
          </div>
        )}

        {subjects.map((subject) => (
          <section key={subject} className="space-y-3">
            <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest px-1">
              {subject} <span className="text-slate-400 font-bold normal-case tracking-normal">({grouped[subject].length})</span>
            </h2>
            {grouped[subject].map((q, i) => (
              <QuestionCard key={i} q={q} />
            ))}
          </section>
        ))}

        {data?.generatedAt && (
          <p className="text-center text-[10px] text-slate-400 pb-4">
            Generated at {new Date(data.generatedAt).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}
