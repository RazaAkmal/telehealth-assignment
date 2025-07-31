import { NextResponse } from 'next/server'
import { getBookingById } from '@/lib/db'

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    // Extract id from params (compatible with both Next.js 14 and 15)
    const id = typeof params === 'object' ? params.id : ''
    const booking = await getBookingById(id)
    
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(booking)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch booking details' },
      { status: 500 }
    )
  }
}
