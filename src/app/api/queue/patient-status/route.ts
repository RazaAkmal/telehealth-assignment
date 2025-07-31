import { NextRequest, NextResponse } from 'next/server'
import { getBookingsByPatientStatus } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get status from query parameter
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    
    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Patient status parameter is required' },
        { status: 400 }
      )
    }
    
    const bookings = await getBookingsByPatientStatus(status)
    return NextResponse.json({ success: true, data: bookings })
  } catch (error) {
    console.error('Error getting bookings by patient status:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}
