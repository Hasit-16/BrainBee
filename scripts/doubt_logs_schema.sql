-- ==========================================
-- PHASE 19: DOUBT SCANNER SCHEMA UPDATE
-- Table: doubt_logs
-- ==========================================

CREATE TABLE IF NOT EXISTS doubt_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    image_url TEXT,
    extracted_text TEXT NOT NULL,
    ai_resolution TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE doubt_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow students to view their own logged doubts
CREATE POLICY "Allow students to view own doubt logs" 
ON doubt_logs 
FOR SELECT 
USING (auth.uid() = student_id);

-- RLS Policy: Allow insertion of doubt logs
CREATE POLICY "Allow student doubt log insertion" 
ON doubt_logs 
FOR INSERT 
WITH CHECK (auth.uid() = student_id OR student_id IS NOT NULL);

-- Index for fast queries by student
CREATE INDEX IF NOT EXISTS idx_doubt_logs_student_id ON doubt_logs(student_id);
