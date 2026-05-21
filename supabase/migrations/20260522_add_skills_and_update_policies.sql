-- Add skills column to members table for member-editable field
ALTER TABLE members ADD COLUMN IF NOT EXISTS skills TEXT;

-- Allow members to update their own profile (phone, occupation, skills)
DROP POLICY IF EXISTS "Users can update their own member record" ON public.members;

CREATE POLICY "Users can update their own member record"
  ON public.members
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Grant authenticated users ability to select their own record (already exists, but ensuring it's set)
-- Note: The SELECT policy "Users can view their own member record" already handles this
