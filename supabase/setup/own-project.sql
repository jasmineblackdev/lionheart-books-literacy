-- One-time setup for the site's own Supabase project (moving off Lovable Cloud).
-- Paste into Supabase → SQL Editor → Run. Recreates the tables from
-- drizzle/migrations 0000–0002, with RLS on and no public policies: only the
-- edge functions (service role) can read or write them.

-- ===== from drizzle/migrations/0000_migration.sql =====
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

-- ===== from drizzle/migrations/0001_class_set_inquiries.sql =====
CREATE TABLE public.class_set_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 200),
  org text NOT NULL CHECK (char_length(org) BETWEEN 1 AND 200),
  email text NOT NULL CHECK (char_length(email) <= 255),
  quantity integer NOT NULL CHECK (quantity BETWEEN 1 AND 100000),
  message text CHECK (char_length(message) <= 2000),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','replied','done')),
  ip_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.class_set_inquiries TO service_role;
ALTER TABLE public.class_set_inquiries ENABLE ROW LEVEL SECURITY;
CREATE INDEX class_set_inquiries_ip_time ON public.class_set_inquiries (ip_hash, created_at);

-- ===== from drizzle/migrations/0002_sales_and_clicks.sql =====
CREATE TABLE public.book_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL CHECK (source IN ('payhip','amazon')),
  kind text NOT NULL DEFAULT 'sale' CHECK (kind IN ('sale','refund')),
  external_id text NOT NULL CHECK (char_length(external_id) <= 300),
  product_key text CHECK (char_length(product_key) <= 200),
  product_name text CHECK (char_length(product_name) <= 500),
  format text CHECK (char_length(format) <= 100),
  marketplace text CHECK (char_length(marketplace) <= 100),
  quantity integer NOT NULL DEFAULT 1,
  amount_cents integer,
  currency text CHECK (char_length(currency) <= 10),
  sold_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source, kind, external_id)
);
GRANT ALL ON public.book_sales TO service_role;
ALTER TABLE public.book_sales ENABLE ROW LEVEL SECURITY;
CREATE INDEX book_sales_sold_at ON public.book_sales (sold_at);

CREATE TABLE public.amazon_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_slug text NOT NULL CHECK (book_slug IN ('abc-animal-adventure','cursive-safari','rorys-safari-field-guide')),
  ip_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.amazon_clicks TO service_role;
ALTER TABLE public.amazon_clicks ENABLE ROW LEVEL SECURITY;
CREATE INDEX amazon_clicks_ip_time ON public.amazon_clicks (ip_hash, created_at);
