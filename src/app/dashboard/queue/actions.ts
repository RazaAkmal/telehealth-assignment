'use server'

'use server'

import { revalidatePath } from 'next/cache'
import { updateBookingStatus as updateBooking } from '@/lib/db'

export async function updateBookingStatus(
  bookingId: string,
  newStatus: string,
  notes: string | null = null
) {
  try {
    const result = await updateBooking(bookingId, newStatus, notes)
    
    if (!result.success) {
      throw new Error(result.error)
    }
    
    // Revalidate the paths
    revalidatePath('/dashboard/queue')
    revalidatePath(`/dashboard/queue/${bookingId}`)
    
    return result
  } catch (error) {
    console.error('Error in updateBookingStatus:', error)
    return { success: false, error: (error as Error).message }
  }
}
