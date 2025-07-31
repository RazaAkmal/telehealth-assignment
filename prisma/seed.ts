import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create a test user
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
    },
  })

  console.log(`Created user with id: ${user.id}`)

  // Create 5 patients
  const patients = await Promise.all([
    prisma.patient.create({
      data: {
        userId: user.id,
        firstName: 'John',
        lastName: 'Smith',
        dateOfBirth: new Date('1980-05-15'),
        phoneNumber: '555-123-4567',
        email: 'john.smith@example.com',
        address: '123 Main St, Anytown, CA 12345',
        medicalHistory: 'Hypertension, Diabetes Type 2',
      },
    }),
    prisma.patient.create({
      data: {
        userId: user.id,
        firstName: 'Emily',
        lastName: 'Johnson',
        dateOfBirth: new Date('1992-09-23'),
        phoneNumber: '555-987-6543',
        email: 'emily.johnson@example.com',
        address: '456 Oak Ave, Somewhere, CA 67890',
        medicalHistory: 'Asthma',
      },
    }),
    prisma.patient.create({
      data: {
        userId: user.id,
        firstName: 'Michael',
        lastName: 'Williams',
        dateOfBirth: new Date('1975-11-30'),
        phoneNumber: '555-456-7890',
        email: 'michael.williams@example.com',
        address: '789 Elm St, Nowhere, CA 54321',
        medicalHistory: 'High cholesterol',
      },
    }),
    prisma.patient.create({
      data: {
        userId: user.id,
        firstName: 'Sarah',
        lastName: 'Davis',
        dateOfBirth: new Date('1988-02-12'),
        phoneNumber: '555-789-1234',
        email: 'sarah.davis@example.com',
        address: '321 Pine Rd, Elsewhere, CA 13579',
        medicalHistory: 'Migraines',
      },
    }),
    prisma.patient.create({
      data: {
        userId: user.id,
        firstName: 'David',
        lastName: 'Brown',
        dateOfBirth: new Date('1965-07-08'),
        phoneNumber: '555-321-6547',
        email: 'david.brown@example.com',
        address: '654 Cedar Ln, Anyplace, CA 24680',
        medicalHistory: 'Arthritis',
      },
    }),
  ])

  console.log(`Created ${patients.length} patients`)

  // Get the current date
  const now = new Date()

  // Create 20 bookings across the 5 patients
  const bookings = await Promise.all([
    // PREBOOKED APPOINTMENTS - FUTURE
    // Pending appointments
    prisma.booking.create({
      data: {
        patientId: patients[0].id,
        doctorName: 'Dr. James Wilson',
        bookingDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        queueStatus: 'pre_booked',
        patientStatus: 'pending',
        notes: 'Regular checkup',
        chiefComplaint: 'Annual physical exam',
        isAdhoc: false,
      },
    }),
    prisma.booking.create({
      data: {
        patientId: patients[2].id,
        doctorName: 'Dr. Robert Lee',
        bookingDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
        queueStatus: 'pre_booked',
        patientStatus: 'pending',
        notes: 'Initial consultation',
        chiefComplaint: 'Persistent cough for 2 weeks',
        isAdhoc: false,
      },
    }),
    
    // Confirmed appointments
    prisma.booking.create({
      data: {
        patientId: patients[1].id,
        doctorName: 'Dr. Maria Garcia',
        bookingDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        queueStatus: 'pre_booked',
        patientStatus: 'confirmed',
        notes: 'Follow-up appointment',
        chiefComplaint: 'Asthma management review',
        isAdhoc: false,
      },
    }),
    prisma.booking.create({
      data: {
        patientId: patients[4].id,
        doctorName: 'Dr. David Johnson',
        bookingDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        queueStatus: 'pre_booked',
        patientStatus: 'confirmed',
        notes: 'Follow-up on arthritis treatment',
        chiefComplaint: 'Evaluate effectiveness of new medication',
        isAdhoc: false,
      },
    }),
    
    // IN OFFICE - TODAY
    // Intake patients
    prisma.booking.create({
      data: {
        patientId: patients[0].id,
        doctorName: 'Dr. Elizabeth Taylor',
        bookingDate: now,
        queueStatus: 'active',
        patientStatus: 'intake',
        notes: 'Blood pressure check',
        chiefComplaint: 'Headaches and dizziness',
        checkInTime: new Date(now.getTime() - 15 * 60 * 1000), // 15 minutes ago
        isAdhoc: false,
      },
    }),
    prisma.booking.create({
      data: {
        patientId: patients[3].id,
        doctorName: 'Dr. Lisa Wong',
        bookingDate: now,
        queueStatus: 'active',
        patientStatus: 'intake',
        notes: 'New patient intake',
        chiefComplaint: 'Migraine symptoms worsening',
        checkInTime: new Date(now.getTime() - 10 * 60 * 1000), // 10 minutes ago
        isAdhoc: true,
      },
    }),
    
    // Ready for provider
    prisma.booking.create({
      data: {
        patientId: patients[2].id,
        doctorName: 'Dr. Robert Lee',
        bookingDate: now,
        queueStatus: 'active',
        patientStatus: 'ready_for_provider',
        notes: 'Follow-up on cholesterol medication',
        chiefComplaint: 'Side effects from medication',
        checkInTime: new Date(now.getTime() - 45 * 60 * 1000), // 45 minutes ago
        isAdhoc: false,
      },
    }),
    
    // Provider (in consultation)
    prisma.booking.create({
      data: {
        patientId: patients[3].id,
        doctorName: 'Dr. Kevin Chen',
        bookingDate: now,
        queueStatus: 'active',
        patientStatus: 'provider',
        notes: 'Medication review',
        chiefComplaint: 'Allergic reaction to new prescription',
        checkInTime: new Date(now.getTime() - 30 * 60 * 1000), // 30 minutes ago
        consultationStartTime: new Date(now.getTime() - 10 * 60 * 1000), // 10 minutes ago
        isAdhoc: false,
      },
    }),
    
    // Ready for discharge
    prisma.booking.create({
      data: {
        patientId: patients[1].id,
        doctorName: 'Dr. Maria Garcia',
        bookingDate: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
        queueStatus: 'active',
        patientStatus: 'ready_for_discharge',
        notes: 'Asthma flare up',
        chiefComplaint: 'Shortness of breath',
        checkInTime: new Date(now.getTime() - 2 * 60 * 60 * 1000 + 5 * 60 * 1000),
        consultationStartTime: new Date(now.getTime() - 90 * 60 * 1000), // 90 mins ago
        consultationEndTime: new Date(now.getTime() - 15 * 60 * 1000), // 15 mins ago
        isAdhoc: true,
        providerNotes: 'Administered nebulizer treatment. Prescription sent to pharmacy.',
      },
    }),
    
    // COMPLETED APPOINTMENTS - PAST
    // Discharged patients
    prisma.booking.create({
      data: {
        patientId: patients[0].id,
        doctorName: 'Dr. James Wilson',
        bookingDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        queueStatus: 'completed',
        patientStatus: 'discharged',
        notes: 'Annual physical',
        chiefComplaint: 'Routine checkup',
        checkInTime: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000),
        consultationStartTime: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000),
        consultationEndTime: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
        isAdhoc: false,
        providerNotes: 'Patient is doing well. Blood pressure is normal. Recommended continued exercise and diet.',
      },
    }),
    prisma.booking.create({
      data: {
        patientId: patients[2].id,
        doctorName: 'Dr. Robert Lee',
        bookingDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        queueStatus: 'completed',
        patientStatus: 'discharged',
        notes: 'Follow-up on cholesterol levels',
        chiefComplaint: 'Review of lab results',
        checkInTime: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000),
        consultationStartTime: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000),
        consultationEndTime: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 + 25 * 60 * 1000),
        isAdhoc: false,
        providerNotes: 'Cholesterol levels have improved. Continue with current medication and schedule follow-up in 3 months.',
      },
    }),
    
    // No-show patients
    prisma.booking.create({
      data: {
        patientId: patients[1].id,
        doctorName: 'Dr. Maria Garcia',
        bookingDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        queueStatus: 'completed',
        patientStatus: 'no_show',
        notes: 'Asthma check',
        chiefComplaint: 'Routine asthma management',
        isAdhoc: false,
        providerNotes: 'Patient did not attend appointment. Attempted to call but no answer.',
      },
    }),
    
    // Cancelled appointments
    prisma.booking.create({
      data: {
        patientId: patients[4].id,
        doctorName: 'Dr. Lisa Wong',
        bookingDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        queueStatus: 'cancelled',
        patientStatus: 'cancelled',
        notes: 'Joint pain assessment',
        chiefComplaint: 'Worsening arthritis pain in hands',
        isAdhoc: false,
        providerNotes: 'Patient called to reschedule due to transportation issues.',
      },
    }),
    
    // Legacy status appointments for backward compatibility testing
    prisma.booking.create({
      data: {
        patientId: patients[4].id,
        doctorName: 'Dr. Kevin Chen',
        bookingDate: now,
        queueStatus: 'active',
        patientStatus: 'checked_in',
        notes: 'Back pain follow-up',
        chiefComplaint: 'Persistent lower back pain',
        checkInTime: new Date(now.getTime() - 25 * 60 * 1000), // 25 minutes ago
        isAdhoc: false,
      },
    }),
    prisma.booking.create({
      data: {
        patientId: patients[0].id,
        doctorName: 'Dr. Elizabeth Taylor',
        bookingDate: now,
        queueStatus: 'active',
        patientStatus: 'in_consultation',
        notes: 'Hypertension follow-up',
        chiefComplaint: 'Blood pressure review',
        checkInTime: new Date(now.getTime() - 40 * 60 * 1000), // 40 minutes ago
        consultationStartTime: new Date(now.getTime() - 20 * 60 * 1000), // 20 minutes ago
        isAdhoc: false,
      },
    }),
    prisma.booking.create({
      data: {
        patientId: patients[3].id,
        doctorName: 'Dr. David Johnson',
        bookingDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // Yesterday
        queueStatus: 'completed',
        patientStatus: 'completed',
        notes: 'Migraine treatment review',
        chiefComplaint: 'Evaluation of new medication effectiveness',
        checkInTime: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000),
        consultationStartTime: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000),
        consultationEndTime: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000 + 35 * 60 * 1000),
        isAdhoc: false,
        providerNotes: 'Medication appears to be helping. Continue current regimen and follow up in one month.',
      },
    }),
  ])

  console.log(`Created ${bookings.length} bookings`)
  console.log('Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
