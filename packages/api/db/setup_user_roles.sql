-- This script sets up user roles and a trigger to assign them on user creation.
-- Run this script in your Supabase SQL Editor.

-- 1. Create a table to store user roles
-- This table will have a one-to-one relationship with the auth.users table.
CREATE TABLE public.user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'client'))
);

-- Comment out the following line if you want to keep the table public.
-- However, enabling RLS is recommended for security.
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 2. Create policies for the user_roles table
-- Policy: Allow users to view their own role.
CREATE POLICY "Allow users to see their own role"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Allow admins to view all user roles.
-- This is useful for user management in the admin panel.
CREATE POLICY "Allow admins to see all roles"
ON public.user_roles
FOR SELECT
USING (EXISTS (
  SELECT 1
  FROM public.user_roles
  WHERE user_id = auth.uid() AND role = 'admin'
));


-- 3. Create a function to automatically assign a role to a new user
-- This function will be triggered every time a new user signs up.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- Important: This allows the function to run with elevated privileges to write to user_roles
AS $$
DECLARE
  user_count INT;
BEGIN
  -- Check how many users already exist in the auth.users table.
  -- We run this check inside the function to ensure it's up-to-date.
  SELECT count(*) INTO user_count FROM auth.users;

  -- If this is the very first user (count is 1 because the trigger runs AFTER insert), assign 'admin' role.
  -- Otherwise, assign the default 'client' role.
  IF user_count = 1 THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'client');
  END IF;
  
  -- Return the new user object
  RETURN new;
END;
$$;

-- 4. Create a trigger that fires the function after a new user is added to auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
