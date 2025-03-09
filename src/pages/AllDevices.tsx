/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/staff/AllDevices.tsx
import { useState, useEffect } from 'react';
import { StaffDashboardLayout } from '../components/layout/StaffDashboardLayout';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { Pagination } from '../components/common/Pagination';
import { DeviceDetailsModal } from '../components/common/DeviceDetailsModal';
import { useSupabase } from '../context/SupabaseContext';
import { getAllDevices, verifyDevice } from '../services/deviceService';
import { supabase } from '../lib/supabase';

// Types
type DeviceStatus = 'verified' | 'pending' | 'reported';
type FilterType = 'all' | DeviceStatus;

export interface Device {
  id: string;
  name: string;
  serialNumber: string;
  type: string;
  studentName: string;
  matricNumber: string;
  registrationDate: string;
  status: DeviceStatus;
  image?: string;
}

export const AllDevices = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const { user } = useSupabase();
  const itemsPerPage = 10;

  // Fetch devices from Supabase
  useEffect(() => {
    const fetchDevices = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await getAllDevices(
          activeFilter !== 'all' ? activeFilter : undefined
        );
        
        if (error) throw error;
        
        if (data) {
          // Transform the data to match our component's expected format
          const formattedDevices = data.map(device => ({
            id: device.id,
            name: device.name,
            serialNumber: device.serial_number,
            type: device.type.charAt(0).toUpperCase() + device.type.slice(1),
            studentName: device.profiles?.full_name || 'Unknown',
            matricNumber: device.profiles?.matric_number || 'Unknown',
            registrationDate: device.created_at,
            status: device.status as DeviceStatus,
            image: device.image_url || undefined
          }));
          
          setDevices(formattedDevices);
          setTotalCount(formattedDevices.length);
        }
      } catch (error: any) {
        console.error('Error fetching devices:', error);
        toast.error('Failed to load devices');
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, [user, activeFilter]);

  const getStatusColor = (status: DeviceStatus) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reported':
        return 'bg-red-100 text-red-800';
    }
  };

  const getStatusIcon = (status: DeviceStatus) => {
    switch (status) {
      case 'verified':
        return CheckCircleIcon;
      case 'pending':
        return ClockIcon;
      case 'reported':
        return XCircleIcon;
    }
  };

  const filteredDevices = devices.filter(device => {
    const matchesSearch = 
      device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.matricNumber.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const paginatedDevices = filteredDevices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredDevices.length / itemsPerPage);

  const handleVerifyDevice = async (device: Device) => {
    if (!user) {
      toast.error('You must be logged in to verify devices');
      return;
    }
    
    try {
      const { error } = await verifyDevice(device.id, user.id);
      
      if (error) throw error;
      
      // Update local state
      setDevices(prevDevices => 
        prevDevices.map(d => 
          d.id === device.id ? { ...d, status: 'verified' } : d
        )
      );
      
      toast.success('Device verified successfully');
      setSelectedDevice(null);
    } catch (error: any) {
      console.error('Error verifying device:', error);
      toast.error(error.message || 'Failed to verify device');
    }
  };

  const handleExportCSV = async () => {
    // Create CSV content from filtered devices
    const headers = ['Device Name', 'Serial Number', 'Type', 'Student Name', 'Matric Number', 'Registration Date', 'Status'];
    const csvRows = [
      headers.join(','),
      ...filteredDevices.map(device => [
        device.name,
        device.serialNumber,
        device.type,
        device.studentName,
        device.matricNumber,
        new Date(device.registrationDate).toLocaleDateString(),
        device.status
      ].join(','))
    ];
    
    const csvContent = csvRows.join('\n');
    
    // Create a blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `devices_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Export complete');
  };

  return (
    <StaffDashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Registered Devices</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage and verify student device registrations
            </p>
          </div>

          {/* Export/Print Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Export CSV
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Print List
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search devices, students, or serial numbers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              {(['all', 'verified', 'pending', 'reported'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeFilter === filter
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Devices Table */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="spinner"></div>
            </div>
          ) : filteredDevices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Device Details
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registration Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedDevices.map((device) => {
                    const StatusIcon = getStatusIcon(device.status);
                    return (
                      <tr key={device.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {device.image && (
                              <img
                                src={device.image}
                                alt={device.name}
                                className="h-10 w-10 rounded-md mr-3 object-cover"
                              />
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">{device.name}</div>
                              <div className="text-sm text-gray-500">{device.serialNumber}</div>
                              <div className="text-sm text-gray-500">{device.type}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{device.studentName}</div>
                          <div className="text-sm text-gray-500">{device.matricNumber}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(device.registrationDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(device.status)}`}>
                            <StatusIcon className="w-4 h-4 mr-1" />
                            {device.status.charAt(0).toUpperCase() + device.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setSelectedDevice(device)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View Details
                            </button>
                            {device.status === 'pending' && (
                              <button
                                onClick={() => setSelectedDevice(device)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Verify
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No devices found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search terms' : 'There are no devices matching your filters'}
              </p>
            </div>
          )}

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>

      {selectedDevice && (
        <DeviceDetailsModal
          isOpen={!!selectedDevice}
          onClose={() => setSelectedDevice(null)}
          device={selectedDevice}
          onVerify={() => handleVerifyDevice(selectedDevice)}
        />
      )}
    </StaffDashboardLayout>
  );
};