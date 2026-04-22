-- RLS para todas as tabelas do módulo log
-- Padrão single-tenant: select aberto a authenticated; escritas exigem JWT válido

ALTER TABLE public.log_resources       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.log_bookings        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.log_services        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.log_resource_pricing ENABLE ROW LEVEL SECURITY;

-- log_resources
CREATE POLICY "authenticated_select" ON public.log_resources FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert" ON public.log_resources FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) IS NOT NULL);
CREATE POLICY "authenticated_update" ON public.log_resources FOR UPDATE TO authenticated USING ((SELECT auth.uid()) IS NOT NULL) WITH CHECK ((SELECT auth.uid()) IS NOT NULL);
CREATE POLICY "authenticated_delete" ON public.log_resources FOR DELETE TO authenticated USING ((SELECT auth.uid()) IS NOT NULL);

-- log_bookings
CREATE POLICY "authenticated_select" ON public.log_bookings FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert" ON public.log_bookings FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) IS NOT NULL);
CREATE POLICY "authenticated_update" ON public.log_bookings FOR UPDATE TO authenticated USING ((SELECT auth.uid()) IS NOT NULL) WITH CHECK ((SELECT auth.uid()) IS NOT NULL);
CREATE POLICY "authenticated_delete" ON public.log_bookings FOR DELETE TO authenticated USING ((SELECT auth.uid()) IS NOT NULL);

-- log_services
CREATE POLICY "authenticated_select" ON public.log_services FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert" ON public.log_services FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) IS NOT NULL);
CREATE POLICY "authenticated_update" ON public.log_services FOR UPDATE TO authenticated USING ((SELECT auth.uid()) IS NOT NULL) WITH CHECK ((SELECT auth.uid()) IS NOT NULL);
CREATE POLICY "authenticated_delete" ON public.log_services FOR DELETE TO authenticated USING ((SELECT auth.uid()) IS NOT NULL);

-- log_resource_pricing
CREATE POLICY "authenticated_select" ON public.log_resource_pricing FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert" ON public.log_resource_pricing FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) IS NOT NULL);
CREATE POLICY "authenticated_update" ON public.log_resource_pricing FOR UPDATE TO authenticated USING ((SELECT auth.uid()) IS NOT NULL) WITH CHECK ((SELECT auth.uid()) IS NOT NULL);
CREATE POLICY "authenticated_delete" ON public.log_resource_pricing FOR DELETE TO authenticated USING ((SELECT auth.uid()) IS NOT NULL);
