import { supabase } from '@/integrations/supabase/client'
import type { Views } from '@/integrations/supabase/db-types'

export const profitabilityRepository = {
  async getTractorProfitability(): Promise<Views<'v_tractor_profitability'>[]> {
    const { data, error } = await supabase.from('v_tractor_profitability').select('*')
    if (error) throw error
    return data
  },
}
