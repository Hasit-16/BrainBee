export const mockData = {
  student: {
    xp: 0,
    tier: 'UNASSIGNED',
    badges: []
  },
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
