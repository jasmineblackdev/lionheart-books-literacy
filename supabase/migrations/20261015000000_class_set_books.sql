-- Which books a school is asking about (book slugs, or "unsure"). Older inquiries stay NULL.
-- IF NOT EXISTS: safe to re-run.
ALTER TABLE public.class_set_inquiries
  ADD COLUMN IF NOT EXISTS books text[] CHECK (books IS NULL OR cardinality(books) <= 10);
