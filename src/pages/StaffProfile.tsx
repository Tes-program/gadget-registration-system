/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/staff/StaffProfile.tsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { StaffDashboardLayout } from '../components/layout/StaffDashboardLayout';
import { FormInput } from '../components/common/FormInput';
import { UserCircleIcon, CameraIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useSupabase } from '../context/SupabaseContext';
import { getProfile, updateProfile } from '../services/profileService';
import { supabase } from '../lib/supabase';

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
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const { user, profile: contextProfile } = useSupabase();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue
  } = useForm<StaffProfileForm>({
    resolver: zodResolver(staffProfileSchema),
    defaultValues: {
      name: '',
      staffId: '',
      email: '',
      phone: '',
      department: '',
      role: '',
      biography: ''
    }
  });

  // Fetch staff profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // If we already have profile data in context, use that
        if (contextProfile) {
          setValue('name', contextProfile.full_name || '');
          setValue('email', contextProfile.email || '');
          setValue('staffId', contextProfile.staff_id || '');
          setValue('phone', contextProfile.phone_number || '');
          setValue('department', contextProfile.department || '');
          setValue('role', contextProfile.role === 'staff' ? 'Staff' : '');
          setValue('biography', contextProfile.biography || '');
          setProfileImage(null); // Set profile image if available
          setLoading(false);
          return;
        }
        
        // Otherwise fetch from API
        const { data, error } = await getProfile(user.id);
        
        if (error) throw error;
        
        if (data) {
          // Set form values
          setValue('name', data.full_name || '');
          setValue('email', data.email || '');
          setValue('staffId', data.staff_id || '');
          setValue('phone', data.phone_number || '');
          setValue('department', data.department || '');
          setValue('role', data.role === 'staff' ? 'Staff' : '');
          setValue('biography', data.biography || '');
          setProfileImage(null); // Set profile image if available
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user, contextProfile, setValue]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadProfileImage = async (file: File): Promise<string | null> => {
    try {
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `profile-images/${fileName}`;
      
      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('gadify')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: publicUrlData } = await supabase.storage
        .from('gadify')
        .getPublicUrl(filePath);
      
      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      return null;
    }
  };

  const onSubmit = async (data: StaffProfileForm) => {
    if (!user) {
      toast.error('You must be logged in to update your profile');
      return;
    }
    
    try {
      // Upload profile image if selected
      // let imageUrl = null;
      // if (selectedImage) {
      //   imageUrl = await uploadProfileImage(selectedImage);
      // }
      
      // Prepare profile data
      const profileData = {
        full_name: data.name,
        staff_id: data.staffId,
        phone_number: data.phone,
        department: data.department,
        biography: data.biography,
        // Don't update email as it's managed by auth
        // Don't update role as it should remain 'staff'
      };
      
      // Add image URL if we got one
      // if (imageUrl) {
      //   profileData['profile_image'] = imageUrl;
      // }
      
      // Update profile
      const { error } = await updateProfile(user.id, profileData);
      
      if (error) throw error;
      
      toast.success('Profile updated successfully');
      setIsEditing(false);
      setSelectedImage(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    }
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedImage(null);
    
    // Reset form to original values
    if (contextProfile) {
      setValue('name', contextProfile.full_name || '');
      setValue('staffId', contextProfile.staff_id || '');
      setValue('phone', contextProfile.phone_number || '');
      setValue('department', contextProfile.department || '');
      setValue('biography', contextProfile.biography || '');
    }
    
    // Reset image preview if needed
    setProfileImage(null); // Reset to original profile image
  };

  if (loading) {
    return (
      <StaffDashboardLayout>
        <div className="py-12 text-center">
          <div className="spinner"></div>
          <p className="mt-4 text-gray-600">Loading profile data...</p>
        </div>
      </StaffDashboardLayout>
    );
  }

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
                {profileImage ? (
                  <img 
                    src={profileImage} 
                    alt="Profile" 
                    className="h-32 w-32 rounded-full border-4 border-white bg-white object-cover"
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
                      onChange={handleImageChange}
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
                    disabled
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
                    <h2 className="text-2xl font-bold text-gray-900">{contextProfile?.full_name || 'Staff Member'}</h2>
                    <p className="text-blue-600">{contextProfile?.role === 'staff' ? 'Staff' : ''}</p>
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
                    <p className="mt-1 text-sm text-gray-900">{contextProfile?.staff_id || 'Not set'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Email Address</h3>
                    <p className="mt-1 text-sm text-gray-900">{contextProfile?.email || 'Not set'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
                    <p className="mt-1 text-sm text-gray-900">{contextProfile?.phone_number || 'Not set'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Department</h3>
                    <p className="mt-1 text-sm text-gray-900">{contextProfile?.department || 'Not set'}</p>
                  </div>
                </div>
                
                {contextProfile?.biography && (
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-sm font-medium text-gray-500">Biography</h3>
                    <p className="mt-1 text-sm text-gray-900">{contextProfile.biography}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </StaffDashboardLayout>
  );
};