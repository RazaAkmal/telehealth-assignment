'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// Types
type Patient = {
  booking_id: string
  patient_id: string
  first_name: string
  last_name: string
  date_of_birth: string
  queue_status: string
  patient_status: string
  doctor_name: string
  check_in_time: string | null
  consultation_start_time: string | null
  booking_date: string
}

type QueueStatus = 'pre_booked' | 'active' | 'completed' | 'cancelled'
type PatientStatus = 'pending' | 'confirmed' | 'checked_in' | 'intake' | 'ready_for_provider' | 'provider' | 'ready_for_discharge' | 'discharged' | 'no_show' | 'cancelled'

export default function AdminPanel() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [queueFilter, setQueueFilter] = useState<QueueStatus | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<PatientStatus | 'all'>('all')
  const [updateLoading, setUpdateLoading] = useState<string | null>(null)

  // Fetch all patients
  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/queue/search')
        const data = await res.json()
        setPatients(data.data || [])
      } catch (error) {
        console.error('Error fetching patients:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPatients()
  }, [])

  // Handle patient status update
  const updatePatientStatus = async (bookingId: string, newQueueStatus: string, newPatientStatus?: string) => {
    setUpdateLoading(bookingId)
    try {
      const res = await fetch(`/api/queue/booking/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          queueStatus: newQueueStatus,
          patientStatus: newPatientStatus || undefined
        }),
      })

      if (res.ok) {
        // Update the local state
        setPatients(prevPatients => 
          prevPatients.map(patient => 
            patient.booking_id === bookingId 
              ? { 
                  ...patient, 
                  queue_status: newQueueStatus,
                  patient_status: newPatientStatus || patient.patient_status 
                }
              : patient
          )
        )
      } else {
        console.error('Failed to update patient status')
      }
    } catch (error) {
      console.error('Error updating patient status:', error)
    } finally {
      setUpdateLoading(null)
    }
  }

  // Filter patients
  const filteredPatients = patients.filter(patient => {
    const nameMatch = `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     patient.doctor_name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const queueMatch = queueFilter === 'all' || patient.queue_status === queueFilter
    const statusMatch = statusFilter === 'all' || patient.patient_status === statusFilter
    
    return nameMatch && queueMatch && statusMatch
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Telehealth Admin Panel</h1>
        <Link href="/dashboard/queue">
          <Button variant="outline">Return to Queue</Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter patients by different criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col space-y-1.5 w-full md:w-1/3">
              <Label htmlFor="search">Search</Label>
              <Input 
                id="search"
                placeholder="Search by patient or doctor name" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
            
            <div className="flex flex-col space-y-1.5 w-full md:w-1/3">
              <Label htmlFor="queueFilter">Queue Status</Label>
              <Select value={queueFilter} onValueChange={(value: QueueStatus | 'all') => setQueueFilter(value)}>
                <SelectTrigger id="queueFilter">
                  <SelectValue placeholder="Filter by queue status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pre_booked">Pre-Booked</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col space-y-1.5 w-full md:w-1/3">
              <Label htmlFor="statusFilter">Patient Status</Label>
              <Select value={statusFilter} onValueChange={(value: PatientStatus | 'all') => setStatusFilter(value)}>
                <SelectTrigger id="statusFilter">
                  <SelectValue placeholder="Filter by patient status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="checked_in">Checked In</SelectItem>
                  <SelectItem value="intake">Intake</SelectItem>
                  <SelectItem value="ready_for_provider">Ready for Provider</SelectItem>
                  <SelectItem value="provider">Provider</SelectItem>
                  <SelectItem value="ready_for_discharge">Ready for Discharge</SelectItem>
                  <SelectItem value="discharged">Discharged</SelectItem>
                  <SelectItem value="no_show">No Show</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patient List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Patient List ({filteredPatients.length})</h2>
        
        {loading ? (
          <div className="text-center py-8">Loading patients...</div>
        ) : filteredPatients.length === 0 ? (
          <div className="text-center py-8">No patients match the current filters</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPatients.map((patient) => (
              <Card key={patient.booking_id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {patient.first_name} {patient.last_name}
                      </CardTitle>
                      <CardDescription>
                        Dr. {patient.doctor_name}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                        patient.queue_status === 'pre_booked' 
                          ? 'bg-blue-100 text-blue-800' 
                          : patient.queue_status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : patient.queue_status === 'completed'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {patient.queue_status.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                        ['intake', 'ready_for_provider'].includes(patient.patient_status)
                          ? 'bg-yellow-100 text-yellow-800'
                          : ['provider', 'ready_for_discharge'].includes(patient.patient_status)
                          ? 'bg-green-100 text-green-800'
                          : ['cancelled', 'no_show'].includes(patient.patient_status)
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {patient.patient_status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-2">
                    <p>Appointment: {new Date(patient.booking_date).toLocaleDateString()}</p>
                    {patient.check_in_time && (
                      <p>Checked in: {new Date(patient.check_in_time).toLocaleTimeString()}</p>
                    )}
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="font-semibold text-sm">Queue Status</div>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        size="sm" 
                        variant={patient.queue_status === 'pre_booked' ? 'default' : 'outline'} 
                        className="h-8 text-xs"
                        disabled={updateLoading === patient.booking_id || patient.queue_status === 'pre_booked'}
                        onClick={() => updatePatientStatus(patient.booking_id, 'pre_booked')}
                      >
                        Pre-Booked
                      </Button>
                      <Button 
                        size="sm" 
                        variant={patient.queue_status === 'active' ? 'default' : 'outline'}
                        className="h-8 text-xs"
                        disabled={updateLoading === patient.booking_id || patient.queue_status === 'active'}
                        onClick={() => updatePatientStatus(patient.booking_id, 'active')}
                      >
                        Active
                      </Button>
                      <Button 
                        size="sm" 
                        variant={patient.queue_status === 'completed' ? 'default' : 'outline'}
                        className="h-8 text-xs"
                        disabled={updateLoading === patient.booking_id || patient.queue_status === 'completed'}
                        onClick={() => updatePatientStatus(patient.booking_id, 'completed')}
                      >
                        Completed
                      </Button>
                      <Button 
                        size="sm" 
                        variant={patient.queue_status === 'cancelled' ? 'default' : 'outline'}
                        className="h-8 text-xs"
                        disabled={updateLoading === patient.booking_id || patient.queue_status === 'cancelled'}
                        onClick={() => updatePatientStatus(patient.booking_id, 'cancelled')}
                      >
                        Cancelled
                      </Button>
                    </div>

                    {/* Show patient status options when queue status is active */}
                    {patient.queue_status === 'active' && (
                      <>
                        <div className="font-semibold text-sm mt-4">Patient Status</div>
                        <div className="flex flex-wrap gap-2">
                          <Button 
                            size="sm" 
                            variant={patient.patient_status === 'checked_in' ? 'default' : 'outline'}
                            className="h-8 text-xs"
                            disabled={updateLoading === patient.booking_id || patient.patient_status === 'checked_in'}
                            onClick={() => updatePatientStatus(patient.booking_id, 'active', 'checked_in')}
                          >
                            Checked In
                          </Button>
                          <Button 
                            size="sm" 
                            variant={patient.patient_status === 'intake' ? 'default' : 'outline'}
                            className="h-8 text-xs"
                            disabled={updateLoading === patient.booking_id || patient.patient_status === 'intake'}
                            onClick={() => updatePatientStatus(patient.booking_id, 'active', 'intake')}
                          >
                            Intake
                          </Button>
                          <Button 
                            size="sm" 
                            variant={patient.patient_status === 'ready_for_provider' ? 'default' : 'outline'}
                            className="h-8 text-xs"
                            disabled={updateLoading === patient.booking_id || patient.patient_status === 'ready_for_provider'}
                            onClick={() => updatePatientStatus(patient.booking_id, 'active', 'ready_for_provider')}
                          >
                            Ready for Provider
                          </Button>
                          <Button 
                            size="sm" 
                            variant={patient.patient_status === 'provider' ? 'default' : 'outline'}
                            className="h-8 text-xs"
                            disabled={updateLoading === patient.booking_id || patient.patient_status === 'provider'}
                            onClick={() => updatePatientStatus(patient.booking_id, 'active', 'provider')}
                          >
                            With Provider
                          </Button>
                          <Button 
                            size="sm" 
                            variant={patient.patient_status === 'ready_for_discharge' ? 'default' : 'outline'}
                            className="h-8 text-xs"
                            disabled={updateLoading === patient.booking_id || patient.patient_status === 'ready_for_discharge'}
                            onClick={() => updatePatientStatus(patient.booking_id, 'active', 'ready_for_discharge')}
                          >
                            Ready for Discharge
                          </Button>
                          <Button 
                            size="sm" 
                            variant={patient.patient_status === 'discharged' ? 'default' : 'outline'}
                            className="h-8 text-xs"
                            disabled={updateLoading === patient.booking_id || patient.patient_status === 'discharged'}
                            onClick={() => updatePatientStatus(patient.booking_id, 'active', 'discharged')}
                          >
                            Discharged
                          </Button>
                        </div>
                      </>
                    )}

                    <div className="mt-2 text-right">
                      <Link href={`/dashboard/queue/${patient.booking_id}`}>
                        <Button variant="link" size="sm" className="h-8 text-xs">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
