-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can read predictions" ON public.predictions;
DROP POLICY IF EXISTS "Anyone can insert predictions" ON public.predictions;

-- Users can only read their own session predictions or authenticated user predictions
CREATE POLICY "Users can read own predictions"
ON public.predictions FOR SELECT
USING (
  session_id IS NOT NULL 
  AND session_id = coalesce(
    current_setting('request.headers', true)::json->>'x-session-id',
    ''
  )
  OR (user_id IS NOT NULL AND user_id = auth.uid())
);

-- Require valid session_id for inserts (minimum length validation)
CREATE POLICY "Validated inserts only"
ON public.predictions FOR INSERT
WITH CHECK (
  session_id IS NOT NULL 
  AND length(session_id) >= 16
);