-- RLS para tabelas de controle de acesso
ALTER TABLE public.profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles  ENABLE ROW LEVEL SECURITY;
-- profiles: cada usuário vê apenas o próprio perfil
CREATE POLICY "own_profile_select" ON public.profiles
  FOR SELECT TO authenticated USING (id = (SELECT auth.uid()));
CREATE POLICY "own_profile_update" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));
-- roles / permissions / role_permissions: leitura para todos autenticados
CREATE POLICY "authenticated_select" ON public.roles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_select" ON public.permissions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_select" ON public.role_permissions
  FOR SELECT TO authenticated USING (true);
-- user_roles: cada usuário vê apenas os próprios vínculos
CREATE POLICY "own_roles_select" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));
-- RPC: retorna os permission codes do usuário logado
-- SECURITY DEFINER para contornar RLS e ler transversalmente
CREATE OR REPLACE FUNCTION public.get_my_permissions()
RETURNS TEXT[] AS $$
  SELECT ARRAY_AGG(DISTINCT p.code)
  FROM public.user_roles ur
  JOIN public.role_permissions rp ON rp.role_id = ur.role_id
  JOIN public.permissions p ON p.id = rp.permission_id
  WHERE ur.user_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER
   SET search_path = pg_catalog, public;
REVOKE ALL ON FUNCTION public.get_my_permissions() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_permissions() TO authenticated;
-- Sincronizar profile ao criar usuário no Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = pg_catalog, public;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
-- Backfill: criar profiles para usuários auth que ainda não têm
INSERT INTO public.profiles (id, name, email)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
  u.email
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)
ON CONFLICT (id) DO NOTHING;
