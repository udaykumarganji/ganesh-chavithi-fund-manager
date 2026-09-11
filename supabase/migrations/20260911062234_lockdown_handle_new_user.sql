/*
# Lock down handle_new_user trigger function

Drop and recreate the handle_new_user function with no EXECUTE grants to anon/authenticated.
Only the trigger on auth.users should call it, which runs as the event trigger's invoker context.
*/

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  INSERT INTO public.festival_settings (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

-- Revoke all access from anon and authenticated
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
