-- Role admin com todas as permissões
INSERT INTO public.roles (name, description) VALUES ('admin', 'Administrador — acesso total')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r, public.permissions p
WHERE r.name = 'admin'
ON CONFLICT DO NOTHING;

-- Vincular ao usuário pelo email
INSERT INTO public.user_roles (user_id, role_id)
SELECT u.id, r.id
FROM auth.users u, public.roles r
WHERE u.email = 'jeff.goval@gmail.com'
  AND r.name = 'admin'
ON CONFLICT DO NOTHING;
