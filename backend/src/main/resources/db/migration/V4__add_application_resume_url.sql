-- Add application-specific resume URL column to support domain-specific resumes
ALTER TABLE applications ADD COLUMN IF NOT EXISTS resume_url TEXT;
