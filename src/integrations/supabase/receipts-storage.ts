import { supabase } from '@/integrations/supabase/client'

export const RECEIPTS_BUCKET = 'receipts' as const

export async function uploadMachineCostReceipt(costId: string, imageBlob: Blob): Promise<string> {
  const path = `machine-costs/${costId}/${crypto.randomUUID()}.jpg`
  const { error } = await supabase.storage
    .from(RECEIPTS_BUCKET)
    .upload(path, imageBlob, { contentType: 'image/jpeg', upsert: false })
  if (error) throw error
  return path
}

export async function uploadServiceReceipt(serviceId: string, imageBlob: Blob): Promise<string> {
  const path = `services/${serviceId}/${crypto.randomUUID()}.jpg`
  const { error } = await supabase.storage
    .from(RECEIPTS_BUCKET)
    .upload(path, imageBlob, { contentType: 'image/jpeg', upsert: false })
  if (error) throw error
  return path
}

export async function uploadServiceCheckoutPhoto(serviceId: string, imageBlob: Blob): Promise<string> {
  const path = `services/${serviceId}/checkout-${crypto.randomUUID()}.jpg`
  const { error } = await supabase.storage
    .from(RECEIPTS_BUCKET)
    .upload(path, imageBlob, { contentType: 'image/jpeg', upsert: false })
  if (error) throw error
  return path
}

export async function removeReceiptAtPathIfExists(storagePath: string): Promise<void> {
  const { error } = await supabase.storage.from(RECEIPTS_BUCKET).remove([storagePath])
  if (error && !/not found/i.test(error.message)) throw error
}

export async function getReceiptSignedUrl(storagePath: string, expiresSec = 3600): Promise<string> {
  const { data, error } = await supabase.storage
    .from(RECEIPTS_BUCKET)
    .createSignedUrl(storagePath, expiresSec)
  if (error) throw error
  return data.signedUrl
}
