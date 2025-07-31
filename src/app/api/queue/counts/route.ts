import { NextResponse } from 'next/server'
import { getQueueCounts } from '@/lib/prisma'

export async function GET() {
  try {
    const counts = await getQueueCounts()
    return NextResponse.json(counts)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch queue counts' },
      { status: 500 }
    )
  }
}
