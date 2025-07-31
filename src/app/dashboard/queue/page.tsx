'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent,
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { MoreVertical, Video, UserRound, ClipboardList, X } from 'lucide-react'

// Types
type Patient = {
  booking_id: string
  patient_id: string
  first_name: string
  last_name: string
  date_of_birth: string
  phone_number: string | null
  doctor_name: string
  booking_date: string
  queue_status: string
  patient_status: string
  check_in_time: string | null
  consultation_start_time: string | null
  consultation_end_time: string | null
  notes: string | null
  provider_notes: string | null
  medical_history: string | null
  chief_complaint: string | null
  is_adhoc: boolean
  appointment_type: 'adhoc' | 'booked'
}

// Tab type definitions
type QueueTab = 'pre_booked' | 'active' | 'completed'
type PatientStatusTab = 'pending' | 'confirmed' | 'intake' | 'ready_for_provider' | 'provider' | 'ready_for_discharge' | 'discharged' | 'no_show' | 'cancelled'

export default function TelehealthQueuePage() {
  // State - Make sure we use consistent underscore format for queue status
  const [activeTab, setActiveTab] = useState<QueueTab>('pre_booked')
  const [activePatientStatusTab, setActivePatientStatusTab] = useState<PatientStatusTab | null>(null)
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingCount, setLoadingCount] = useState(true)
  const [tabTransitioning, setTabTransitioning] = useState(false) // New state for tab transition
  const [searchQuery, setSearchQuery] = useState('')
  const [doctorFilter, setDoctorFilter] = useState('')
  const [patientGroups, setPatientGroups] = useState<{
    waitingRoom: Patient[],
    inCall: Patient[]
  }>({ waitingRoom: [], inCall: [] })
  const [expandedGroups, setExpandedGroups] = useState({
    waitingRoom: true,
    inCall: true
  })
  const [patientStatusCounts, setPatientStatusCounts] = useState({
    pending: 0,
    confirmed: 0,
    intake: 0,
    readyForProvider: 0,
    provider: 0,
    readyForDischarge: 0,
    discharged: 0,
    noShow: 0,
    cancelled: 0
  })
  const [counts, setCounts] = useState({ 
    prebooked: 0, 
    inOffice: 0, 
    completed: 0 
  })
  // No router or supabase client needed

  // Fetch counts and refresh data
  const refreshData = useCallback(async () => {
    try {
      // Don't update status counts during tab transitions
      if (tabTransitioning) return;
      setLoadingCount(true)
      // Use Promise.all to fetch both counts in parallel for better performance
      const [countResponse, statusCountResponse] = await Promise.all([
        fetch('/api/queue/counts', { priority: 'high' }),
        fetch(
          activeTab 
            ? `/api/queue/patient-status-counts?queueStatus=${activeTab}`
            : '/api/queue/patient-status-counts',
          { priority: 'high' }
        )
      ]);
      
      if (!countResponse.ok) {
        throw new Error('Failed to fetch queue counts')
      }
      
      if (!statusCountResponse.ok) {
        throw new Error('Failed to fetch patient status counts')
      }
      
      // Parse JSON responses in parallel
      const [countData, statusData] = await Promise.all([
        countResponse.json(),
        statusCountResponse.json()
      ]);
      
      // Update state with the new data
      setCounts(countData);
      
      // Only update patient status counts if we're not in a transition
      if (statusData.success && statusData.data && !tabTransitioning) {
        setPatientStatusCounts(statusData.data);
      }
      setLoadingCount(false)
    } catch (error) {
      console.error('Error refreshing data:', error)
    }
  }, [activeTab, tabTransitioning]);

  // Fetch counts on component mount and every 30 seconds
  useEffect(() => {
    refreshData();
    
    // Set up periodic refresh
    const intervalId = setInterval(refreshData, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [refreshData])
  
  // Fetch patients based on the active filters
  useEffect(() => {
    // Request controller for fetch cancellation
    const controller = new AbortController();
    const signal = controller.signal;
    
    async function fetchPatients() {
      // Show loading state if we're not just transitioning between tabs
      if (!tabTransitioning) {
        setLoading(true)
      }
      
      // Build URL with search parameters
      const params = new URLSearchParams();
      
      // Add filters to URL
      if (activeTab) {
        params.append('queueStatus', activeTab);
      }
      
      if (activePatientStatusTab) {
        params.append('patientStatus', activePatientStatusTab);
      }
      
      if (searchQuery) {
        params.append('patientName', searchQuery);
      }
      
      if (doctorFilter) {
        params.append('doctorName', doctorFilter);
      }
      
      const url = `/api/queue/search?${params.toString()}`;
      
      try {
        // Use priority fetch with highest priority
        const response = await fetch(url, { 
          signal,
          priority: 'high'
        })
        
        if (signal.aborted) return;
        
        if (!response.ok) {
          throw new Error('Failed to fetch patients')
        }
        
        const data = await response.json()
        
        // Implement a tiny delay before showing results to prevent flickering
        // and make transitions feel smoother
        setTimeout(() => {
          if (data.success && data.data) {
            setPatients(data.data)
          } else {
            setPatients([])
          }
          setLoading(false)
          setTabTransitioning(false)
        }, 150)
      } catch (error) {
        // Check if this is an abort error (request was cancelled)
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          console.error('Error fetching patients:', error)
          setPatients([])
          setLoading(false)
          setTabTransitioning(false)
        }
      }
    }

    fetchPatients()
    
    // Clean up the fetch if the component unmounts or the filters change
    return () => controller.abort()
  }, [activeTab, activePatientStatusTab, searchQuery, doctorFilter, tabTransitioning])
  
  // Fetch patient groups for the in-office tab
  useEffect(() => {
    // Don't fetch if we're not on the active tab or if we're transitioning
    if (activeTab !== 'active' || tabTransitioning) {
      return;
    }
    
    // Request controller for fetch cancellation
    const controller = new AbortController();
    
    async function fetchPatientGroups() {
      try {
        // Build URL with search parameters
        const params = new URLSearchParams();
        
        // Add search filters to URL
        if (searchQuery) {
          params.append('patientName', searchQuery);
        }
        
        if (doctorFilter) {
          params.append('doctorName', doctorFilter);
        }
        
        const url = `/api/queue/in-office-groups${params.toString() ? `?${params.toString()}` : ''}`;
        
        const response = await fetch(url, {
          signal: controller.signal,
          priority: 'high' // Use high priority for fetching
        })
        
        if (controller.signal.aborted) return;
        
        if (!response.ok) {
          throw new Error('Failed to fetch in-office patient groups')
        }
        
        const data = await response.json()
        if (data.success && data.data) {
          // Add a slight delay for smoother transition
          setTimeout(() => {
            setPatientGroups(data.data)
          }, 100)
        }
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          console.error('Error fetching in-office patient groups:', error)
        }
      }
    }
    
    // Fetch immediately when tab becomes active
    fetchPatientGroups()
    
    // Refresh groups data every 10 seconds when on in-office tab for better responsiveness
    const intervalId = setInterval(fetchPatientGroups, 10000);
    
    // Clean up
    return () => {
      clearInterval(intervalId);
      controller.abort();
    };
  }, [activeTab, tabTransitioning, searchQuery, doctorFilter])
  
  // Handle tab change
  const handleTabChange = (tab: QueueTab) => {
    // Show transition state immediately
    setTabTransitioning(true)
    
    // Reset the counts and clear patient list immediately for better perceived performance
    setPatients([])
    setPatientGroups({ waitingRoom: [], inCall: [] })
    
    // Reset all patient status counts to zero to ensure old filters don't show
    setPatientStatusCounts({
      pending: 0,
      confirmed: 0,
      intake: 0,
      readyForProvider: 0,
      provider: 0,
      readyForDischarge: 0,
      discharged: 0,
      noShow: 0,
      cancelled: 0
    })
    
    // Reset the patient status filter when changing tabs
    setActivePatientStatusTab(null)
    
    // Then set the active tab
    setActiveTab(tab)
    
    // Pre-fetch status counts for immediate UI update
    fetch(`/api/queue/patient-status-counts?queueStatus=${tab}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setPatientStatusCounts(data.data)
        }
      })
      .catch(err => console.error('Error pre-fetching status counts:', err))
      .finally(() => {
        // Hide transition state after a short delay to make the transition feel smoother
        setTimeout(() => setTabTransitioning(false), 300)
      })
    
    // refreshData will automatically be called due to activeTab change in the dependency array
  }
  
  // Toggle patient group expanded/collapsed state
  const toggleGroupExpanded = (group: 'waitingRoom' | 'inCall') => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }))
  }

  // Function to get queue status badge styling
  const getQueueStatusBadgeClass = (status: string) => {
    switch(status) {
      case 'pre_booked':
        return 'bg-blue-100 text-blue-800'
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  
  // Function to get patient status badge styling
  const getPatientStatusBadgeClass = (status: string) => {
    switch(status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'intake':
        return 'bg-blue-100 text-blue-800'
      case 'ready_for_provider':
        return 'bg-cyan-100 text-cyan-800'
      case 'provider':
        return 'bg-indigo-100 text-indigo-800'
      case 'ready_for_discharge':
        return 'bg-violet-100 text-violet-800'
      case 'discharged':
        return 'bg-gray-100 text-gray-800'
      case 'no_show':
        return 'bg-purple-100 text-purple-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      // Legacy status support
      case 'checked_in':
        return 'bg-blue-100 text-blue-800'
      case 'in_consultation':
        return 'bg-indigo-100 text-indigo-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Format date function
  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  
  // Calculate wait time function
  const calculateWaitTime = (checkInTime: string | null, consultationStartTime: string | null): string => {
    if (!checkInTime) return 'Not checked in'
    
    const start = new Date(checkInTime).getTime()
    const end = consultationStartTime ? new Date(consultationStartTime).getTime() : Date.now()
    
    const waitTimeMs = end - start
    const waitMins = Math.floor(waitTimeMs / 60000)
    
    if (waitMins < 60) {
      return `${waitMins} min${waitMins !== 1 ? 's' : ''}`
    } else {
      const hours = Math.floor(waitMins / 60)
      const mins = waitMins % 60
      return `${hours} hr${hours !== 1 ? 's' : ''} ${mins} min${mins !== 1 ? 's' : ''}`
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Telehealth Queue</h1>
            <nav className="flex space-x-6">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
              <Link href="/dashboard/patients" className="text-gray-600 hover:text-gray-900">Patients</Link>
              <Link href="/dashboard/admin" className="text-gray-600 hover:text-blue-600 font-medium">Admin Panel</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Search and Filter Bar */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="search" className="sr-only">Search patients</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="search"
                  name="search"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search by patient name"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full md:w-60">
              <label htmlFor="doctor" className="sr-only">Filter by provider</label>
              <input
                id="doctor"
                name="doctor"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Filter by provider name"
                type="text"
                value={doctorFilter}
                onChange={(e) => setDoctorFilter(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px" aria-label="Tabs">
              <button
                onClick={() => handleTabChange('pre_booked')}
                className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'pre_booked'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Pre-booked
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  activeTab === 'pre_booked' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {counts.prebooked}
                </span>
              </button>

              <button
                onClick={() => handleTabChange('active')}
                className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'active'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                In Office
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  activeTab === 'active' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {counts.inOffice}
                </span>
              </button>

              <button
                onClick={() => handleTabChange('completed')}
                className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'completed'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Completed
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  activeTab === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {counts.completed}
                </span>
              </button>
            </nav>
          </div>
        </div>
        
        {/* Patient Status Filter Pills */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {/* Always show All filter regardless of transition state */}
            <button 
              onClick={() => setActivePatientStatusTab(null)}
              className={`px-3 py-1 rounded-full text-sm transition-colors duration-200 ${!activePatientStatusTab ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              All
            </button>
            
            {/* Show skeleton placeholders ONLY during tab transitions, hide actual filters */}
            {loadingCount || tabTransitioning ? (
              <>
                <div className="px-6 py-1 rounded-full bg-gray-100 animate-pulse"></div>
                <div className="px-8 py-1 rounded-full bg-gray-100 animate-pulse"></div>
                <div className="px-7 py-1 rounded-full bg-gray-100 animate-pulse"></div>
              </>
            ) : (
              // Only show actual filters when not transitioning
              <>
                {patientStatusCounts.pending > 0 && (
                  <button 
                    onClick={() => setActivePatientStatusTab('pending')}
                    className={`px-3 py-1 rounded-full text-sm transition-colors duration-200 ${activePatientStatusTab === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    Pending ({patientStatusCounts.pending})
                  </button>
                )}
                {patientStatusCounts.confirmed > 0 && (
                  <button 
                    onClick={() => setActivePatientStatusTab('confirmed')}
                    className={`px-3 py-1 rounded-full text-sm transition-colors duration-200 ${activePatientStatusTab === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    Confirmed ({patientStatusCounts.confirmed})
                  </button>
                )}
                {patientStatusCounts.intake > 0 && (
                  <button 
                    onClick={() => setActivePatientStatusTab('intake')}
                    className={`px-3 py-1 rounded-full text-sm transition-colors duration-200 ${activePatientStatusTab === 'intake' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    Intake ({patientStatusCounts.intake})
                  </button>
                )}
                {patientStatusCounts.readyForProvider > 0 && (
                  <button 
                    onClick={() => setActivePatientStatusTab('ready_for_provider')}
                    className={`px-3 py-1 rounded-full text-sm transition-colors duration-200 ${activePatientStatusTab === 'ready_for_provider' ? 'bg-cyan-100 text-cyan-800' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    Ready for Provider ({patientStatusCounts.readyForProvider})
                  </button>
                )}
                {patientStatusCounts.provider > 0 && (
                  <button 
                    onClick={() => setActivePatientStatusTab('provider')}
                    className={`px-3 py-1 rounded-full text-sm transition-colors duration-200 ${activePatientStatusTab === 'provider' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    Provider ({patientStatusCounts.provider})
                  </button>
                )}
                {patientStatusCounts.readyForDischarge > 0 && (
                  <button 
                    onClick={() => setActivePatientStatusTab('ready_for_discharge')}
                    className={`px-3 py-1 rounded-full text-sm transition-colors duration-200 ${activePatientStatusTab === 'ready_for_discharge' ? 'bg-violet-100 text-violet-800' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    Ready for Discharge ({patientStatusCounts.readyForDischarge})
                  </button>
                )}
                {patientStatusCounts.discharged > 0 && (
                  <button 
                    onClick={() => setActivePatientStatusTab('discharged')}
                    className={`px-3 py-1 rounded-full text-sm transition-colors duration-200 ${activePatientStatusTab === 'discharged' ? 'bg-gray-100 text-gray-800' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    Discharged ({patientStatusCounts.discharged})
                  </button>
                )}
                {patientStatusCounts.noShow > 0 && (
                  <button 
                    onClick={() => setActivePatientStatusTab('no_show')}
                    className={`px-3 py-1 rounded-full text-sm transition-colors duration-200 ${activePatientStatusTab === 'no_show' ? 'bg-red-100 text-red-800' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    No Show ({patientStatusCounts.noShow})
                  </button>
                )}
                {patientStatusCounts.cancelled > 0 && (
                  <button 
                    onClick={() => setActivePatientStatusTab('cancelled')}
                    className={`px-3 py-1 rounded-full text-sm transition-colors duration-200 ${activePatientStatusTab === 'cancelled' ? 'bg-pink-100 text-pink-800' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    Cancelled ({patientStatusCounts.cancelled})
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Patient list */}
        <div className="transition-all duration-300 ease-in-out min-h-[300px]">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : tabTransitioning ? (
            <div className="flex items-center justify-center h-64 animate-pulse">
              <div className="text-gray-400">Loading patient data...</div>
            </div>
          ) : activeTab === 'active' && !activePatientStatusTab ? (
            // Display patients grouped for the "In Office" tab when no specific status filter is active
            <div>
              {/* Waiting Room Group */}
              {(patientGroups.waitingRoom.length > 0 || expandedGroups.waitingRoom) && (
                <div className="mb-6">
                  <div 
                    className="flex items-center justify-between bg-blue-50 p-4 rounded-t-lg cursor-pointer"
                    onClick={() => toggleGroupExpanded('waitingRoom')}
                  >
                    <h3 className="text-lg font-medium text-blue-800">
                      Waiting Room 
                      <span className="ml-2 text-sm font-normal text-blue-600">
                        ({patientGroups.waitingRoom.length} patients)
                      </span>
                    </h3>
                    <svg 
                      className={`w-5 h-5 text-blue-600 transition-transform ${expandedGroups.waitingRoom ? 'transform rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                  
                  {expandedGroups.waitingRoom && (
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white rounded-b-lg overflow-hidden shadow-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Appointment</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wait Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {patientGroups.waitingRoom.length > 0 ? patientGroups.waitingRoom.map((patient) => (
                            <tr key={patient.booking_id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {patient.first_name} {patient.last_name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {patient.phone_number || 'No phone number'}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{patient.doctor_name}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{formatDate(patient.booking_date)}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {patient.check_in_time ? formatDate(patient.check_in_time) : 'Not checked in'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <div className="flex items-center space-x-2">
                                  {/* Direct action button for joining call */}
                                  <Button 
                                    size="sm" 
                                    variant="default" 
                                    className="flex items-center space-x-1 bg-green-600 hover:bg-green-700"
                                  >
                                    <Video className="h-3.5 w-3.5" />
                                    <span>Join Call</span>
                                  </Button>
                                  
                                  {/* Context Menu */}
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreVertical className="h-4 w-4" />
                                        <span className="sr-only">Open menu</span>
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                      <DropdownMenuItem asChild>
                                        <Link href={`/dashboard/queue/${patient.booking_id}`}>
                                          <UserRound className="mr-2 h-4 w-4" />
                                          View Patient
                                        </Link>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <ClipboardList className="mr-2 h-4 w-4" />
                                        Intake
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <UserRound className="mr-2 h-4 w-4" />
                                        Mark Ready for Provider
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                                No patients in waiting room
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
              
              {/* In Call Group */}
              {(patientGroups.inCall.length > 0 || expandedGroups.inCall) && (
                <div>
                  <div 
                    className="flex items-center justify-between bg-green-50 p-4 rounded-t-lg cursor-pointer"
                    onClick={() => toggleGroupExpanded('inCall')}
                  >
                    <h3 className="text-lg font-medium text-green-800">
                      In Consultation 
                      <span className="ml-2 text-sm font-normal text-green-600">
                        ({patientGroups.inCall.length} patients)
                      </span>
                    </h3>
                    <svg 
                      className={`w-5 h-5 text-green-600 transition-transform ${expandedGroups.inCall ? 'transform rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                  
                  {expandedGroups.inCall && (
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white rounded-b-lg overflow-hidden shadow-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Appointment</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Call Duration</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {patientGroups.inCall.length > 0 ? patientGroups.inCall.map((patient) => (
                            <tr key={patient.booking_id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {patient.first_name} {patient.last_name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {patient.phone_number || 'No phone number'}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{patient.doctor_name}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{formatDate(patient.booking_date)}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {patient.consultation_start_time ? formatDate(patient.consultation_start_time) : 'Not started'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <div className="flex items-center space-x-2">
                                  {/* Direct action button for ending call */}
                                  <Button 
                                    size="sm" 
                                    variant="destructive" 
                                    className="flex items-center space-x-1"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                    <span>End Call</span>
                                  </Button>
                                  
                                  {/* Context Menu */}
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreVertical className="h-4 w-4" />
                                        <span className="sr-only">Open menu</span>
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                      <DropdownMenuItem asChild>
                                        <Link href={`/dashboard/queue/${patient.booking_id}`}>
                                          <UserRound className="mr-2 h-4 w-4" />
                                          View Patient
                                        </Link>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <ClipboardList className="mr-2 h-4 w-4" />
                                        Mark Ready for Discharge
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem>
                                        <X className="mr-2 h-4 w-4" />
                                        End Call
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                                No patients currently in consultation
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
              
              {patientGroups.waitingRoom.length === 0 && patientGroups.inCall.length === 0 && (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <p className="text-gray-500">
                    {searchQuery || doctorFilter 
                      ? `No patients match your search filters` 
                      : `No patients in office currently`}
                  </p>
                </div>
              )}
            </div>
          ) : patients.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider & Reason</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Appointment Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {patients.map((patient) => (
                    <tr key={patient.booking_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {patient.first_name} {patient.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(patient.date_of_birth).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              {patient.phone_number || 'No phone number'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{patient.doctor_name}</div>
                        <div className="text-sm text-gray-500 mt-1">
                          {patient.chief_complaint || 'No reason provided'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {patient.appointment_type === 'adhoc' ? 'Adhoc' : `Booked ${new Date(patient.booking_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
                        </div>
                        {patient.check_in_time && (
                          <div className="text-sm text-gray-500 mt-1">
                            <span className="font-medium">Wait time:</span> {calculateWaitTime(patient.check_in_time, patient.consultation_start_time)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getQueueStatusBadgeClass(patient.queue_status)}`}>
                            {patient.queue_status.replace(/_/g, ' ')}
                          </span>
                          <br />
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPatientStatusBadgeClass(patient.patient_status)}`}>
                            {patient.patient_status.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2">
                          {/* Direct action button for joining call (visible for ready patients) */}
                          {(patient.patient_status === 'ready_for_provider' || patient.patient_status === 'intake') && (
                            <Button 
                              size="sm" 
                              variant="default" 
                              className="flex items-center space-x-1 bg-green-600 hover:bg-green-700"
                            >
                              <Video className="h-3.5 w-3.5" />
                              <span>Join Call</span>
                            </Button>
                          )}
                          
                          {/* Context Menu */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem asChild>
                                <Link 
                                  href={`/dashboard/queue/${patient.booking_id}`}
                                  className="flex items-center cursor-pointer"
                                >
                                  <UserRound className="mr-2 h-4 w-4" />
                                  View Patient
                                </Link>
                              </DropdownMenuItem>
                              
                              {/* Intake action - shown only for pending, confirmed, intake status */}
                              {['pending', 'confirmed', 'intake'].includes(patient.patient_status) && (
                                <DropdownMenuItem>
                                  <ClipboardList className="mr-2 h-4 w-4" />
                                  Intake
                                </DropdownMenuItem>
                              )}
                              
                              {patient.patient_status === 'intake' && (
                                <DropdownMenuItem>
                                  <UserRound className="mr-2 h-4 w-4" />
                                  Mark Ready for Provider
                                </DropdownMenuItem>
                              )}
                              
                              {patient.patient_status === 'provider' && (
                                <DropdownMenuItem>
                                  <ClipboardList className="mr-2 h-4 w-4" />
                                  Mark Ready for Discharge
                                </DropdownMenuItem>
                              )}
                              
                              <DropdownMenuSeparator />
                              
                              {/* Call actions based on status */}
                              {patient.patient_status === 'ready_for_provider' && (
                                <DropdownMenuItem>
                                  <Video className="mr-2 h-4 w-4" />
                                  Join Call
                                </DropdownMenuItem>
                              )}
                              
                              {patient.patient_status === 'provider' && (
                                <DropdownMenuItem>
                                  <X className="mr-2 h-4 w-4" />
                                  End Call
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-500">No patients in this category</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
