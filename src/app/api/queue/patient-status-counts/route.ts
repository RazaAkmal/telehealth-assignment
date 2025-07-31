import { NextRequest, NextResponse } from 'next/server'
import { getPatientStatusCounts } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get the active queue tab from the query string
    const searchParams = request.nextUrl.searchParams
    const activeQueueTab = searchParams.get('queueStatus') || undefined
    
    // Get counts filtered by the active queue tab
    const counts = await getPatientStatusCounts(activeQueueTab)
    return NextResponse.json({ success: true, data: counts })
  } catch (error) {
    console.error('Error getting patient status counts:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}
