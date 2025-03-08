/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/staff/StudentManagement.tsx
import { useState } from 'react';
import { StaffDashboardLayout } from '../components/layout/StaffDashboardLayout';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  DevicePhoneMobileIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import { Modal } from '../components/common/Modal';
import toast from 'react-hot-toast';

interface Student {
  id: string;
  name: string;
  matricNumber: string;
  email: string;
  department: string;
  level: string;
  registeredDevices: number;
  reportedDevices: number;
  status: 'active' | 'suspended' | 'graduated';
  lastActive: string;
}

// Student Details Modal component
const StudentDetailsModal = ({ isOpen, onClose, student, onStatusChange }: {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  onStatusChange: (studentId: string, newStatus: Student['status']) => Promise<void>;
}) => {
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  const handleStatusChange = async (newStatus: Student['status']) => {
    setIsChangingStatus(true);
    try {
      await onStatusChange(student.id, newStatus);
    } finally {
      setIsChangingStatus(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Student Details"
    >
      <div className="space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
          <div className="mt-2 border-t border-gray-200 pt-3">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{student.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Matric Number</dt>
                <dd className="mt-1 text-sm text-gray-900">{student.matricNumber}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{student.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    student.status === 'active' 
                      ? 'bg-green-100 text-green-800'
                      : student.status === 'suspended'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}>
                    {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Academic Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900">Academic Information</h3>
          <div className="mt-2 border-t border-gray-200 pt-3">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Department</dt>
                <dd className="mt-1 text-sm text-gray-900">{student.department}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Level</dt>
                <dd className="mt-1 text-sm text-gray-900">{student.level}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Device Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900">Device Information</h3>
          <div className="mt-2 border-t border-gray-200 pt-3">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Registered Devices</dt>
                <dd className="mt-1 text-sm text-gray-900">{student.registeredDevices}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Reported Lost/Stolen</dt>
                <dd className="mt-1 text-sm text-gray-900">{student.reportedDevices}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Active</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(student.lastActive).toLocaleString()}
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
          
          {student.status !== 'graduated' && (
            <button
              onClick={() => handleStatusChange(student.status === 'active' ? 'suspended' : 'active')}
              disabled={isChangingStatus}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                student.status === 'active' 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-green-600 hover:bg-green-700'
              } disabled:opacity-50`}
            >
              {isChangingStatus 
                ? 'Processing...' 
                : student.status === 'active' 
                  ? 'Suspend Student' 
                  : 'Activate Student'
              }
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

// Confirmation Modal
const ConfirmStatusChangeModal = ({ isOpen, onClose, student, onConfirm }: {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  onConfirm: () => Promise<void>;
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const isActivating = student.status === 'suspended';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${isActivating ? 'Activate' : 'Suspend'} Student`}
    >
      <div className="space-y-4">
        <div className={`bg-${isActivating ? 'green' : 'red'}-50 p-4 rounded-lg`}>
          <div className="flex">
            <div className="ml-3">
              <h3 className={`text-sm font-medium text-${isActivating ? 'green' : 'red'}-800`}>
                Confirmation Required
              </h3>
              <div className={`mt-2 text-sm text-${isActivating ? 'green' : 'red'}-700`}>
                <p>
                  Are you sure you want to {isActivating ? 'activate' : 'suspend'} {student.name} ({student.matricNumber})?
                </p>
                {!isActivating && (
                  <p className="mt-2">
                    This will prevent the student from registering new devices and may affect their access to campus services.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isActivating 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-red-600 hover:bg-red-700'
            } disabled:opacity-50`}
          >
            {isSubmitting 
              ? 'Processing...' 
              : isActivating 
                ? 'Activate Student' 
                : 'Suspend Student'
            }
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Main StudentManagement component
export const StudentManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Student['status']>('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentToChangeStatus, setStudentToChangeStatus] = useState<Student | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Mock data - replace with API call
  const [students, setStudents] = useState<Student[]>([
    {
      id: '1',
      name: 'John Doe',
      matricNumber: '21/3157',
      email: 'john.doe@student.edu',
      department: 'Computer Science',
      level: '300',
      registeredDevices: 2,
      reportedDevices: 0,
      status: 'active',
      lastActive: '2024-02-20T10:30:00'
    },
    {
      id: '2',
      name: 'Jane Smith',
      matricNumber: '21/1182',
      email: 'jane.smith@student.edu',
      department: 'Electrical Engineering',
      level: '400',
      registeredDevices: 1,
      reportedDevices: 1,
      status: 'suspended',
      lastActive: '2024-02-18T14:15:00'
    },
    {
      id: '3',
      name: 'Michael Johnson',
      matricNumber: '22/1066',
      email: 'michael.j@student.edu',
      department: 'Medicine',
      level: '500',
      registeredDevices: 3,
      reportedDevices: 0,
      status: 'active',
      lastActive: '2024-02-19T09:45:00'
    },
    {
      id: '4',
      name: 'Sarah Williams',
      matricNumber: '20/2247',
      email: 'sarah.w@student.edu',
      department: 'Business Administration',
      level: '400',
      registeredDevices: 2,
      reportedDevices: 0,
      status: 'graduated',
      lastActive: '2023-12-15T11:20:00'
    }
  ]);

  const handleStatusChange = async (studentId: string, newStatus: Student['status']) => {
    try {
      // In a real app, this would be an API call
      console.log(`Changing status of student ${studentId} to ${newStatus}`);
      
      // Update the local state
      setStudents(prevStudents => 
        prevStudents.map(student => 
          student.id === studentId 
            ? { ...student, status: newStatus } 
            : student
        )
      );
      
      toast.success(`Student status updated to ${newStatus}`);
      setSelectedStudent(null);
      setStudentToChangeStatus(null);
      return Promise.resolve();
    } catch (error) {
      console.error('Error changing student status:', error);
      toast.error('Failed to update student status');
      return Promise.reject(error);
    }
  };

  const getStatusColor = (status: Student['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'graduated':
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter and search
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.matricNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesFilter = statusFilter === 'all' || student.status === statusFilter;
    
    return matchesSearch && matchesFilter;
  });

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <StaffDashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage student accounts and device registrations
            </p>
          </div>

          {/* Export Button */}
          <button
            onClick={() => {
              toast('Export functionality will be implemented');
            }}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Export Data
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, matric number, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Students</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="graduated">Graduated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Details
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Devices
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Active
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedStudents.map((student) => (
                  <tr key={student.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">{student.matricNumber}</div>
                          <div className="text-sm text-gray-500">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.department}</div>
                      <div className="text-sm text-gray-500">{student.level} Level</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <DevicePhoneMobileIcon className="h-5 w-5 mr-1" />
                          {student.registeredDevices}
                        </div>
                        {student.reportedDevices > 0 && (
                          <div className="flex items-center text-sm text-red-500">
                            <ExclamationTriangleIcon className="h-5 w-5 mr-1" />
                            {student.reportedDevices}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(student.status)}`}>
                        {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(student.lastActive).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        View Details
                      </button>
                      {student.status !== 'graduated' && (
                        <button
                          onClick={() => setStudentToChangeStatus(student)}
                          className={`${
                            student.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {student.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * itemsPerPage, filteredStudents.length)}
                      </span>{' '}
                      of <span className="font-medium">{filteredStudents.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <span className="sr-only">Previous</span>
                        &larr;
                      </button>
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border ${
                            currentPage === i + 1
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                          } text-sm font-medium`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <span className="sr-only">Next</span>
                        &rarr;
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Student Details Modal */}
      {selectedStudent && (
        <StudentDetailsModal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          student={selectedStudent}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Confirm Status Change Modal */}
      {studentToChangeStatus && (
        <ConfirmStatusChangeModal
          isOpen={!!studentToChangeStatus}
          onClose={() => setStudentToChangeStatus(null)}
          student={studentToChangeStatus}
          onConfirm={() => handleStatusChange(
            studentToChangeStatus.id, 
            studentToChangeStatus.status === 'active' ? 'suspended' : 'active'
          )}
        />
      )}
    </StaffDashboardLayout>
  );
};