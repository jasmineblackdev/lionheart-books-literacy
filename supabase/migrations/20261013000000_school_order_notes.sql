-- Internal notes and a follow-up date for school (class-set) inquiries.
-- IF NOT EXISTS: safe if the columns were already added by hand in the SQL Editor.
ALTER TABLE public.class_set_inquiries
  ADD COLUMN IF NOT EXISTS notes text CHECK (char_length(notes) <= 5000),
  ADD COLUMN IF NOT EXISTS follow_up_on date;
