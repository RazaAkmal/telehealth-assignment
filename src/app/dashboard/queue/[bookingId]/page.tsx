'use client'

import { useState, useEffect } from 'react'
import React from 'react'
import Link from 'next/link'
import { updateBookingStatus } from '../actions'

// Types
type Patient = {
  booking_id: string
  patient_id: string
  first_name: string
  last_name: string
  date_of_birth: string
  phone_number: string
  doctor_name: string
  booking_date: string
  queue_status: string
  check_in_time: string | null
  consultation_start_time: string | null
  consultation_end_time: string | null
  notes: string | null
  provider_notes: string | null
  medical_history: string | null
}

export default function PatientDetailsPage({ params }: { params: { bookingId: string } }) {
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [providerNotes, setProviderNotes] = useState('')
  

  const bookingId = params.bookingId;

  // Fetch patient details
  useEffect(() => {
    async function fetchPatientDetails() {
      setLoading(true)
      
      try {
        const response = await fetch(`/api/queue/booking/${bookingId}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch patient details')
        }
        
        const data = await response.json()
        
        if (!data) {
          setError('Patient not found')
        } else {
          setPatient(data)
          if (data.provider_notes) {
            setProviderNotes(data.provider_notes)
          }
        }
      } catch (error) {
        console.error('Error fetching patient details:', error)
        setError('Failed to load patient details')
      } finally {
        setLoading(false)
      }
    }
    
    fetchPatientDetails()
  }, [bookingId])
  
  // Format date function
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  
  // Use imported server action
  
  // Update patient status
  const updatePatientStatus = async (newStatus: string) => {
    setUpdatingStatus(true)
    
    try {
      const result = await updateBookingStatus(bookingId, newStatus, providerNotes || null)
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      // Update local state
      setPatient(prev => prev ? { ...prev, queue_status: newStatus } : null)
      
      // Add timestamps to local state based on status
      const now = new Date().toISOString()
      if (newStatus === 'checked-in') {
        setPatient(prev => prev ? { ...prev, check_in_time: now } : null)
      } else if (newStatus === 'in-consultation') {
        setPatient(prev => prev ? { ...prev, consultation_start_time: now } : null)
      } else if (newStatus === 'completed') {
        setPatient(prev => prev ? { ...prev, consultation_end_time: now } : null)
      }
      
    } catch (error) {
      console.error('Error updating patient status:', error)
    } finally {
      setUpdatingStatus(false)
    }
  }
  
  // Save provider notes
  const saveProviderNotes = async () => {
    setUpdatingStatus(true)
    
    try {
      const result = await updateBookingStatus(
        bookingId, 
        patient?.queue_status || '', 
        providerNotes
      )
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      // Update local state
      setPatient(prev => prev ? { ...prev, provider_notes: providerNotes } : null)
      
    } catch (error) {
      console.error('Error saving provider notes:', error)
    } finally {
      setUpdatingStatus(false)
    }
  }
  
  // Get next action based on current status
  const getNextAction = () => {
    if (!patient) return { label: '', action: '' }
    
    switch(patient.queue_status) {
      case 'pre-booked':
        return { 
          label: 'Check In Patient', 
          action: 'checked-in',
          className: 'bg-blue-600 hover:bg-blue-700'
        }
      case 'checked-in':
        return { 
          label: 'Start Consultation', 
          action: 'in-consultation',
          className: 'bg-green-600 hover:bg-green-700'
        }
      case 'in-consultation':
        return { 
          label: 'Complete Appointment', 
          action: 'completed',
          className: 'bg-purple-600 hover:bg-purple-700'
        }
      default:
        return { 
          label: '', 
          action: '',
          className: ''
        }
    }
  }
  
  // Get status badge styling
  const getStatusBadgeClass = (status: string) => {
    switch(status) {
      case 'pre-booked':
        return 'bg-blue-100 text-blue-800'
      case 'checked-in':
        return 'bg-yellow-100 text-yellow-800'
      case 'in-consultation':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'no-show':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !patient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">{error || 'Patient not found'}</h2>
          <Link href="/dashboard/queue" className="text-blue-600 hover:text-blue-800">
            Return to Queue
          </Link>
        </div>
      </div>
    )
  }

  const nextAction = getNextAction()

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Patient Details</h1>
            <nav className="flex space-x-6">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
              <Link href="/dashboard/queue" className="text-gray-600 hover:text-gray-900">Queue</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <Link href="/dashboard/queue" className="text-blue-600 hover:text-blue-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Queue
          </Link>
        </div>

        {/* Patient header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {patient.first_name} {patient.last_name}
              </h2>
              <div className="flex items-center mb-4">
                <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusBadgeClass(patient.queue_status)}`}>
                  {patient.queue_status.replace('-', ' ')}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Date of Birth</p>
                  <p className="font-medium">{new Date(patient.date_of_birth).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Phone Number</p>
                  <p className="font-medium">{patient.phone_number || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Provider</p>
                  <p className="font-medium">{patient.doctor_name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Appointment Date</p>
                  <p className="font-medium">{formatDate(patient.booking_date)}</p>
                </div>
              </div>
            </div>
            
            {/* Next action button */}
            {nextAction.label && (
              <button 
                onClick={() => updatePatientStatus(nextAction.action)}
                disabled={updatingStatus}
                className={`${nextAction.className} text-white px-4 py-2 rounded-lg font-medium ${updatingStatus ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {updatingStatus ? 'Updating...' : nextAction.label}
              </button>
            )}
          </div>
        </div>

        {/* Patient details grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Appointment details */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Appointment Timeline</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-blue-100 rounded-full h-8 w-8 flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Appointment Scheduled</p>
                  <p className="text-sm text-gray-600">{formatDate(patient.booking_date)}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className={`${patient.check_in_time ? 'bg-yellow-100' : 'bg-gray-100'} rounded-full h-8 w-8 flex items-center justify-center mr-3`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${patient.check_in_time ? 'text-yellow-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Patient Check-In</p>
                  <p className="text-sm text-gray-600">{patient.check_in_time ? formatDate(patient.check_in_time) : 'Not checked in yet'}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className={`${patient.consultation_start_time ? 'bg-green-100' : 'bg-gray-100'} rounded-full h-8 w-8 flex items-center justify-center mr-3`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${patient.consultation_start_time ? 'text-green-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Consultation Start</p>
                  <p className="text-sm text-gray-600">{patient.consultation_start_time ? formatDate(patient.consultation_start_time) : 'Not started yet'}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className={`${patient.consultation_end_time ? 'bg-purple-100' : 'bg-gray-100'} rounded-full h-8 w-8 flex items-center justify-center mr-3`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${patient.consultation_end_time ? 'text-purple-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Consultation End</p>
                  <p className="text-sm text-gray-600">{patient.consultation_end_time ? formatDate(patient.consultation_end_time) : 'Not completed yet'}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Medical information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Medical Information</h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-500 mb-1">Medical History</p>
                <p className="font-medium">{patient.medical_history || 'No medical history recorded'}</p>
              </div>
              
              <div>
                <p className="text-gray-500 mb-1">Appointment Notes</p>
                <p className="font-medium">{patient.notes || 'No appointment notes'}</p>
              </div>
              
              <div>
                <p className="text-gray-500 mb-1">Provider Notes</p>
                <textarea
                  value={providerNotes}
                  onChange={(e) => setProviderNotes(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Enter provider notes here..."
                ></textarea>
                <button
                  onClick={saveProviderNotes}
                  disabled={updatingStatus}
                  className="mt-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium"
                >
                  {updatingStatus ? 'Saving...' : 'Save Notes'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
            <Link
              href="#"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium inline-flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Join Video Call
            </Link>
            <button
              onClick={() => patient.queue_status !== 'cancelled' && updatePatientStatus('cancelled')}
              disabled={patient.queue_status === 'cancelled' || updatingStatus}
              className="bg-red-100 text-red-800 px-4 py-2 rounded-lg hover:bg-red-200 font-medium"
            >
              Cancel Appointment
            </button>
          </div>
          
          {patient.queue_status !== 'no-show' && 
           patient.queue_status !== 'completed' && 
           patient.queue_status !== 'cancelled' && (
            <button
              onClick={() => updatePatientStatus('no-show')}
              disabled={updatingStatus}
              className="bg-purple-100 text-purple-800 px-4 py-2 rounded-lg hover:bg-purple-200 font-medium"
            >
              Mark as No-Show
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
