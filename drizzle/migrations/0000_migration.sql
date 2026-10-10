CREATE TABLE public.book_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (category IN ('coloring','handwriting','puzzles','animal-facts','other')),
  intended_audience text NOT NULL CHECK (intended_audience IN ('3-6','7-10','11+','adults','teachers')),
  idea text CHECK (char_length(idea) <= 1000),
  email text CHECK (char_length(email) <= 255),
  marketing_consent boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','under_consideration','planned','declined')),
  ip_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.book_suggestions TO service_role;
ALTER TABLE public.book_suggestions ENABLE ROW LEVEL SECURITY;
CREATE INDEX book_suggestions_ip_time ON public.book_suggestions (ip_hash, created_at);

CREATE TABLE public.site_admins (
  user_id text PRIMARY KEY,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.site_admins TO service_role;
ALTER TABLE public.site_admins ENABLE ROW LEVEL SECURITY;