// src/pages/staff/VerifyDevices.tsx
import { useState } from 'react';
import { StaffDashboardLayout } from '../components/layout/StaffDashboardLayout';
import { MagnifyingGlassIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { VerifyDeviceModal } from '../components/common/VerifyDeviceModal';
import toast from 'react-hot-toast';

interface PendingDevice {
  id: string;
  deviceName: string;
  serialNumber: string;
  type: string;
  brand: string;
  model: string;
  registrationDate: string;
  studentName: string;
  matricNumber: string;
  imageUrl?: string;
}

export const VerifyDevices = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDevice, setSelectedDevice] = useState<PendingDevice | null>(null);
  const [pendingDevices, setPendingDevices] = useState<PendingDevice[]>([
    {
      id: '1',
      deviceName: 'iPhone 13',
      serialNumber: 'IMEI123456789',
      type: 'Smartphone',
      brand: 'Apple',
      model: 'iPhone 13',
      registrationDate: '2024-02-22',
      studentName: 'John Doe',
      matricNumber: '21/3157'
    },
    {
      id: '2',
      deviceName: 'MacBook Pro',
      serialNumber: 'C02G23ZTMD6R',
      type: 'Laptop',
      brand: 'Apple',
      model: 'MacBook Pro 2023',
      registrationDate: '2024-02-21',
      studentName: 'Jane Smith',
      matricNumber: '21/1182'
    }
    // Add more mock data as needed
  ]);

  const handleVerifyDevice = async (deviceId: string, notes: string) => {
    try {
      // In a real app, this would be an API call
      console.log(`Verifying device ${deviceId} with notes: ${notes}`);
      
      // Update the local state to remove the verified device
      setPendingDevices(prevDevices => 
        prevDevices.filter(device => device.id !== deviceId)
      );
      
      toast.success('Device verified successfully');
      return Promise.resolve();
    } catch (error) {
      console.error('Error verifying device:', error);
      toast.error('Failed to verify device');
      return Promise.reject();
    }
  };

  const filteredDevices = pendingDevices.filter(device => 
    device.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.matricNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <StaffDashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Verify New Devices</h1>
            <p className="mt-1 text-sm text-gray-500">
              Review and verify pending device registrations
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by device name, serial number, student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Pending Devices */}
        {filteredDevices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDevices.map((device) => (
              <div
                key={device.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{device.deviceName}</h3>
                      <p className="text-sm text-gray-500">{device.brand} {device.model}</p>
                      <p className="text-sm text-gray-500">{device.serialNumber}</p>
                    </div>
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Student</h4>
                      <p className="text-sm text-gray-900">{device.studentName} ({device.matricNumber})</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Registration Date</h4>
                      <p className="text-sm text-gray-900">{new Date(device.registrationDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedDevice(device)}
                    className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <CheckCircleIcon className="mr-2 h-5 w-5" />
                    Verify Device
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
            <CheckCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No pending devices</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'No devices match your search criteria' : 'All devices have been verified'}
            </p>
          </div>
        )}
      </div>

      {/* Verification Modal */}
      {selectedDevice && (
        <VerifyDeviceModal
          isOpen={!!selectedDevice}
          onClose={() => setSelectedDevice(null)}
          device={selectedDevice}
          onVerify={(deviceId, notes) => handleVerifyDevice(deviceId, notes)}
        />
      )}
    </StaffDashboardLayout>
  );
};