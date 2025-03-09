/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/staff/StudentManagement.tsx
import { useState, useEffect } from 'react';
import { StaffDashboardLayout } from '../components/layout/StaffDashboardLayout';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  DevicePhoneMobileIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import { Modal } from '../components/common/Modal';
import toast from 'react-hot-toast';
import { useSupabase } from '../context/SupabaseContext';
import { supabase } from '../lib/supabase';
import { getAllStudents, updateStudentStatus } from '../services/profileService';

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
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'graduated'>('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentToChangeStatus, setStudentToChangeStatus] = useState<Student | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSupabase();
  const itemsPerPage = 10;

  // Fetch students data
  useEffect(() => {
    const fetchStudents = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch all student profiles
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'student');
        
        if (profilesError) throw profilesError;
        
        // Fetch all devices to count per student
        const { data: devicesData, error: devicesError } = await supabase
          .from('devices')
          .select('*');
        
        if (devicesError) throw devicesError;
        
        // Process the data
        const formattedStudents = await Promise.all((profilesData || []).map(async (profile) => {
          // Count devices for this student
          const studentDevices = devicesData?.filter(device => device.user_id === profile.id) || [];
          const registeredDevices = studentDevices.length;
          const reportedDevices = studentDevices.filter(device => device.status === 'reported').length;
          
          // Fetch last login time from auth.users if available
          const lastActive = profile.updated_at || profile.created_at;
          
          return {
            id: profile.id,
            name: profile.full_name || 'Unknown',
            matricNumber: profile.matric_number || 'Unknown',
            email: profile.email || 'Unknown',
            department: profile.department || 'Unknown',
            level: profile.study_level || 'Unknown',
            registeredDevices,
            reportedDevices,
            status: profile.status || 'active',
            lastActive
          } as Student;
        }));
        
        setStudents(formattedStudents);
      } catch (error: any) {
        console.error('Error fetching students:', error);
        toast.error('Failed to load students');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudents();
  }, [user]);

  const handleStatusChange = async (studentId: string, newStatus: Student['status']) => {
    try {
      const { error } = await updateStudentStatus(studentId, newStatus);
      
      if (error) throw error;
      
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
    } catch (error: any) {
      console.error('Error changing student status:', error);
      toast.error(error.message || 'Failed to update student status');
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

  const handleExportCSV = () => {
    // Create CSV content from filtered students
    const headers = ['Name', 'Matric Number', 'Email', 'Department', 'Level', 'Status', 'Devices', 'Reported'];
    const csvRows = [
      headers.join(','),
      ...filteredStudents.map(student => [
        student.name,
        student.matricNumber,
        student.email,
        student.department,
        student.level,
        student.status,
        student.registeredDevices,
        student.reportedDevices
      ].join(','))
    ];
    
    const csvContent = csvRows.join('\n');
    
    // Create a blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `students_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Export complete');
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
            onClick={handleExportCSV}
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
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="spinner"></div>
            </div>
          ) : filteredStudents.length > 0 ? (
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
          ) : (
            <div className="text-center py-12">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter' 
                  : 'No students are currently registered in the system'}
              </p>
            </div>
          )}

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