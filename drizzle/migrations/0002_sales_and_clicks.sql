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
