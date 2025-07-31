import { PrismaClient } from '@prisma/client'

// Create a singleton instance of PrismaClient
let prisma: PrismaClient

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  // In development, use a global variable to prevent multiple instances
  if (!global.prisma) {
    global.prisma = new PrismaClient()
  }
  prisma = global.prisma
}

export default prisma

// Define interface for the telehealth queue item
export interface TelehealthQueueItem {
  booking_id: string
  patient_id: string
  first_name: string
  last_name: string
  date_of_birth: Date
  phone_number: string | null
  doctor_name: string
  booking_date: Date
  queue_status: string
  check_in_time: Date | null
  consultation_start_time: Date | null
  consultation_end_time: Date | null
  notes: string | null
  provider_notes: string | null
  medical_history: string | null
}

export async function getAllBookings(): Promise<TelehealthQueueItem[]> {
  const bookings = await prisma.booking.findMany({
    include: {
      patient: true,
    },
  })
  
  // Transform Prisma data to match the telehealth queue interface
  return bookings.map(booking => ({
    booking_id: booking.id,
    patient_id: booking.patientId,
    first_name: booking.patient.firstName,
    last_name: booking.patient.lastName,
    date_of_birth: booking.patient.dateOfBirth,
    phone_number: booking.patient.phoneNumber,
    doctor_name: booking.doctorName,
    booking_date: booking.bookingDate,
    queue_status: booking.queueStatus,
    check_in_time: booking.checkInTime,
    consultation_start_time: booking.consultationStartTime,
    consultation_end_time: booking.consultationEndTime,
    notes: booking.notes,
    provider_notes: booking.providerNotes,
    medical_history: booking.patient.medicalHistory,
  }))
}

export async function getBookingsByStatus(status: string | string[]): Promise<TelehealthQueueItem[]> {
  const statusCondition = Array.isArray(status) 
    ? { queueStatus: { in: status } }
    : { queueStatus: status }

  const bookings = await prisma.booking.findMany({
    where: statusCondition,
    include: {
      patient: true,
    },
    orderBy: {
      bookingDate: 'asc',
    }
  })
  
  // Transform Prisma data to match the telehealth queue interface
  return bookings.map(booking => ({
    booking_id: booking.id,
    patient_id: booking.patientId,
    first_name: booking.patient.firstName,
    last_name: booking.patient.lastName,
    date_of_birth: booking.patient.dateOfBirth,
    phone_number: booking.patient.phoneNumber,
    doctor_name: booking.doctorName,
    booking_date: booking.bookingDate,
    queue_status: booking.queueStatus,
    check_in_time: booking.checkInTime,
    consultation_start_time: booking.consultationStartTime,
    consultation_end_time: booking.consultationEndTime,
    notes: booking.notes,
    provider_notes: booking.providerNotes,
    medical_history: booking.patient.medicalHistory,
  }))
}

export async function getBookingById(bookingId: string): Promise<TelehealthQueueItem | null> {
  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
    },
    include: {
      patient: true,
    },
  })
  
  if (!booking) return null
  
  // Transform Prisma data to match the telehealth queue interface
  return {
    booking_id: booking.id,
    patient_id: booking.patientId,
    first_name: booking.patient.firstName,
    last_name: booking.patient.lastName,
    date_of_birth: booking.patient.dateOfBirth,
    phone_number: booking.patient.phoneNumber,
    doctor_name: booking.doctorName,
    booking_date: booking.bookingDate,
    queue_status: booking.queueStatus,
    check_in_time: booking.checkInTime,
    consultation_start_time: booking.consultationStartTime,
    consultation_end_time: booking.consultationEndTime,
    notes: booking.notes,
    provider_notes: booking.providerNotes,
    medical_history: booking.patient.medicalHistory,
  }
}

export async function getQueueCounts() {
  try {
    const prebooked = await prisma.booking.count({
      where: { queueStatus: 'pre-booked' },
    })
    
    const inOffice = await prisma.booking.count({
      where: {
        queueStatus: {
          in: ['checked-in', 'in-consultation'],
        }
      },
    })
    
    const completed = await prisma.booking.count({
      where: {
        queueStatus: {
          in: ['completed', 'no-show', 'cancelled'],
        }
      },
    })
    
    return {
      prebooked,
      inOffice,
      completed,
    }
  } catch (error) {
    console.error('Error getting queue counts:', error)
    return {
      prebooked: 0,
      inOffice: 0,
      completed: 0,
    }
  }
}

export async function updateBookingStatus(
  bookingId: string,
  newStatus: string,
  notes: string | null = null
) {
  try {
    const updateData: Record<string, string | Date | null> = { queueStatus: newStatus }
    
    // Add timestamps based on status
    const now = new Date()
    
    if (newStatus === 'checked-in') {
      updateData.checkInTime = now
    } else if (newStatus === 'in-consultation') {
      updateData.consultationStartTime = now
    } else if (newStatus === 'completed') {
      updateData.consultationEndTime = now
    }
    
    // Add notes if provided
    if (notes !== null) {
      updateData.providerNotes = notes
    }
    
    const updatedBooking = await prisma.booking.update({
      where: {
        id: bookingId,
      },
      data: updateData,
      include: {
        patient: true,
      },
    })
    
    // Transform Prisma data to match the telehealth queue interface
    return { 
      success: true, 
      data: {
        booking_id: updatedBooking.id,
        patient_id: updatedBooking.patientId,
        first_name: updatedBooking.patient.firstName,
        last_name: updatedBooking.patient.lastName,
        date_of_birth: updatedBooking.patient.dateOfBirth,
        phone_number: updatedBooking.patient.phoneNumber,
        doctor_name: updatedBooking.doctorName,
        booking_date: updatedBooking.bookingDate,
        queue_status: updatedBooking.queueStatus,
        check_in_time: updatedBooking.checkInTime,
        consultation_start_time: updatedBooking.consultationStartTime,
        consultation_end_time: updatedBooking.consultationEndTime,
        notes: updatedBooking.notes,
        provider_notes: updatedBooking.providerNotes,
        medical_history: updatedBooking.patient.medicalHistory,
      }
    }
  } catch (error) {
    console.error('Error updating booking status:', error)
    return { success: false, error: (error as Error).message }
  }
}
