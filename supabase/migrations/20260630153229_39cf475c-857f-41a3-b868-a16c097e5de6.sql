DROP POLICY IF EXISTS "Anyone can submit consultation" ON public.consultation_requests;

CREATE POLICY "Anyone can submit consultation"
ON public.consultation_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (
  name IS NOT NULL
  AND length(btrim(name)) BETWEEN 1 AND 120
  AND email IS NOT NULL
  AND length(email) <= 254
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND whatsapp IS NOT NULL
  AND length(btrim(whatsapp)) BETWEEN 5 AND 32
  AND whatsapp ~ '^[+0-9\s()-]+$'
);