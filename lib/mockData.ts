export interface TieredTopic {
  topic_id: string;
  topic_name: string;
  is_completed: boolean;
  is_quiz?: boolean;
}

export interface Chapter {
  chapter_id: string;
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
    tier: 'UNASSIGNED' as 'UNASSIGNED' | 'FOUNDATION' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
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
          beginnerTopics: [
            { topic_id: 'top_beg_01', topic_name: 'Understanding Like Denominators', is_completed: false },
            { topic_id: 'top_beg_02', topic_name: 'Adding Basic Fractions', is_completed: false },
            { topic_id: 'quiz_beg_01', topic_name: 'Beginner Assessment Quiz', is_completed: false, is_quiz: true }
          ],
          intermediateTopics: [
            { topic_id: 'top_int_01', topic_name: 'Finding Least Common Denominators (LCM)', is_completed: false },
            { topic_id: 'top_int_02', topic_name: 'Adding Fractions with Unlike Denominators', is_completed: false },
            { topic_id: 'quiz_int_01', topic_name: 'Intermediate Assessment Quiz', is_completed: false, is_quiz: true }
          ],
          advancedTopics: [
            { topic_id: 'top_adv_01', topic_name: 'Mixed Numbers Addition & Simplification', is_completed: false },
            { topic_id: 'top_adv_02', topic_name: 'Word Problems & Real-world Fractions', is_completed: false },
            { topic_id: 'quiz_adv_01', topic_name: 'Advanced Chapter Mastery Quiz', is_completed: false, is_quiz: true }
          ]
        },
        {
          chapter_id: 'chap_02',
          chapter_name: 'Geometry Basics',
          beginnerTopics: [
            { topic_id: 'top_beg_03', topic_name: 'Identifying Lines & Rays', is_completed: false },
            { topic_id: 'quiz_beg_02', topic_name: 'Beginner Geometry Quiz', is_completed: false, is_quiz: true }
          ],
          intermediateTopics: [
            { topic_id: 'top_int_03', topic_name: 'Measuring Acute & Obtuse Angles', is_completed: false },
            { topic_id: 'quiz_int_02', topic_name: 'Intermediate Geometry Quiz', is_completed: false, is_quiz: true }
          ],
          advancedTopics: [
            { topic_id: 'top_adv_03', topic_name: 'Perimeter & Area Word Problems', is_completed: false },
            { topic_id: 'quiz_adv_02', topic_name: 'Advanced Geometry Mastery Quiz', is_completed: false, is_quiz: true }
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
          beginnerTopics: [
            { topic_id: 'top_beg_04', topic_name: 'Solids vs Liquids', is_completed: false },
            { topic_id: 'quiz_beg_03', topic_name: 'Matter Basics Quiz', is_completed: false, is_quiz: true }
          ],
          intermediateTopics: [
            { topic_id: 'top_int_04', topic_name: 'Gases & Molecular Motion', is_completed: false },
            { topic_id: 'quiz_int_03', topic_name: 'Intermediate Matter Quiz', is_completed: false, is_quiz: true }
          ],
          advancedTopics: [
            { topic_id: 'top_adv_04', topic_name: 'Evaporation & Condensation Curves', is_completed: false },
            { topic_id: 'quiz_adv_03', topic_name: 'Advanced Physics Mastery Quiz', is_completed: false, is_quiz: true }
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
          beginnerTopics: [
            { topic_id: 'top_beg_05', topic_name: 'Nouns & Pronouns', is_completed: true },
            { topic_id: 'quiz_beg_04', topic_name: 'Grammar Foundations Quiz', is_completed: true, is_quiz: true }
          ],
          intermediateTopics: [
            { topic_id: 'top_int_05', topic_name: 'Action Verbs & Tenses', is_completed: false },
            { topic_id: 'quiz_int_04', topic_name: 'Intermediate Verbs Quiz', is_completed: false, is_quiz: true }
          ],
          advancedTopics: [
            { topic_id: 'top_adv_05', topic_name: 'Complex Sentences & Context Clues', is_completed: false },
            { topic_id: 'quiz_adv_04', topic_name: 'Advanced Literacy Mastery Quiz', is_completed: false, is_quiz: true }
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
        beginnerTopics: [
          { topic_id: "top_01", topic_name: "Adding Fractions", is_completed: false },
          { topic_id: "quiz_beg_01", topic_name: "Beginner Quiz", is_completed: false, is_quiz: true }
        ],
        intermediateTopics: [
          { topic_id: "top_02", topic_name: "LCM & GCD", is_completed: false },
          { topic_id: "quiz_int_01", topic_name: "Intermediate Quiz", is_completed: false, is_quiz: true }
        ],
        advancedTopics: [
          { topic_id: "top_03", topic_name: "Mixed Numbers", is_completed: false },
          { topic_id: "quiz_adv_01", topic_name: "Advanced Quiz", is_completed: false, is_quiz: true }
        ]
      }
    ]
  }
};
