// src/pages/landing/LandingPage.tsx
import { Link, Navigate } from 'react-router-dom';
import { useSupabase } from '../context/SupabaseContext';

export const LandingPage = () => {
  const { user, profile, loading } = useSupabase();

  // If user is authenticated, redirect to appropriate dashboard
  if (!loading && user) {
    if (profile?.role === 'staff') {
      return <Navigate to="/staff/dashboard" />;
    } else {
      return <Navigate to="/student/dashboard" />;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
          <div className="space-y-8">
            {/* Logo/Brand */}
            <h1 className="text-6xl font-bold text-indigo-600">
              Gadify
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl">
              Secure device registration and verification system for campus electronics
            </p>
            
            {/* Portal Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
              {/* Student Portal */}
              <Link
                to="/student/login"
                className="group relative bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <div className="space-y-4">
                  <div className="bg-indigo-100 p-3 inline-block rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">Student Portal</h2>
                  <p className="text-gray-600">Register and manage your devices</p>
                </div>
                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </Link>

              {/* Staff Portal */}
              <Link
                to="/staff/login"
                className="group relative bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <div className="space-y-4">
                  <div className="bg-indigo-100 p-3 inline-block rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">Staff Portal</h2>
                  <p className="text-gray-600">Verify and manage device registrations</p>
                </div>
                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};