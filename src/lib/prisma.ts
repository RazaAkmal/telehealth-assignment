import { PrismaClient, Prisma, PatientStatus, QueueStatus } from '@prisma/client'

// Define interface for the telehealth queue item
interface TelehealthQueueItem {
  booking_id: string
  patient_id: string
  first_name: string
  last_name: string
  date_of_birth: Date
  phone_number: string | null
  doctor_name: string
  booking_date: Date
  queue_status: string
  patient_status: string
  check_in_time: Date | null
  consultation_start_time: Date | null
  consultation_end_time: Date | null
  notes: string | null
  provider_notes: string | null
  medical_history: string | null
}

// Initialize Prisma client
const prisma = new PrismaClient()

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
    patient_status: booking.patientStatus,
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
    patient_status: booking.patientStatus,
    check_in_time: booking.checkInTime,
    consultation_start_time: booking.consultationStartTime,
    consultation_end_time: booking.consultationEndTime,
    notes: booking.notes,
    provider_notes: booking.providerNotes,
    medical_history: booking.patient.medicalHistory,
  }
}

export async function getBookingsByStatus(status: string): Promise<TelehealthQueueItem[]> {
  // Convert any hyphenated string to underscore format for consistency
  const normalizedStatus = status.replace(/-/g, '_') as QueueStatus;
  
  const bookings = await prisma.booking.findMany({
    where: {
      queueStatus: normalizedStatus,
    },
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
    patient_status: booking.patientStatus,
    check_in_time: booking.checkInTime,
    consultation_start_time: booking.consultationStartTime,
    consultation_end_time: booking.consultationEndTime,
    notes: booking.notes,
    provider_notes: booking.providerNotes,
    medical_history: booking.patient.medicalHistory,
  }))
}

