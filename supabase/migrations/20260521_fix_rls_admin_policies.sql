-- Fix member/application RLS so own-record access and admin-wide access are separate.
-- The previous members self-read policy included `OR is_admin`, which exposed admin
-- member rows to every authenticated user.

CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.members
    WHERE user_id = auth.uid()
      AND is_admin = TRUE
      AND status = 'active'
  );
$$;

REVOKE ALL ON FUNCTION public.is_current_user_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO service_role;

-- members --------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view their own member record" ON public.members;
DROP POLICY IF EXISTS "Admins can view all members" ON public.members;

CREATE POLICY "Users can view their own member record"
  ON public.members
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all members"
  ON public.members
  FOR SELECT
  TO authenticated
  USING (public.is_current_user_admin());

-- join_applications -----------------------------------------------------------
-- Service role remains the server-side path for public application submission
-- and admin actions. Authenticated admins may read/update applications directly
-- if a future admin client uses the browser Supabase client.
DROP POLICY IF EXISTS "Admins can view applications" ON public.join_applications;
DROP POLICY IF EXISTS "Admins can update applications" ON public.join_applications;

CREATE POLICY "Admins can view applications"
  ON public.join_applications
  FOR SELECT
  TO authenticated
  USING (public.is_current_user_admin());

CREATE POLICY "Admins can update applications"
  ON public.join_applications
  FOR UPDATE
  TO authenticated
  USING (public.is_current_user_admin())
  WITH CHECK (public.is_current_user_admin());
