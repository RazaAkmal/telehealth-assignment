import { NextResponse } from 'next/server'
import { getBookingsByStatus } from '@/lib/db'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const status = url.searchParams.get('status')
  
  try {
    let data
    if (!status) {
      return NextResponse.json(
        { error: 'Status parameter is required' },
        { status: 400 }
      )
    } else if (status === 'pre-booked') {
      data = await getBookingsByStatus('pre-booked')
    } else if (status === 'in-office') {
      data = await getBookingsByStatus(['checked-in', 'in-consultation'])
    } else if (status === 'completed') {
      data = await getBookingsByStatus(['completed', 'cancelled', 'no-show'])
    } else {
      return NextResponse.json(
        { error: 'Invalid status parameter' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch patients' },
      { status: 500 }
    )
  }
}
