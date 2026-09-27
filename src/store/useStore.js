import { create } from 'zustand';

export const useStore = create((set, get) => ({
  activeRole: 'student', // 'student' | 'instructor'
  setActiveRole: (role) => set({ activeRole: role }),

  examMeta: {
    title: 'CS-804: Distributed Consensus & Fault-Tolerant Systems',
    totalDurationSeconds: 1800, // 30 mins
    totalPoints: 100,
    passingScore: 70,
    antiCheatEnabled: true
  },

  tabSwitchCount: 0,
  isExamSubmitted: false,
  examStarted: false,
  timeRemaining: 1800,

  questions: [
    {
      id: 'q1',
      type: 'mcq',
      points: 25,
      prompt: 'In the Raft consensus algorithm, which condition triggers a Leader Election cycle?',
      options: [
        'A Heartbeat RPC timeout expires on a Follower node',
        'A Client initiates a write transaction during a network partition',
        'The majority quorum shrinks below 3 active replicas',
        'A Candidate node receives duplicate AppendEntries requests'
      ],
      correctAnswerIndex: 0,
      studentAnswer: null
    },
    {
      id: 'q2',
      type: 'mcq',
      points: 25,
      prompt: 'What is the theoretical fault tolerance limit for Practical Byzantine Fault Tolerance (PBFT) in a network of N nodes?',
      options: [
        'Up to (N - 1) / 3 Byzantine nodes',
        'Up to (N - 1) / 2 Byzantine nodes',
        'Up to 2N / 3 Byzantine nodes',
        'Strictly 1 Byzantine node regardless of N'
      ],
      correctAnswerIndex: 0,
      studentAnswer: null
    },
    {
      id: 'q3',
      type: 'coding',
      points: 25,
      prompt: 'Implement an idempotent vector clock merge function in JavaScript/TypeScript.',
      starterCode: 'function mergeVectorClocks(clockA, clockB) {\n  // return merged vector clock containing max tick per node\n}',
      studentAnswer: 'function mergeVectorClocks(clockA, clockB) {\n  const result = { ...clockA };\n  for (const [node, tick] of Object.entries(clockB)) {\n    result[node] = Math.max(result[node] || 0, tick);\n  }\n  return result;\n}',
      autoGraded: true,
      score: 25
    },
    {
      id: 'q4',
      type: 'essay',
      points: 25,
      prompt: 'Compare the CAP Theorem tradeoffs between Google Spanner (TrueTime synchronized atomic clocks) and CockroachDB (hybrid logical clocks).',
      studentAnswer: 'Google Spanner utilizes GPS receivers and atomic clocks to provide bounded uncertainty (TrueTime API), ensuring strict serializability without coordinating with all replicas. In contrast, CockroachDB uses Hybrid Logical Clocks (HLC) which avoids hardware dependency but relies on clock offset bounds and may incur transaction restarts during high contention.',
      manualGraded: true,
      instructorScore: 23,
      instructorFeedback: 'Rigorous comparison with precise understanding of TrueTime vs HLC clock skew handling.'
    }
  ],

  // Actions
  startExam: () => set({ examStarted: true, isExamSubmitted: false, tabSwitchCount: 0 }),

  recordTabSwitch: () => set((state) => {
    if (!state.examStarted || state.isExamSubmitted) return {};
    return { tabSwitchCount: state.tabSwitchCount + 1 };
  }),

  setStudentAnswer: (questionId, answer) => set((state) => ({
    questions: state.questions.map((q) =>
      q.id === questionId ? { ...q, studentAnswer: answer } : q
    )
  })),

  submitExam: () => set((state) => {
    return {
      isExamSubmitted: true,
      examStarted: false
    };
  }),

  gradeEssay: (questionId, score, feedback) => set((state) => ({
    questions: state.questions.map((q) =>
      q.id === questionId
        ? { ...q, instructorScore: Number(score), instructorFeedback: feedback, manualGraded: true }
        : q
    )
  })),

  addQuestionToBank: (newQ) => set((state) => ({
    questions: [
      ...state.questions,
      {
        id: `q-${Date.now()}`,
        type: newQ.type,
        points: Number(newQ.points) || 20,
        prompt: newQ.prompt,
        options: newQ.options || [],
        correctAnswerIndex: newQ.correctAnswerIndex || 0,
        studentAnswer: null
      }
    ]
  }))
}));
