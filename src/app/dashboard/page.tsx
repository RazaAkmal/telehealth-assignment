import Link from "next/link"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">HealthCare Dashboard</h1>
            <nav className="flex space-x-6">
              <Link href="/appointments" className="text-gray-600 hover:text-gray-900">Appointments</Link>
              <Link href="/profile" className="text-gray-600 hover:text-gray-900">Profile</Link>
              <Link href="/logout" className="text-gray-600 hover:text-gray-900">Logout</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, John!</h2>
          <p className="text-gray-600">Here&apos;s your health overview</p>
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

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">Upcoming Appointments</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-semibold">Dr. Sarah Johnson</h4>
                <p className="text-sm text-gray-600">General Consultation</p>
                <p className="text-sm text-gray-600">Tomorrow at 2:00 PM</p>
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
                Join Call
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-semibold">Dr. Michael Chen</h4>
                <p className="text-sm text-gray-600">Follow-up Consultation</p>
                <p className="text-sm text-gray-600">Friday at 10:30 AM</p>
              </div>
              <button className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-300 text-sm">
                View Details
              </button>
            </div>
          </div>
        </div>

        {/* Health Summary */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4">Health Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Blood Pressure</span>
                <span className="font-semibold">120/80 mmHg</span>
              </div>
              <div className="flex justify-between">
                <span>Heart Rate</span>
                <span className="font-semibold">72 bpm</span>
              </div>
              <div className="flex justify-between">
                <span>Weight</span>
                <span className="font-semibold">165 lbs</span>
              </div>
              <div className="flex justify-between">
                <span>Last Updated</span>
                <span className="text-sm text-gray-600">2 days ago</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm">Prescription refilled</p>
                <p className="text-xs text-gray-600">3 days ago</p>
              </div>
              <div>
                <p className="text-sm">Lab results uploaded</p>
                <p className="text-xs text-gray-600">1 week ago</p>
              </div>
              <div>
                <p className="text-sm">Appointment completed</p>
                <p className="text-xs text-gray-600">2 weeks ago</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