export async function updateBookingStatus(
  bookingId: string,
  newStatus: string,
  patientStatus?: string,
  notes: string | null = null
) {
  try {
    const updateData: Prisma.BookingUpdateInput = { queueStatus: newStatus as QueueStatus }
    
    // Add timestamps based on status
    const now = new Date()
    
    // Update patient status if provided
    if (patientStatus) {
      updateData.patientStatus = patientStatus as PatientStatus
    }
    
    // Set appropriate timestamps based on status
    if (newStatus === 'active' && patientStatus === 'checked_in') {
      updateData.checkInTime = now
    } else if (newStatus === 'active' && patientStatus === 'in_consultation') {
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
        patient_status: updatedBooking.patientStatus,
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

export async function getQueueCounts() {
  try {
    // Count pre_booked patients
    const prebooked = await prisma.booking.count({
      where: { queueStatus: 'pre_booked' },
    })
    
    // Count active patients (in office)
    const inOffice = await prisma.booking.count({
      where: {
        queueStatus: 'active',
      },
    })
    
    // Count completed or cancelled bookings
    const completed = await prisma.booking.count({
      where: {
        OR: [
          { queueStatus: 'completed' },
          { queueStatus: 'cancelled' },
        ]
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

export async function getPatientStatusCounts(activeQueueTab?: string) {
  try {
    // Create base where clause for active tab filtering
    const baseWhereClause = activeQueueTab ? { queueStatus: activeQueueTab as QueueStatus } : {};
    
    const pending = await prisma.booking.count({
      where: { 
        ...baseWhereClause,
        patientStatus: 'pending' 
      },
    })
    
    const confirmed = await prisma.booking.count({
      where: { 
        ...baseWhereClause,
        patientStatus: 'confirmed' 
      },
    })
    
    const checkedIn = await prisma.booking.count({
      where: { 
        ...baseWhereClause,
        patientStatus: 'checked_in' 
      },
    })
    
    const inConsultation = await prisma.booking.count({
      where: { 
        ...baseWhereClause,
        patientStatus: 'in_consultation' 
      },
    })
    
    const completed = await prisma.booking.count({
      where: { 
        ...baseWhereClause,
        patientStatus: 'completed' 
      },
    })
    
    const noShow = await prisma.booking.count({
      where: { 
        ...baseWhereClause,
        patientStatus: 'no_show' 
      },
    })
    
    const cancelled = await prisma.booking.count({
      where: { 
        ...baseWhereClause,
        patientStatus: 'cancelled' 
      },
    })
    
    return {
      pending,
      confirmed,
      checkedIn,
      inConsultation,
      completed,
      noShow,
      cancelled,
    }
  } catch (error) {
    console.error('Error getting patient status counts:', error)
    return {
      pending: 0,
      confirmed: 0,
      checkedIn: 0,
      inConsultation: 0,
      completed: 0,
      noShow: 0,
      cancelled: 0,
    }
  }
}

export async function getBookingsByPatientStatus(status: string): Promise<TelehealthQueueItem[]> {
  // Convert any hyphenated string to underscore format for consistency
  const normalizedStatus = status.replace(/-/g, '_') as PatientStatus;
  
  const bookings = await prisma.booking.findMany({
    where: {
      patientStatus: normalizedStatus,
    },
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
    patient_status: booking.patientStatus,
    check_in_time: booking.checkInTime,
    consultation_start_time: booking.consultationStartTime,
    consultation_end_time: booking.consultationEndTime,
    notes: booking.notes,
    provider_notes: booking.providerNotes,
    medical_history: booking.patient.medicalHistory,
  }))
}

// Get in-office patients grouped by status
export async function getInOfficePatientGroups(
  patientName?: string,
  doctorName?: string
): Promise<{
  waitingRoom: TelehealthQueueItem[],
  inCall: TelehealthQueueItem[]
}> {
  // Build common filter for both queries
  const baseFilter: Prisma.BookingWhereInput = {
    queueStatus: 'active',
  };
  
  // Add patient name filter if provided
  if (patientName) {
    baseFilter.OR = [
      { patient: { firstName: { contains: patientName, mode: 'insensitive' } } },
      { patient: { lastName: { contains: patientName, mode: 'insensitive' } } }
    ];
  }
  
  // Add doctor name filter if provided
  if (doctorName) {
    baseFilter.doctorName = { contains: doctorName, mode: 'insensitive' };
  }
  
  // Get patients in waiting room (either in intake or ready for provider)
  const waitingRoom = await prisma.booking.findMany({
    where: {
      ...baseFilter,
      OR: [
        { patientStatus: 'intake' },
        { patientStatus: 'ready_for_provider' },
        { patientStatus: 'checked_in' }, // Legacy support
      ]
    },
    include: {
      patient: true,
    },
    orderBy: {
      checkInTime: 'asc' // Show patients who have been waiting longer first
    }
  });
  
  // Get patients in active calls with provider
  const inCall = await prisma.booking.findMany({
    where: {
      ...baseFilter,
      OR: [
        { patientStatus: 'provider' },
        { patientStatus: 'in_consultation' }, // Legacy support
      ]
    },
    include: {
      patient: true,
    },
    orderBy: {
      consultationStartTime: 'asc'
    }
  });
  
  // Transform data for both groups
  return {
    waitingRoom: waitingRoom.map(booking => ({
      booking_id: booking.id,
      patient_id: booking.patientId,
      first_name: booking.patient.firstName,
      last_name: booking.patient.lastName,
      date_of_birth: booking.patient.dateOfBirth,
      phone_number: booking.patient.phoneNumber,
      doctor_name: booking.doctorName,
      booking_date: booking.bookingDate,
      queue_status: booking.queueStatus,
      patient_status: booking.patientStatus,
      check_in_time: booking.checkInTime,
      consultation_start_time: booking.consultationStartTime,
      consultation_end_time: booking.consultationEndTime,
      notes: booking.notes,
      provider_notes: booking.providerNotes,
      medical_history: booking.patient.medicalHistory,
      chief_complaint: (booking as any).chiefComplaint || null,
      is_adhoc: (booking as any).isAdhoc || false,
      appointment_type: (booking as any).isAdhoc ? 'adhoc' : 'booked',
    })),
    inCall: inCall.map(booking => ({
      booking_id: booking.id,
      patient_id: booking.patientId,
      first_name: booking.patient.firstName,
      last_name: booking.patient.lastName,
      date_of_birth: booking.patient.dateOfBirth,
      phone_number: booking.patient.phoneNumber,
      doctor_name: booking.doctorName,
      booking_date: booking.bookingDate,
      queue_status: booking.queueStatus,
      patient_status: booking.patientStatus,
      check_in_time: booking.checkInTime,
      consultation_start_time: booking.consultationStartTime,
      consultation_end_time: booking.consultationEndTime,
      notes: booking.notes,
      provider_notes: booking.providerNotes,
      medical_history: booking.patient.medicalHistory,
      chief_complaint: (booking as any).chiefComplaint || null,
      is_adhoc: (booking as any).isAdhoc || false,
      appointment_type: (booking as any).isAdhoc ? 'adhoc' : 'booked',
    }))
  };
}

// Filter bookings with advanced search options
export async function searchBookings({
  patientName, 
  doctorName, 
  patientStatus,
  queueStatus
}: {
  patientName?: string;
  doctorName?: string;
  patientStatus?: string;
  queueStatus?: string;
}): Promise<TelehealthQueueItem[]> {
  // Build where clause based on provided filters
  const whereClause: Prisma.BookingWhereInput = {};
  
  if (queueStatus) {
    // Convert any hyphenated string to underscore format for consistency
    const normalizedQueueStatus = queueStatus.replace(/-/g, '_') as QueueStatus;
    whereClause.queueStatus = normalizedQueueStatus;
  }
  
  if (patientStatus) {
    // Convert any hyphenated string to underscore format for consistency
    const normalizedPatientStatus = patientStatus.replace(/-/g, '_') as PatientStatus;
    whereClause.patientStatus = normalizedPatientStatus;
  }
  
  if (doctorName) {
    whereClause.doctorName = {
      contains: doctorName,
      mode: 'insensitive'
    };
  }
  
  // Create a compound where clause that includes patient name search
  const finalWhereClause: Prisma.BookingWhereInput = {...whereClause};
  
  if (patientName) {
    finalWhereClause.patient = {
      OR: [
        { firstName: { contains: patientName, mode: 'insensitive' } },
        { lastName: { contains: patientName, mode: 'insensitive' } },
      ]
    };
  }
  
  // Execute the query
  const bookings = await prisma.booking.findMany({
    where: finalWhereClause,
    include: {
      patient: true,
    },
    orderBy: {
      bookingDate: 'desc'
    }
  });
  
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
    patient_status: booking.patientStatus,
    check_in_time: booking.checkInTime,
    consultation_start_time: booking.consultationStartTime,
    consultation_end_time: booking.consultationEndTime,
    notes: booking.notes,
    provider_notes: booking.providerNotes,
    medical_history: booking.patient.medicalHistory,
  }));
}
