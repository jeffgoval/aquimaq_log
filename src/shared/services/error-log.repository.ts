import { supabase } from '@/integrations/supabase/client'

export async function logClientError(error: Error, componentStack: string): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession()

    await supabase.from('client_error_logs').insert({
      user_id:         session?.user?.id ?? null,
      error_message:   error.message,
      error_stack:     error.stack ?? null,
      component_stack: componentStack || null,
      page_url:        window.location.href,
      user_agent:      navigator.userAgent,
      app_version:     (import.meta.env.VITE_APP_VERSION as string | undefined) ?? null,
    })
  } catch {
    // Nunca propagar erro do logger — não queremos loop de erros
  }
}
