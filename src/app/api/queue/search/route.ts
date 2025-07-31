import { NextRequest, NextResponse } from 'next/server'
import { searchBookings } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get search parameters
    const searchParams = request.nextUrl.searchParams
    const patientName = searchParams.get('patientName') || undefined
    const doctorName = searchParams.get('doctorName') || undefined
    const patientStatus = searchParams.get('patientStatus') || undefined
    const queueStatus = searchParams.get('queueStatus') || undefined
    
    // Search bookings with filters
    const bookings = await searchBookings({
      patientName,
      doctorName,
      patientStatus,
      queueStatus
    })
    
    return NextResponse.json({ success: true, data: bookings })
  } catch (error) {
    console.error('Error searching bookings:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}
