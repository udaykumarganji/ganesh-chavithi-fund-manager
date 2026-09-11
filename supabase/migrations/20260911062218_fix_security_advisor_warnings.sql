/*
# Fix security advisor warnings

1. Revoke EXECUTE on handle_new_user from anon and authenticated roles — this function is only meant to be called by a trigger on auth.users, not via the REST API.
2. Set explicit search_path on both SECURITY DEFINER functions to prevent search path injection.
*/

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.update_updated_at() SET search_path = public;
