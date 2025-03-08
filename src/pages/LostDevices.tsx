// src/pages/staff/LostDevices.tsx
import { useState } from 'react';
import { StaffDashboardLayout } from '../components/layout/StaffDashboardLayout';
import { 
  MagnifyingGlassIcon, 
  ExclamationTriangleIcon,
  PhoneIcon,
  EnvelopeIcon 
} from '@heroicons/react/24/outline';
import { Modal } from '../components/common/Modal';
import toast from 'react-hot-toast';

interface LostDevice {
  id: string;
  deviceName: string;
  serialNumber: string;
  brand: string;
  model: string;
  reportDate: string;
  incidentDate: string;
  location: string;
  incidentType: 'lost' | 'stolen';
  description: string;
  policeReport?: string;
  studentName: string;
  matricNumber: string;
  studentEmail: string;
  studentPhone: string;
}

const LostDeviceDetailsModal = ({ isOpen, onClose, device, onMark }: {
  isOpen: boolean;
  onClose: () => void;
  device: LostDevice;
  onMark: (deviceId: string, action: 'found' | 'recovered') => Promise<void>;
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMarkAction = async (action: 'found' | 'recovered') => {
    setIsSubmitting(true);
    try {
      await onMark(device.id, action);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${device.incidentType === 'lost' ? 'Lost' : 'Stolen'} Device Details`}
    >
      <div className="space-y-6">
        {/* Alert Banner */}
        <div className={`bg-${device.incidentType === 'lost' ? 'yellow' : 'red'}-50 p-4 rounded-lg`}>
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className={`h-5 w-5 text-${device.incidentType === 'lost' ? 'yellow' : 'red'}-400`} />
            </div>
            <div className="ml-3">
              <h3 className={`text-sm font-medium text-${device.incidentType === 'lost' ? 'yellow' : 'red'}-800`}>
                {device.incidentType === 'lost' ? 'Lost Device' : 'Stolen Device'}
              </h3>
              <div className={`mt-2 text-sm text-${device.incidentType === 'lost' ? 'yellow' : 'red'}-700`}>
                <p>
                  This device was reported {device.incidentType} on {new Date(device.reportDate).toLocaleDateString()}.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Device Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900">Device Information</h3>
          <div className="mt-2 border-t border-gray-200 pt-3">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Device Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{device.deviceName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Serial Number</dt>
                <dd className="mt-1 text-sm text-gray-900">{device.serialNumber}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Brand & Model</dt>
                <dd className="mt-1 text-sm text-gray-900">{device.brand} {device.model}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Incident Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900">Incident Information</h3>
          <div className="mt-2 border-t border-gray-200 pt-3">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Incident Date</dt>
                <dd className="mt-1 text-sm text-gray-900">{new Date(device.incidentDate).toLocaleDateString()}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Location</dt>
                <dd className="mt-1 text-sm text-gray-900">{device.location}</dd>
              </div>
              {device.incidentType === 'stolen' && device.policeReport && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Police Report</dt>
                  <dd className="mt-1 text-sm text-gray-900">{device.policeReport}</dd>
                </div>
              )}
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900">{device.description}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Student Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900">Student Information</h3>
          <div className="mt-2 border-t border-gray-200 pt-3">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{device.studentName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Matric Number</dt>
                <dd className="mt-1 text-sm text-gray-900">{device.matricNumber}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Contact</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <div className="flex space-x-4">
                    <a href={`mailto:${device.studentEmail}`} className="flex items-center text-blue-600 hover:text-blue-800">
                      <EnvelopeIcon className="h-4 w-4 mr-1" />
                      Email
                    </a>
                    <a href={`tel:${device.studentPhone}`} className="flex items-center text-blue-600 hover:text-blue-800">
                      <PhoneIcon className="h-4 w-4 mr-1" />
                      Call
                    </a>
                  </div>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Close
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={() => handleMarkAction('found')}
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              Mark as Found
            </button>
            <button
              onClick={() => handleMarkAction('recovered')}
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              Mark as Recovered
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export const LostDevices = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'lost' | 'stolen'>('all');
  const [selectedDevice, setSelectedDevice] = useState<LostDevice | null>(null);

  // Mock data
  const [lostDevices, setLostDevices] = useState<LostDevice[]>([
    {
      id: '1',
      deviceName: 'iPhone 13',
      serialNumber: 'IMEI123456789',
      brand: 'Apple',
      model: 'iPhone 13',
      reportDate: '2024-02-15',
      incidentDate: '2024-02-14',
      location: 'University Library',
      incidentType: 'lost',
      description: 'Left my phone on a table at the library around 3pm.',
      studentName: 'John Doe',
      matricNumber: '21/3157',
      studentEmail: 'john.doe@student.edu',
      studentPhone: '+1234567890'
    },
    {
      id: '2',
      deviceName: 'MacBook Pro',
      serialNumber: 'C02G23ZTMD6R',
      brand: 'Apple',
      model: 'MacBook Pro 2023',
      reportDate: '2024-02-10',
      incidentDate: '2024-02-09',
      location: 'Campus Cafeteria',
      incidentType: 'stolen',
      description: 'My laptop was stolen from my bag while I was getting food.',
      policeReport: 'PR-12345-2024',
      studentName: 'Jane Smith',
      matricNumber: '21/1182',
      studentEmail: 'jane.smith@student.edu',
      studentPhone: '+0987654321'
    }
  ]);

  const handleMarkAction = async (deviceId: string, action: 'found' | 'recovered') => {
    try {
      // In a real app, this would be an API call
      console.log(`Marking device ${deviceId} as ${action}`);
      
      // Update the local state to remove the device
      setLostDevices(prevDevices => 
        prevDevices.filter(device => device.id !== deviceId)
      );
      
      toast.success(`Device marked as ${action}`);
      return Promise.resolve();
    } catch (error) {
      console.error(`Error marking device as ${action}:`, error);
      toast.error(`Failed to mark device as ${action}`);
      return Promise.reject();
    }
  };

  const filteredDevices = lostDevices.filter(device => {
    const matchesSearch = 
      device.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.matricNumber.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesFilter = typeFilter === 'all' || device.incidentType === typeFilter;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <StaffDashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lost & Stolen Devices</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage reports of lost and stolen devices
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by device name, serial number, student..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={typeFilter === 'all'}
                  onChange={() => setTypeFilter('all')}
                  className="form-radio h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700">All</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={typeFilter === 'lost'}
                  onChange={() => setTypeFilter('lost')}
                  className="form-radio h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700">Lost</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={typeFilter === 'stolen'}
                  onChange={() => setTypeFilter('stolen')}
                  className="form-radio h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700">Stolen</span>
              </label>
            </div>
          </div>
        </div>

        {/* Lost Devices */}
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
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${
                      device.incidentType === 'lost' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {device.incidentType === 'lost' ? 'Lost' : 'Stolen'}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Student</h4>
                      <p className="text-sm text-gray-900">{device.studentName} ({device.matricNumber})</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Reported On</h4>
                      <p className="text-sm text-gray-900">{new Date(device.reportDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Location</h4>
                      <p className="text-sm text-gray-900">{device.location}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedDevice(device)}
                    className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
            <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No devices found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || typeFilter !== 'all' 
                ? 'No devices match your search criteria' 
                : 'There are no reported lost or stolen devices'}
            </p>
          </div>
        )}
      </div>

      {/* Device Details Modal */}
      {selectedDevice && (
        <LostDeviceDetailsModal
          isOpen={!!selectedDevice}
          onClose={() => setSelectedDevice(null)}
          device={selectedDevice}
          onMark={handleMarkAction}
        />
      )}
    </StaffDashboardLayout>
  );
};