import { NextRequest, NextResponse } from 'next/server'
import { getInOfficePatientGroups } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get search parameters from the URL
    const searchParams = request.nextUrl.searchParams
    const patientName = searchParams.get('patientName') || undefined
    const doctorName = searchParams.get('doctorName') || undefined
    
    // Pass search parameters to the groups function
    const groups = await getInOfficePatientGroups(patientName, doctorName)
    
    return NextResponse.json({ 
      success: true, 
      data: groups,
      counts: {
        waitingRoom: groups.waitingRoom.length,
        inCall: groups.inCall.length
      }
    })
  } catch (error) {
    console.error('Error getting in-office patient groups:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}
