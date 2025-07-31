import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Define CookieOptions type
type CookieOptions = {
  domain?: string
  path?: string
  expires?: Date
  httpOnly?: boolean
  secure?: boolean
  sameSite?: 'lax' | 'strict' | 'none'
  maxAge?: number
}

export default async function updateBookingStatus(
  bookingId: string,
  newStatus: string,
  notes: string | null = null
) {
  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Construct update object based on status
  const updateData: Record<string, string | null> = { queue_status: newStatus }
  
  // Add timestamps based on status
  const now = new Date().toISOString()
  
  // Handle both old and new status types
  if (newStatus === 'checked-in' || newStatus === 'intake') {
    updateData.check_in_time = now
  } else if (newStatus === 'in-consultation' || newStatus === 'provider') {
    updateData.consultation_start_time = now
  } else if (newStatus === 'completed' || newStatus === 'discharged') {
    updateData.consultation_end_time = now
  }
  
  // Add notes if provided
  if (notes !== null) {
    updateData.provider_notes = notes
  }

  const { data, error } = await supabase
    .from('telehealth_queue')
    .update(updateData)
    .eq('booking_id', bookingId)
    .select()

  if (error) {
    throw new Error(`Error updating booking status: ${error.message}`)
  }

  return data
}
