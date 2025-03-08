// src/pages/staff/StaffDashboard.tsx
import { useEffect, useState } from "react";
import { StaffDashboardLayout } from "../components/layout/StaffDashboardLayout";
import {
  DevicePhoneMobileIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { VerifyDeviceModal } from "../components/common/VerifyDeviceModal";
import toast from "react-hot-toast";
import { ViewDetailsModal } from "../components/common/ViewDetailsModal";
import { useNavigate } from "react-router-dom";
import { useSupabase } from "../context/SupabaseContext";
import { getAllDevices, verifyDevice } from "../services/deviceService";

// Type for a registration record
interface DeviceRegistration {
  id: string;
  name: string;
  serial_number: string;
  brand: string;
  model: string;
  status: 'pending' | 'verified' | 'reported';
  created_at: string;
  profiles: {
    full_name: string;
    matric_number: string;
  };
}

const StaffDashboard = () => {
  const [selectedDevice, setSelectedDevice] =
    useState<DeviceRegistration | null>(null);
  const [viewingDevice, setViewingDevice] = useState<DeviceRegistration | null>(
    null
  );

  const navigate = useNavigate();

  const [stats, setStats] = useState([
    { name: 'Total Registered Devices', value: '0', icon: DevicePhoneMobileIcon },
    { name: 'Pending Verifications', value: '0', icon: ClockIcon },
    { name: 'Verified Devices', value: '0', icon: CheckCircleIcon },
    { name: 'Reported Lost/Stolen', value: '0', icon: ExclamationTriangleIcon },
  ]);

  const [recentRegistrations, setRecentRegistrations] = useState<DeviceRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useSupabase();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch all devices
      const { data: allDevices, error } = await getAllDevices();
      if (error) throw error;

      if (allDevices) {
        // Calculate stats
        const total = allDevices.length;
        const pending = allDevices.filter(d => d.status === 'pending').length;
        const verified = allDevices.filter(d => d.status === 'verified').length;
        const reported = allDevices.filter(d => d.status === 'reported').length;

        setStats([
          { name: 'Total Registered Devices', value: total.toString(), icon: DevicePhoneMobileIcon },
          { name: 'Pending Verifications', value: pending.toString(), icon: ClockIcon },
          { name: 'Verified Devices', value: verified.toString(), icon: CheckCircleIcon },
          { name: 'Reported Lost/Stolen', value: reported.toString(), icon: ExclamationTriangleIcon },
        ]);

        // Get recent registrations (pending first, then by date)
        const sorted = [...allDevices].sort((a, b) => {
          // Sort by status (pending first)
          if (a.status === 'pending' && b.status !== 'pending') return -1;
          if (a.status !== 'pending' && b.status === 'pending') return 1;
          // Then by date (newest first)
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        setRecentRegistrations(sorted.slice(0, 5));
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDevice = async (deviceId: string, notes: string) => {
    if (!user) return Promise.reject(new Error('Not authenticated'));

    try {
      const { error } = await verifyDevice(deviceId, user.id, notes);
      
      if (error) throw error;
      
      // Update local state
      fetchDashboardData();
      toast.success('Device verified successfully');
      return Promise.resolve();
    } catch (error: any) {
      toast.error(error.message || 'Failed to verify device');
      return Promise.reject(error);
    }
  };

  return (
    <StaffDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Overview of device registrations and verifications
          </p>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <div className="spinner"></div>
            <p className="mt-4 text-gray-600">Loading dashboard data...</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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

            {/* Recent Registrations */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Recent Registrations
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Latest device registration requests
                </p>
              </div>
              <div className="overflow-x-auto">
                {recentRegistrations.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Device
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentRegistrations.map((reg) => (
                        <tr key={reg.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {reg.profiles.full_name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {reg.profiles.matric_number}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="text-sm font-medium text-gray-900">
                              {reg.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {reg.serial_number}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(reg.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                reg.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : reg.status === "verified"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {reg.status.charAt(0).toUpperCase() +
                                reg.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {reg.status === "pending" ? (
                              <button
                                onClick={() => setSelectedDevice(reg)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Verify
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  // View details functionality
                                  setViewingDevice(reg);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                View Details
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-gray-500">No recent registrations found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => {
                    navigate("/staff/verify");
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Verify New Devices
                </button>
                <button
                  onClick={() => {
                    navigate("/staff/reports");
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  View Reports
                </button>
                <button
                  onClick={() => {
                    navigate("/staff/lost-devices");
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Check Lost Devices
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Verification Modal */}
      {selectedDevice && (
        <VerifyDeviceModal
          isOpen={!!selectedDevice}
          onClose={() => setSelectedDevice(null)}
          device={{
            id: selectedDevice.id,
            deviceName: selectedDevice.name,
            serialNumber: selectedDevice.serial_number,
            studentName: selectedDevice.profiles.full_name,
            matricNumber: selectedDevice.profiles.matric_number
          }}
          onVerify={handleVerifyDevice}
        />
      )}
      {viewingDevice && (
        <ViewDetailsModal
          isOpen={!!viewingDevice}
          onClose={() => setViewingDevice(null)}
          device={{
            id: viewingDevice.id,
            deviceName: viewingDevice.name,
            serialNumber: viewingDevice.serial_number,
            studentName: viewingDevice.profiles.full_name,
            matricNumber: viewingDevice.profiles.matric_number,
            status: viewingDevice.status,
            registrationDate: viewingDevice.created_at
          }}
        />
      )}
    </StaffDashboardLayout>
  );
};

export default StaffDashboard;