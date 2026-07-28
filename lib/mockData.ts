import rawDiagnosis from './Diagnosis.json';
import rawQuiz from './Quiz.json';
import rawChapters from './subject_and_chapters.json';

export interface TieredTopic {
  topic_id: string;
  topic_name: string;
  is_completed: boolean;
  is_quiz?: boolean;
}

export interface Chapter {
  chapter_id: string;
  chapter_number: number;
  chapter_name: string;
  beginnerTopics: TieredTopic[];
  intermediateTopics: TieredTopic[];
  advancedTopics: TieredTopic[];
  topics?: TieredTopic[];
}

export interface Subject {
  subject_id: string;
  subject_name: string;
  standard: string;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'yellow' | 'orange';
  progress: number;
  chapters: Chapter[];
}

export interface DiagnosticQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  points: number;
  question_id?: string;
  correct_index?: number;
}

export interface QuizQuestion {
  question_id: string;
  text: string;
  options: string[];
  correct_index: number;
  solution_explanation: string;
}

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: 'yellow' | 'green' | 'purple' | 'orange' | 'blue';
}

export const badgeDefinitions: Record<string, BadgeDefinition> = {
  FLAWLESS: {
    id: 'FLAWLESS',
    name: 'Flawless Master',
    description: 'Perfect evaluation score on first attempt',
    icon: '⚡',
    color: 'yellow',
  },
  PERSEVERANCE: {
    id: 'PERSEVERANCE',
    name: 'Perseverance Star',
    description: 'Demonstrated concept mastery through review loop',
    icon: '🌟',
    color: 'purple',
  },
  ADVANCED_MASTER: {
    id: 'ADVANCED_MASTER',
    name: 'Advanced Champion',
    description: 'Mastered the highest difficulty tier',
    icon: '👑',
    color: 'orange',
  },
};

// HELPER: Normalizes question options & computes correct_index
function formatOptionsAndAnswer(rawOptions: string[], rawAnswer: string) {
  let options = [...rawOptions];

  if (!options || options.length === 0) {
    if (rawAnswer === 'True' || rawAnswer === 'False') {
      options = ['True', 'False'];
    } else {
      options = [rawAnswer, 'Option B', 'Option C', 'Option D'];
    }
  }

  let correct_index = options.findIndex((opt) => opt === rawAnswer);
  if (correct_index === -1) {
    correct_index = options.findIndex(
      (opt) =>
        opt.toLowerCase().includes(rawAnswer.toLowerCase()) ||
        rawAnswer.toLowerCase().includes(opt.toLowerCase())
    );
  }
  if (correct_index === -1) {
    correct_index = 0;
  }

  return { options, correct_index };
}

// HELPER: Fetch dynamic diagnostic questions from Diagnosis.json
export function getDiagnosticQuestions(subjectId?: string, chapterId?: string): DiagnosticQuestion[] {
  const filtered = (rawDiagnosis as any[]).filter((q) => {
    if (!subjectId && !chapterId) return true;

    const subjMatch =
      !subjectId ||
      (subjectId === 'math' && q.subject === 'Mathematics') ||
      (subjectId === 'science' && q.subject === 'Environmental Science') ||
      (subjectId === 'english' && q.subject === 'English');

    const chapMatch =
      !chapterId ||
      (chapterId === 'chap_01' && (q.chapter.includes('1') || q.chapter.includes('Parts'))) ||
      (chapterId === 'chap_02' && (q.chapter.includes('2') || q.chapter.includes('Shapes'))) ||
      (chapterId === 'chap_03' && (q.chapter.includes('1') || q.chapter.includes('Matter'))) ||
      (chapterId === 'chap_04' && (q.chapter.includes('2') || q.chapter.includes('Beyond')));

    return subjMatch && chapMatch;
  });

  const list = filtered.length > 0 ? filtered : (rawDiagnosis as any[]).slice(0, 5);

  return list.map((q, idx) => {
    const { options, correct_index } = formatOptionsAndAnswer(q.options || [], q.correct_answer);
    return {
      id: `diag_q${idx + 1}`,
      question_id: `diag_q${idx + 1}`,
      text: q.question,
      options,
      correctAnswer: q.correct_answer,
      correct_index,
      points: q.points || 50,
    };
  });
}

