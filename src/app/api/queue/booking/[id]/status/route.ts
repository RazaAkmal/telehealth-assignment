import { NextResponse } from 'next/server'
import { updateBookingStatus } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Extract the booking ID from the URL parameters
    const id = params.id
    
    // Parse request body
    const { queueStatus, patientStatus } = await request.json()
    
    if (!queueStatus) {
      return NextResponse.json(
        { error: 'Queue status is required' },
        { status: 400 }
      )
    }
    
    // Update the booking status
    const result = await updateBookingStatus(id, queueStatus, patientStatus)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }
    
    // Revalidate related paths to update UI
    revalidatePath('/dashboard/queue')
    revalidatePath('/dashboard/admin')
    revalidatePath(`/dashboard/queue/${id}`)
    
    return NextResponse.json({
      success: true,
      data: result.data
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to update booking status' },
      { status: 500 }
    )
  }
}
