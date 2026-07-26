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

export const diagnosticQuestions: DiagnosticQuestion[] = [
  {
    id: 'diag_q1',
    question_id: 'diag_q1',
    text: 'What is 1/4 + 1/4?',
    options: ['1/8', '2/4 (or 1/2)', '2/8', '1/24'],
    correctAnswer: '2/4 (or 1/2)',
    correct_index: 1,
    points: 50
  },
  {
    id: 'diag_q2',
    question_id: 'diag_q2',
    text: 'What is 1/3 + 1/6?',
    options: ['2/9', '2/6', '3/6 (or 1/2)', '1/18'],
    correctAnswer: '3/6 (or 1/2)',
    correct_index: 2,
    points: 50
  },
  {
    id: 'diag_q3',
    question_id: 'diag_q3',
    text: 'Find the sum of 2/5 and 3/10.',
    options: ['5/15', '7/10', '5/10', '6/50'],
    correctAnswer: '7/10',
    correct_index: 1,
    points: 100
  },
  {
    id: 'diag_q4',
    question_id: 'diag_q4',
    text: 'What is 3/8 + 1/4 in simplest form?',
    options: ['4/12', '5/8', '3/32', '4/8'],
    correctAnswer: '5/8',
    correct_index: 1,
    points: 150
  },
  {
    id: 'diag_q5',
    question_id: 'diag_q5',
    text: 'Calculate 5/12 + 1/3 in simplest form.',
    options: ['6/15', '7/12', '9/12 (or 3/4)', '6/36'],
    correctAnswer: '9/12 (or 3/4)',
    correct_index: 2,
    points: 200
  }
];

export const quizQuestions: QuizQuestion[] = [
  {
    question_id: 'q1',
    text: 'What is 2/5 + 1/5?',
    options: ['3/10', '3/5', '2/25', '1/5'],
    correct_index: 1,
    solution_explanation: 'Since the denominators are equal (5), add the numerators: 2 + 1 = 3. The result is 3/5.'
  },
  {
    question_id: 'q2',
    text: 'What is 3/8 + 1/8?',
    options: ['4/16', '4/8 (or 1/2)', '2/8', '3/64'],
    correct_index: 1,
    solution_explanation: 'Add numerators 3 + 1 = 4 over denominator 8. 4/8 simplifies to 1/2.'
  },
  {
    question_id: 'q3',
    text: 'What is the Least Common Multiple (LCM) of 3 and 4?',
    options: ['7', '12', '1', '24'],
    correct_index: 1,
    solution_explanation: 'Multiples of 3: 3, 6, 9, 12... Multiples of 4: 4, 8, 12... The smallest common multiple is 12.'
  },
  {
    question_id: 'q4',
    text: 'What is 1/2 + 1/4?',
    options: ['2/6', '3/4', '2/4', '1/8'],
    correct_index: 1,
    solution_explanation: 'Convert 1/2 to 2/4. Then 2/4 + 1/4 = 3/4.'
  },
  {
    question_id: 'q5',
    text: 'What is 2/3 + 1/6?',
    options: ['3/9', '5/6', '3/6', '2/18'],
    correct_index: 1,
    solution_explanation: 'Convert 2/3 to 4/6. Then 4/6 + 1/6 = 5/6.'
  },
  {
    question_id: 'q6',
    text: 'What is 3/10 + 2/5?',
    options: ['5/15', '7/10', '5/10', '6/50'],
    correct_index: 1,
    solution_explanation: 'Convert 2/5 to 4/10. Then 3/10 + 4/10 = 7/10.'
  },
  {
    question_id: 'q7',
    text: 'What is 1/6 + 1/4?',
    options: ['2/10', '5/12', '2/24', '1/12'],
    correct_index: 1,
    solution_explanation: 'LCM of 6 and 4 is 12. 1/6 = 2/12 and 1/4 = 3/12. 2/12 + 3/12 = 5/12.'
  },
  {
    question_id: 'q8',
    text: 'Simplify 6/8 to its lowest terms.',
    options: ['1/2', '3/4', '2/3', '3/8'],
    correct_index: 1,
    solution_explanation: 'Divide both numerator 6 and denominator 8 by their Greatest Common Factor (2): 6 ÷ 2 = 3 and 8 ÷ 2 = 4. Result is 3/4.'
  },
  {
    question_id: 'q9',
    text: 'What is 1/3 + 2/9?',
    options: ['3/12', '5/9', '3/9', '2/27'],
    correct_index: 1,
    solution_explanation: 'Convert 1/3 to 3/9. Then 3/9 + 2/9 = 5/9.'
  },
  {
    question_id: 'q10',
    text: 'What is 5/12 + 1/4?',
    options: ['6/16', '8/12 (or 2/3)', '6/12', '5/48'],
    correct_index: 1,
    solution_explanation: 'Convert 1/4 to 3/12. Then 5/12 + 3/12 = 8/12, which simplifies to 2/3.'
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
  quizQuestions,
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
            { topic_id: 'top_beg_01', topic_name: 'Adding Basic Fractions', is_completed: false }
          ],
          intermediateTopics: [
            { topic_id: 'top_int_01', topic_name: 'Finding LCM & GCD', is_completed: false }
          ],
          advancedTopics: [
            { topic_id: 'top_adv_01', topic_name: 'Mixed Numbers Addition', is_completed: false }
          ]
        },
        {
          chapter_id: 'chap_02',
          chapter_name: 'Geometry Basics',
          beginnerTopics: [
            { topic_id: 'top_beg_02', topic_name: 'Identifying Lines & Angles', is_completed: false }
          ],
          intermediateTopics: [
            { topic_id: 'top_int_02', topic_name: 'Measuring Angles & Triangles', is_completed: false }
          ],
          advancedTopics: [
            { topic_id: 'top_adv_02', topic_name: 'Perimeter & Area Formulas', is_completed: false }
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
            { topic_id: 'top_beg_03', topic_name: 'Solids, Liquids, Gases', is_completed: false }
          ],
          intermediateTopics: [
            { topic_id: 'top_int_03', topic_name: 'Molecular Motion', is_completed: false }
          ],
          advancedTopics: [
            { topic_id: 'top_adv_03', topic_name: 'Evaporation Curves', is_completed: false }
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
            { topic_id: 'top_beg_04', topic_name: 'Nouns & Verbs', is_completed: false }
          ],
          intermediateTopics: [
            { topic_id: 'top_int_04', topic_name: 'Verb Tenses', is_completed: false }
          ],
          advancedTopics: [
            { topic_id: 'top_adv_04', topic_name: 'Complex Sentence Structure', is_completed: false }
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
          { topic_id: "top_01", topic_name: "Adding Fractions", is_completed: false }
        ],
        intermediateTopics: [
          { topic_id: "top_02", topic_name: "LCM", is_completed: false }
        ],
        advancedTopics: [
          { topic_id: "top_03", topic_name: "Mixed Numbers", is_completed: false }
        ]
      }
    ]
  }
};
