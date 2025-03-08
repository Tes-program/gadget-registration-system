// src/pages/student/Dashboard.tsx
import { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { DevicePhoneMobileIcon, ComputerDesktopIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { OnboardingModal } from '../components/common/OnboardingModal';
import { useSupabase } from '../context/SupabaseContext';
import { getDevicesByUser } from '../services/deviceService';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

// Types
interface Device {
  id: string;
  name: string;
  type: 'smartphone' | 'laptop' | 'tablet' | 'other';
  serial_number: string;
  brand: string;
  model: string;
  status: 'pending' | 'verified' | 'reported';
  created_at: string;
  image_url: string | null;
}

export const Dashboard = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSupabase();

  // Calculate stats
  const totalDevices = devices.length;
  const activeDevices = devices.filter(d => d.status === 'verified' || d.status === 'pending').length;
  const reportedDevices = devices.filter(d => d.status === 'reported').length;

  const stats = [
    { name: 'Total Devices', value: totalDevices.toString(), icon: DevicePhoneMobileIcon },
    { name: 'Active Devices', value: activeDevices.toString(), icon: ComputerDesktopIcon },
    { name: 'Reported Lost', value: reportedDevices.toString(), icon: ExclamationTriangleIcon },
  ];

  // Get recent devices
  const recentDevices = devices
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);

  useEffect(() => {
    const fetchDevices = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await getDevicesByUser(user.id);
        
        if (error) throw error;
        
        setDevices(data || []);
      } catch (error: any) {
        console.error('Error fetching devices:', error);
        toast.error('Failed to load your devices');
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, [user]);

  return (
    <DashboardLayout>
      {/* Onboarding Modal will show if needed */}
      <OnboardingModal />

      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Overview of your registered devices and recent activity
          </p>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <div className="spinner"></div>
            <p className="mt-4 text-gray-600">Loading your devices...</p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {stats.map((stat) => (
                <div
                  key={stat.name}
                  className="bg-white overflow-hidden shadow rounded-lg"
                >
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <stat.icon className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            {stat.name}
                          </dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900">
                              {stat.value}
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Devices */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Recent Devices</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Your most recently registered devices
                  </p>
                </div>
                <Link 
                  to="/student/dashboard/devices" 
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  View all devices
                </Link>
              </div>

              {recentDevices.length > 0 ? (
                <div className="border-t border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Device Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Registered Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentDevices.map((device) => (
                        <tr key={device.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {device.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {device.type.charAt(0).toUpperCase() + device.type.slice(1)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                device.status === 'verified'
                                  ? 'bg-green-100 text-green-800'
                                  : device.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {device.status.charAt(0).toUpperCase() + device.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(device.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="border-t border-gray-200 p-6 text-center">
                  <DevicePhoneMobileIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No devices registered</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by registering your first device
                  </p>
                  <div className="mt-6">
                    <Link
                      to="/student/dashboard/register-device"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Register Device
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Links */}
            {devices.length > 0 && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link
                    to="/student/dashboard/register-device"
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Register New Device
                  </Link>
                  <Link
                    to="/student/dashboard/report-lost"
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                  >
                    Report Lost Device
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};