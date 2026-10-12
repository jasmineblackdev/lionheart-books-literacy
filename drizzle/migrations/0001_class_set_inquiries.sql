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