// HELPER: Fetch dynamic quiz questions from Quiz.json
export function getQuizQuestions(subjectId?: string, chapterId?: string, levelId?: string): QuizQuestion[] {
  const targetLevel = (levelId || 'BEGINNER').toUpperCase();

  const filtered = (rawQuiz as any[]).filter((q) => {
    const levelMatch = !levelId || q.difficulty.toUpperCase() === targetLevel;

    const subjMatch =
      !subjectId ||
      (subjectId === 'math' && q.subject === 'Mathematics') ||
      (subjectId === 'science' && q.subject === 'Environmental Science') ||
      (subjectId === 'english' && q.subject === 'English');

    const chapMatch =
      !chapterId ||
      (chapterId === 'chap_01' && (q.chapter.includes('1') || q.chapter.includes('Parts'))) ||
      (chapterId === 'chap_02' && (q.chapter.includes('2') || q.chapter.includes('Shapes'))) ||
      (chapterId === 'chap_03' && (q.chapter.includes('1') || q.chapter.includes('Matter'))) ||
      (chapterId === 'chap_04' && (q.chapter.includes('2') || q.chapter.includes('Beyond')));

    return levelMatch && subjMatch && chapMatch;
  });

  const list = filtered.length > 0 ? filtered : (rawQuiz as any[]).filter((q) => q.difficulty.toUpperCase() === targetLevel);
  const finalList = list.length > 0 ? list : (rawQuiz as any[]).slice(0, 5);

  return finalList.map((q, idx) => {
    const { options, correct_index } = formatOptionsAndAnswer(q.options || [], q.correct_answer);
    return {
      question_id: `quiz_q${idx + 1}`,
      text: q.question,
      options,
      correct_index,
      solution_explanation: `Concept: ${q.topic || 'Mastery Evaluation'}. The correct answer is ${q.correct_answer}.`,
    };
  });
}

// Build Chapter Objects dynamically from subject_and_chapters.json
function buildChaptersForSubject(subjectName: string, prefix: string): Chapter[] {
  const rawList = (rawChapters as any[]).filter((item) => item.subject === subjectName);
  return rawList.map((item) => {
    const chapNumStr = item.chapter_number < 10 ? `0${item.chapter_number}` : `${item.chapter_number}`;
    const chapter_id = `chap_${chapNumStr}`;

    return {
      chapter_id,
      chapter_number: item.chapter_number,
      chapter_name: item.title,
      beginnerTopics: [
        { topic_id: 'BEGINNER', topic_name: `Foundations of ${item.title}`, is_completed: false }
      ],
      intermediateTopics: [
        { topic_id: 'INTERMEDIATE', topic_name: `Core Concepts of ${item.title}`, is_completed: false }
      ],
      advancedTopics: [
        { topic_id: 'ADVANCED', topic_name: `Advanced Applications of ${item.title}`, is_completed: false }
      ]
    };
  });
}

const mathChapters = buildChaptersForSubject('Mathematics', 'math');
const scienceChapters = buildChaptersForSubject('Environmental Science', 'science');

const englishChapters: Chapter[] = [
  {
    chapter_id: 'chap_01',
    chapter_number: 1,
    chapter_name: 'Grammar & Vocabulary',
    beginnerTopics: [{ topic_id: 'BEGINNER', topic_name: 'Nouns & Verbs', is_completed: false }],
    intermediateTopics: [{ topic_id: 'INTERMEDIATE', topic_name: 'Verb Tenses', is_completed: false }],
    advancedTopics: [{ topic_id: 'ADVANCED', topic_name: 'Complex Sentence Structure', is_completed: false }],
  },
  {
    chapter_id: 'chap_02',
    chapter_number: 2,
    chapter_name: 'Reading Comprehension',
    beginnerTopics: [{ topic_id: 'BEGINNER', topic_name: 'Main Idea & Details', is_completed: false }],
    intermediateTopics: [{ topic_id: 'INTERMEDIATE', topic_name: 'Inferences & Context Clues', is_completed: false }],
    advancedTopics: [{ topic_id: 'ADVANCED', topic_name: 'Author Intent & Themes', is_completed: false }],
  }
];

export const diagnosticQuestions = getDiagnosticQuestions('math', 'chap_01');
export const quizQuestions = getQuizQuestions('math', 'chap_01', 'BEGINNER');

export const mockData = {
  student: {
    name: 'Alex Student',
    xp: 150,
    tier: 'UNASSIGNED' as 'UNASSIGNED' | 'FOUNDATION' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
    overallProgress: 0,
    badges: ['Star Starter', 'Math Explorer']
  },
  badgeDefinitions,
  diagnosticQuestions,
  quizQuestions,
  subjects: [
    {
      subject_id: 'math',
      subject_name: 'Mathematics',
      standard: 'Grade 5',
      icon: '📐',
      color: 'blue' as const,
      progress: 0,
      chapters: mathChapters,
    },
    {
      subject_id: 'science',
      subject_name: 'Environmental Science',
      standard: 'Grade 5',
      icon: '🧪',
      color: 'green' as const,
      progress: 0,
      chapters: scienceChapters,
    },
    {
      subject_id: 'english',
      subject_name: 'English',
      standard: 'Grade 5',
      icon: '📚',
      color: 'purple' as const,
      progress: 0,
      chapters: englishChapters,
    }
  ]
};
