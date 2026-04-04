import type { Tables } from '@/integrations/supabase/db-types'

export type Tractor = Tables<'tractors'>
export type TractorInsert = import('@/integrations/supabase/db-types').Inserts<'tractors'>
export type TractorUpdate = import('@/integrations/supabase/db-types').Updates<'tractors'>
export type TractorOption = Pick<Tractor, 'id' | 'name' | 'brand' | 'model'>
