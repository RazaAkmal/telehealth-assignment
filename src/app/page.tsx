import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Simple Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">HealthCare</h1>
            <nav className="flex space-x-6">
              <Link href="/login" className="text-gray-600 hover:text-gray-900">Login</Link>
              <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Sign Up</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Online Healthcare Consultations
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with licensed doctors from the comfort of your home. 
            Book appointments, get prescriptions, and manage your health records.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="bg-blue-50 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🩺</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Video Consultations</h3>
            <p className="text-gray-600">
              Secure video calls with healthcare professionals
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-50 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📅</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Easy Scheduling</h3>
            <p className="text-gray-600">
              Book appointments that fit your schedule
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-50 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📋</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Health Records</h3>
            <p className="text-gray-600">
              Access your medical history and prescriptions
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to get started?</h3>
          <p className="text-gray-600 mb-6">
            Join thousands of patients who trust us with their healthcare needs.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/register" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium">
              Get Started
            </Link>
            <Link href="/doctors" className="bg-white text-gray-900 px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 font-medium">
              Find a Doctor
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
