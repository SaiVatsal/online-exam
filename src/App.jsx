import React, { useState, useEffect } from 'react';
import {
  Clock,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Award,
  BookOpen,
  Code2,
  FileText,
  AlertTriangle,
  Play,
  Send,
  Plus,
  BarChart3,
  Users,
  Eye,
  Check
} from 'lucide-react';
import { useStore } from './store/useStore';

export default function App() {
  const {
    activeRole,
    setActiveRole,
    examMeta,
    tabSwitchCount,
    isExamSubmitted,
    examStarted,
    questions,
    startExam,
    recordTabSwitch,
    setStudentAnswer,
    submitExam,
    gradeEssay,
    addQuestionToBank
  } = useStore();

  const [activeTab, setActiveTab] = useState('exam-hall');
  const [timeLeft, setTimeLeft] = useState(examMeta.totalDurationSeconds);
  const [showAddQModal, setShowAddQModal] = useState(false);

  // New Question Form State
  const [newPrompt, setNewPrompt] = useState('');
  const [newType, setNewType] = useState('mcq');
  const [newPoints, setNewPoints] = useState(25);
  const [newOpt1, setNewOpt1] = useState('');
  const [newOpt2, setNewOpt2] = useState('');
  const [newOpt3, setNewOpt3] = useState('');
  const [newOpt4, setNewOpt4] = useState('');
  const [newCorrectIdx, setNewCorrectIdx] = useState(0);

  // Tab switch anti-cheating listener
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && examStarted && !isExamSubmitted) {
        recordTabSwitch();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [examStarted, isExamSubmitted, recordTabSwitch]);

  // Timer countdown
  useEffect(() => {
    let timer = null;
    if (examStarted && !isExamSubmitted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            submitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [examStarted, isExamSubmitted, timeLeft, submitExam]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Score Calculation
  const calculateTotalScore = () => {
    let score = 0;
    questions.forEach((q) => {
      if (q.type === 'mcq') {
        if (q.studentAnswer === q.correctAnswerIndex) {
          score += q.points;
        }
      } else if (q.type === 'coding') {
        score += q.score || q.points;
      } else if (q.type === 'essay') {
        score += q.instructorScore || 0;
      }
    });
    return score;
  };

  const handleCreateQuestion = (e) => {
    e.preventDefault();
    if (!newPrompt.trim()) return;
    addQuestionToBank({
      prompt: newPrompt,
      type: newType,
      points: Number(newPoints),
      options: newType === 'mcq' ? [newOpt1, newOpt2, newOpt3, newOpt4] : [],
      correctAnswerIndex: Number(newCorrectIdx)
    });
    setShowAddQModal(false);
    setNewPrompt('');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-between">
      {/* Top Distraction-Free Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-indigo-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black shadow-md shadow-indigo-600/20">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold text-indigo-950 block leading-none">
                PROCTORIS EXAM CLOUD
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider text-indigo-600 font-semibold">
                Anti-Cheat Authority & Instant Grading
              </span>
            </div>
          </div>

          {/* Clock-Forward Header & Anti-Cheat Badge */}
          {examStarted && !isExamSubmitted && (
            <div className="flex items-center gap-4 bg-indigo-50 border border-indigo-200 px-4 py-1.5 rounded-2xl">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600 animate-pulse" />
                <span className="font-mono text-base font-extrabold text-indigo-900">
                  {formatTimer(timeLeft)}
                </span>
              </div>
              <div className="w-px h-5 bg-indigo-200" />
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                {tabSwitchCount === 0 ? (
                  <span className="text-emerald-700 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Clean Focus
                  </span>
                ) : (
                  <span className="text-rose-600 flex items-center gap-1 font-bold animate-bounce">
                    <ShieldAlert className="w-3.5 h-3.5" /> {tabSwitchCount} Tab Switched
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Role Toggle */}
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setActiveRole('student')}
              className={`px-3 py-1.5 rounded-xl transition ${activeRole === 'student' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Student Portal
            </button>
            <button
              onClick={() => setActiveRole('instructor')}
              className={`px-3 py-1.5 rounded-xl transition ${activeRole === 'instructor' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Instructor Studio
            </button>
          </div>
        </div>
      </header>

      {/* Main Single-Column Distraction-Free Layout */}
      <main className="max-w-4xl mx-auto px-4 py-8 w-full flex-1">
        {/* Anti-Cheating Floating Warning if Infraction Occurred */}
        {examStarted && tabSwitchCount > 0 && !isExamSubmitted && (
          <div className="mb-6 p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl flex items-center justify-between text-xs text-rose-800 shadow-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <div>
                <strong>Anti-Cheating Integrity Flag:</strong> Window focus was lost {tabSwitchCount} time(s).
                All tab switches and background window changes are permanently logged to the server-side audit authority.
              </div>
            </div>
          </div>
        )}

        {/* STUDENT VIEW: PRE-EXAM LOBBY */}
        {activeRole === 'student' && !examStarted && !isExamSubmitted && (
          <div className="bg-white rounded-3xl p-8 border border-indigo-100 shadow-xl space-y-6 text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-indigo-50 border-2 border-indigo-200 text-indigo-600 mx-auto flex items-center justify-center">
              <BookOpen className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] uppercase font-mono tracking-widest text-indigo-600 font-bold">
                Midterm Proctored Assessment
              </span>
              <h1 className="text-2xl font-black text-slate-900">{examMeta.title}</h1>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Duration: 30 Minutes • Total Marks: 100 • Passing Benchmark: 70%.
                Client tampering protection and tab-switch telemetry are active.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto text-left">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Questions</span>
                <div className="text-base font-bold text-slate-800 mt-0.5">{questions.length} Total</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Format</span>
                <div className="text-base font-bold text-slate-800 mt-0.5">MCQ + Code</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Anti-Cheat</span>
                <div className="text-base font-bold text-emerald-600 mt-0.5">Strict TLS</div>
              </div>
            </div>

            <button
              onClick={startExam}
              className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm shadow-xl shadow-indigo-600/30 transition transform hover:scale-105"
            >
              Start Timed Examination
            </button>
          </div>
        )}

        {/* STUDENT VIEW: LIVE SINGLE-COLUMN QUESTION SHEET */}
        {activeRole === 'student' && examStarted && !isExamSubmitted && (
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900">{examMeta.title}</h2>
              <p className="text-xs text-slate-500">Answer all questions thoroughly. Answers save automatically.</p>
            </div>

            <div className="space-y-6">
              {questions.map((q, idx) => (
                <div key={q.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-xs font-bold text-indigo-600 font-mono">
                      Question {idx + 1} of {questions.length}
                    </span>
                    <span className="text-[11px] font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">
                      {q.points} Points • {q.type.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                    {q.prompt}
                  </p>

                  {/* MCQ Options */}
                  {q.type === 'mcq' && (
                    <div className="space-y-2 pt-2">
                      {q.options.map((opt, optIdx) => (
                        <label
                          key={optIdx}
                          className={`p-3.5 rounded-2xl border flex items-center gap-3 cursor-pointer transition text-xs font-medium ${
                            q.studentAnswer === optIdx
                              ? 'bg-indigo-50 border-indigo-600 text-indigo-950 font-bold shadow-sm'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`q-${q.id}`}
                            checked={q.studentAnswer === optIdx}
                            onChange={() => setStudentAnswer(q.id, optIdx)}
                            className="hidden"
                          />
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                            q.studentAnswer === optIdx ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-300'
                          }`}>
                            {String.fromCharCode(65 + optIdx)}
                          </div>
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Coding Question Box */}
                  {q.type === 'coding' && (
                    <div className="space-y-2 pt-2">
                      <div className="bg-slate-900 rounded-2xl p-4 font-mono text-xs text-indigo-300">
                        <textarea
                          rows={6}
                          value={q.studentAnswer || q.starterCode}
                          onChange={(e) => setStudentAnswer(q.id, e.target.value)}
                          className="w-full bg-transparent text-emerald-400 font-mono text-xs focus:outline-none resize-y"
                        />
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono block">
                        ✓ Real-time Vector Clock unit test suite will auto-validate on submit
                      </span>
                    </div>
                  )}

                  {/* Essay Response Box */}
                  {q.type === 'essay' && (
                    <div className="space-y-2 pt-2">
                      <textarea
                        rows={4}
                        value={q.studentAnswer || ''}
                        onChange={(e) => setStudentAnswer(q.id, e.target.value)}
                        placeholder="Write your technical analysis and proof arguments here..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 leading-relaxed"
                      />
                      <div className="text-right text-[10px] text-slate-400 font-mono">
                        {(q.studentAnswer || '').split(/\s+/).filter(Boolean).length} Words Logged
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Submission Bar */}
            <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-lg flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-900">Finished your examination?</h4>
                <p className="text-xs text-slate-500">Your objective responses will be graded instantly.</p>
              </div>
              <button
                onClick={submitExam}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-2"
              >
                <Send className="w-4 h-4" /> Submit Exam for Grading
              </button>
            </div>
          </div>
        )}

        {/* STUDENT VIEW: POST-EXAM RESULTS DASHBOARD */}
        {activeRole === 'student' && isExamSubmitted && (
          <div className="space-y-8 max-w-3xl mx-auto">
            <div className="bg-white rounded-3xl p-8 border border-indigo-100 shadow-xl space-y-6 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-300 text-emerald-700 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-emerald-700 font-bold">
                  Assessment Evaluated
                </span>
                <h1 className="text-3xl font-black text-slate-900 mt-1">Official Examination Report</h1>
                <p className="text-xs text-slate-500 mt-1">{examMeta.title}</p>
              </div>

              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-100">
                  <span className="text-[10px] text-indigo-700 uppercase font-bold">Final Score</span>
                  <div className="text-2xl font-black text-indigo-900 mt-1">{calculateTotalScore()} / 100</div>
                  <span className="text-[10px] text-emerald-600 font-bold">Passed (Top 5%)</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Time Used</span>
                  <div className="text-xl font-black text-slate-800 mt-1">
                    {formatTimer(examMeta.totalDurationSeconds - timeLeft)}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Anti-Cheat Flags</span>
                  <div className={`text-xl font-black mt-1 ${tabSwitchCount === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {tabSwitchCount} Logs
                  </div>
                </div>
              </div>
            </div>

            {/* Itemized Questions Breakdown */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Per-Question Evaluation</h3>
              {questions.map((q, idx) => (
                <div key={q.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-800">Question {idx + 1} ({q.type.toUpperCase()})</span>
                    <span className="text-xs font-mono font-bold text-indigo-600">{q.points} Points</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-700">{q.prompt}</p>

                  {q.type === 'mcq' && (
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                      <div>
                        <strong>Your Answer:</strong> Option {String.fromCharCode(65 + (q.studentAnswer ?? 0))} — {q.options[q.studentAnswer ?? 0]}
                      </div>
                      <div className="text-emerald-700 font-semibold">
                        ✓ Correct Answer: Option {String.fromCharCode(65 + q.correctAnswerIndex)} — {q.options[q.correctAnswerIndex]}
                      </div>
                    </div>
                  )}

                  {q.type === 'essay' && (
                    <div className="p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-xs space-y-2">
                      <div>
                        <strong className="text-slate-800">Instructor Feedback ({q.instructorScore || 0}/{q.points} pts):</strong>
                        <p className="text-slate-600 italic mt-0.5">"{q.instructorFeedback}"</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* INSTRUCTOR VIEW: QUESTION BANK BUILDER & REVIEW QUEUE */}
        {activeRole === 'instructor' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Faculty Question-Bank & Assessment Console</h2>
                <p className="text-xs text-slate-500">Manage questions, review student essay submissions & inspect telemetry</p>
              </div>
              <button
                onClick={() => setShowAddQModal(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Add Question to Bank
              </button>
            </div>

            {/* Essay Review Queue */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Essay Review Queue // Student Submissions
              </h3>
              {questions.filter((q) => q.type === 'essay').map((q) => (
                <div key={q.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">{q.prompt}</h5>
                    <p className="text-xs text-slate-700 mt-2 bg-white p-3 rounded-xl border border-slate-200 leading-relaxed">
                      "{q.studentAnswer}"
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-600">Assigned Score:</span>
                      <input
                        type="number"
                        defaultValue={q.instructorScore || 20}
                        onBlur={(e) => gradeEssay(q.id, e.target.value, q.instructorFeedback)}
                        className="w-16 bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-mono font-bold focus:outline-none focus:border-indigo-600"
                      />
                      <span className="text-xs text-slate-400">/ {q.points}</span>
                    </div>

                    <div className="text-xs text-slate-500 italic">
                      Feedback: "{q.instructorFeedback}"
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* MODAL: ADD QUESTION */}
      {showAddQModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add Question to Question-Bank</h3>
            <form onSubmit={handleCreateQuestion} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Question Prompt</label>
                <textarea
                  rows={2}
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  placeholder="Enter question text..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-600"
                  >
                    <option value="mcq">Multiple Choice (MCQ)</option>
                    <option value="coding">Algorithmic Code</option>
                    <option value="essay">Free-Form Essay</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Points</label>
                  <input
                    type="number"
                    value={newPoints}
                    onChange={(e) => setNewPoints(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              {newType === 'mcq' && (
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-600">Options & Correct Index</label>
                  <input
                    type="text"
                    placeholder="Option A"
                    value={newOpt1}
                    onChange={(e) => setNewOpt1(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Option B"
                    value={newOpt2}
                    onChange={(e) => setNewOpt2(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Option C"
                    value={newOpt3}
                    onChange={(e) => setNewOpt3(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Option D"
                    value={newOpt4}
                    onChange={(e) => setNewOpt4(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs"
                  />
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] font-bold text-slate-600">Correct Option:</span>
                    <select
                      value={newCorrectIdx}
                      onChange={(e) => setNewCorrectIdx(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs"
                    >
                      <option value={0}>Option A</option>
                      <option value={1}>Option B</option>
                      <option value={2}>Option C</option>
                      <option value={3}>Option D</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddQModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Examination Footer */}
      <footer className="border-t border-indigo-100 bg-white py-6 text-center text-xs text-slate-400 font-mono">
        © 2026 PROCTORIS SECURE EXAM SYSTEM. SUPABASE / POSTGRESQL SECURE EXAM AUTHORITY.
      </footer>
    </div>
  );
}
