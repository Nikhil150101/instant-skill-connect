-- Allow users to insert their own role during signup, but only 'user' or 'mentor' roles
CREATE POLICY "Users can insert their own role during signup"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id 
  AND role IN ('user', 'mentor')
);