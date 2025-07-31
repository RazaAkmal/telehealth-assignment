'use client'

import { useState, useEffect } from 'react'
import Link from "next/link"
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
  import type { User } from '@supabase/supabase-js'

export default function DashboardPage() {

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [queueCounts, setQueueCounts] = useState({
    prebooked: 0,
    inOffice: 0,
    completed: 0
  })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (error || !data?.user) {
        // If error or no user, redirect to login
        router.push('/login')
        return
      }
      
      setUser(data.user)
      setLoading(false) 
    }
    
    getUser()
  }, [supabase, router])
  
  // Separate useEffect for queue counts
  useEffect(() => {
    // Only fetch counts if user is authenticated
    if (!user) return
    
    const fetchQueueCounts = async () => {
      try {
        // Get queue counts from our DB utility
        const response = await fetch('/api/queue/counts')
        if (!response.ok) {
          throw new Error('Failed to fetch queue counts')
        }
        
        const data = await response.json()
        setQueueCounts(data)
      } catch (error) {
        console.error('Error fetching queue counts:', error)
      }
    }
    
    fetchQueueCounts()
  }, [user])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const userName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'User'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">HealthCare Dashboard</h1>
            <nav className="flex space-x-6">
              <Link href="/dashboard/queue" className="text-gray-600 hover:text-gray-900">Telehealth Queue</Link>

              <button 
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 cursor-pointer"
              >
                Logout
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {userName}!</h2>
          <p className="text-gray-600">Here&apos;s your health overview</p>
        </div>

        {/* Telehealth Queue Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Telehealth Queue</h3>
            <Link href="/dashboard/queue" className="text-blue-600 hover:text-blue-800 text-sm">
              View Full Queue →
            </Link>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-sm text-blue-600 mb-1">Pre-booked</p>
              <p className="text-2xl font-bold text-blue-700">{queueCounts.prebooked}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-sm text-green-600 mb-1">In Office</p>
              <p className="text-2xl font-bold text-green-700">{queueCounts.inOffice}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 mb-1">Completed</p>
              <p className="text-2xl font-bold text-gray-700">{queueCounts.completed}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-2">Book Appointment</h3>
            <p className="text-gray-600 mb-4">Schedule a consultation with a healthcare provider</p>
            <Link href="/appointments/book" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium inline-block">
              Book Now
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-2">View Records</h3>
            <p className="text-gray-600 mb-4">Access your medical history and documents</p>
            <Link href="/records" className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium inline-block">
              View Records
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-2">Messages</h3>
            <p className="text-gray-600 mb-4">Communicate with your healthcare team</p>
            <Link href="/messages" className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium inline-block">
              View Messages
            </Link>
          </div>
        </div>

      </main>
    </div>
  )
}
