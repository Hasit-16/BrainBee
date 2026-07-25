export interface Topic {
  topic_id: string;
  topic_name: string;
  is_completed: boolean;
}

export interface Chapter {
  chapter_id: string;
  chapter_name: string;
  topics: Topic[];
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
  question_id: string;
  text: string;
  options: string[];
  correct_index: number;
  points: number;
}

export const diagnosticQuestions: DiagnosticQuestion[] = [
  {
    question_id: 'diag_q1',
    text: 'What is 1/4 + 1/4?',
    options: ['1/8', '2/4 (or 1/2)', '2/8', '1/24'],
    correct_index: 1,
    points: 50
  },
  {
    question_id: 'diag_q2',
    text: 'What is 1/3 + 1/6?',
    options: ['2/9', '2/6', '3/6 (or 1/2)', '1/18'],
    correct_index: 2,
    points: 100
  },
  {
    question_id: 'diag_q3',
    text: 'Find the sum of 2/5 and 3/10.',
    options: ['5/15', '7/10', '5/10', '6/50'],
    correct_index: 1,
    points: 150
  },
  {
    question_id: 'diag_q4',
    text: 'What is 3/8 + 1/4 in simplest form?',
    options: ['4/12', '5/8', '3/32', '4/8'],
    correct_index: 1,
    points: 200
  },
  {
    question_id: 'diag_q5',
    text: 'Calculate 5/12 + 1/3 in simplest form.',
    options: ['6/15', '7/12', '9/12 (or 3/4)', '6/36'],
    correct_index: 2,
    points: 250
  }
];

export const mockData = {
  student: {
    name: 'Alex Student',
    xp: 150,
    tier: 'UNASSIGNED' as 'UNASSIGNED' | 'FOUNDATION' | 'BEGINNER' | 'ADVANCED',
    overallProgress: 35,
    badges: ['Star Starter', 'Math Explorer']
  },
  diagnosticQuestions,
  subjects: [
    {
      subject_id: 'math',
      subject_name: 'Mathematics',
      standard: 'Grade 5',
      icon: '📐',
      color: 'blue' as const,
      progress: 40,
      chapters: [
        {
          chapter_id: 'chap_01',
          chapter_name: 'Fractions & Decimals',
          topics: [
            { topic_id: 'top_01', topic_name: 'Adding Fractions', is_completed: false },
            { topic_id: 'top_02', topic_name: 'LCM & GCD', is_completed: false },
            { topic_id: 'top_03', topic_name: 'Decimals Conversion', is_completed: false }
          ]
        },
        {
          chapter_id: 'chap_02',
          chapter_name: 'Geometry Basics',
          topics: [
            { topic_id: 'top_04', topic_name: 'Angles & Triangles', is_completed: false },
            { topic_id: 'top_05', topic_name: 'Perimeter & Area', is_completed: false }
          ]
        }
      ]
    },
    {
      subject_id: 'science',
      subject_name: 'Science',
      standard: 'Grade 5',
      icon: '🧪',
      color: 'green' as const,
      progress: 25,
      chapters: [
        {
          chapter_id: 'chap_03',
          chapter_name: 'States of Matter',
          topics: [
            { topic_id: 'top_06', topic_name: 'Solids, Liquids, Gases', is_completed: false },
            { topic_id: 'top_07', topic_name: 'Evaporation & Condensation', is_completed: false }
          ]
        }
      ]
    },
    {
      subject_id: 'english',
      subject_name: 'English',
      standard: 'Grade 5',
      icon: '📚',
      color: 'purple' as const,
      progress: 50,
      chapters: [
        {
          chapter_id: 'chap_04',
          chapter_name: 'Grammar & Vocabulary',
          topics: [
            { topic_id: 'top_08', topic_name: 'Nouns & Verbs', is_completed: true },
            { topic_id: 'top_09', topic_name: 'Synonyms & Antonyms', is_completed: true }
          ]
        }
      ]
    }
  ],
  curriculum: {
    subject: "Mathematics",
    standard: "Grade 5",
    chapters: [
      {
        chapter_id: "chap_01",
        chapter_name: "Fractions",
        topics: [
          { topic_id: "top_01", topic_name: "Adding Fractions", is_completed: false },
          { topic_id: "top_02", topic_name: "LCM", is_completed: false }
        ]
      }
    ]
  }
};
