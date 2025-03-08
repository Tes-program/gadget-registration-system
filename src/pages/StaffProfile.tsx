// src/pages/staff/StaffProfile.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { StaffDashboardLayout } from '../components/layout/StaffDashboardLayout';
import { FormInput } from '../components/common/FormInput';
import { UserCircleIcon, CameraIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Define the form schema with zod
const staffProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  staffId: z.string(),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  department: z.string().min(2, 'Department must be at least 2 characters'),
  role: z.string().min(2, 'Role must be at least 2 characters'),
  biography: z.string().optional(),
});

// Infer the form type from the schema
type StaffProfileForm = z.infer<typeof staffProfileSchema>;

export const StaffProfile = () => {
  // Mock staff data - replace with actual data from API/context
  const [staffData, setStaffData] = useState({
    name: 'Dr. Sarah Wilson',
    staffId: 'STAFF-12345',
    email: 'sarah.wilson@staff.edu',
    phone: '+1234567890',
    department: 'Information Technology',
    role: 'Admin Staff',
    profileImage: null as string | null,
    biography: 'Device verification specialist with 5+ years of experience in IT security and device management.'
  });

  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<StaffProfileForm>({
    resolver: zodResolver(staffProfileSchema),
    defaultValues: {
      name: staffData.name,
      staffId: staffData.staffId,
      email: staffData.email,
      phone: staffData.phone,
      department: staffData.department,
      role: staffData.role,
      biography: staffData.biography,
    }
  });

  const onSubmit = async (formData: StaffProfileForm) => {
    try {
      // In a real app, this would be an API call
      console.log('Updating staff profile:', formData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStaffData({
        ...staffData,
        ...formData
      });
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    reset({
      name: staffData.name,
      staffId: staffData.staffId,
      email: staffData.email,
      phone: staffData.phone,
      department: staffData.department,
      role: staffData.role,
      biography: staffData.biography,
    });
  };

  return (
    <StaffDashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Staff Profile</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your personal information and preferences
          </p>
        </div>
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Profile header */}
          <div className="bg-blue-700 h-32 relative">
            <div className="absolute -bottom-16 left-8">
              <div className="relative">
                {staffData.profileImage ? (
                  <img 
                    src={staffData.profileImage} 
                    alt={staffData.name} 
                    className="h-32 w-32 rounded-full border-4 border-white bg-white"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-full border-4 border-white bg-blue-100 flex items-center justify-center">
                    <UserCircleIcon className="h-24 w-24 text-blue-600" />
                  </div>
                )}
                {isEditing && (
                  <label 
                    htmlFor="profile-image" 
                    className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md cursor-pointer"
                  >
                    <CameraIcon className="h-5 w-5 text-blue-600" />
                    <input 
                      type="file" 
                      id="profile-image" 
                      className="hidden" 
                      accept="image/*"
                      onChange={() => toast('Image upload to be implemented')}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
          
          <div className="pt-20 px-8 pb-8">
            {isEditing ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput<StaffProfileForm>
                    label="Full Name"
                    name="name"
                    register={register}
                    error={errors.name?.message}
                    required
                  />
                  
                  <FormInput<StaffProfileForm>
                    label="Staff ID"
                    name="staffId"
                    register={register}
                    error={errors.staffId?.message}
                    disabled
                  />
                  
                  <FormInput<StaffProfileForm>
                    label="Email Address"
                    name="email"
                    type="email"
                    register={register}
                    error={errors.email?.message}
                    disabled
                  />
                  
                  <FormInput<StaffProfileForm>
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    register={register}
                    error={errors.phone?.message}
                  />
                  
                  <FormInput<StaffProfileForm>
                    label="Department"
                    name="department"
                    register={register}
                    error={errors.department?.message}
                  />
                  
                  <FormInput<StaffProfileForm>
                    label="Role"
                    name="role"
                    register={register}
                    error={errors.role?.message}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Biography
                  </label>
                  <textarea
                    {...register('biography')}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                  {errors.biography && (
                    <p className="mt-1 text-sm text-red-600">{errors.biography.message}</p>
                  )}
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{staffData.name}</h2>
                    <p className="text-blue-600">{staffData.role}</p>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Edit Profile
                  </button>
                </div>
                
                <div className="border-t border-gray-200 pt-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Staff ID</h3>
                    <p className="mt-1 text-sm text-gray-900">{staffData.staffId}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Email Address</h3>
                    <p className="mt-1 text-sm text-gray-900">{staffData.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
                    <p className="mt-1 text-sm text-gray-900">{staffData.phone}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Department</h3>
                    <p className="mt-1 text-sm text-gray-900">{staffData.department}</p>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-sm font-medium text-gray-500">Biography</h3>
                  <p className="mt-1 text-sm text-gray-900">{staffData.biography}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </StaffDashboardLayout>
  );
};