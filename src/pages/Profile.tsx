/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/student/Profile.tsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { FormInput } from '../components/common/FormInput';
import { useSupabase } from '../context/SupabaseContext';
import { getProfile, updateProfile } from '../services/profileService';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  matric_number: z.string().min(7, 'Invalid matric number'),
  phone_number: z.string().min(10, 'Phone number must be at least 10 digits'),
  department: z.string().min(1, 'Department is required'),
  study_level: z.enum(['100', '200', '300', '400', '500'], {
    errorMap: () => ({ message: 'Please select your level' })
  }),
  hall_of_residence: z.string().min(1, 'Hall of residence is required'),
  home_address: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, profile: contextProfile } = useSupabase();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema)
  });

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      
      try {
        // If we already have profile data in context, use that
        if (contextProfile) {
          setValue('full_name', contextProfile.full_name || '');
          setValue('email', contextProfile.email || '');
          setValue('matric_number', contextProfile.matric_number || '');
          setValue('phone_number', contextProfile.phone_number || '');
          setValue('department', contextProfile.department || '');
          setValue('study_level', (contextProfile.study_level as any) || '100');
          setValue('hall_of_residence', contextProfile.hall_of_residence || '');
          setValue('home_address', contextProfile.home_address || '');
          setLoading(false);
          return;
        }
        
        // Otherwise fetch from API
        const { data, error } = await getProfile(user.id);
        
        if (error) throw error;
        
        if (data) {
          // Set form values
          setValue('full_name', data.full_name || '');
          setValue('email', data.email || '');
          setValue('matric_number', data.matric_number || '');
          setValue('phone_number', data.phone_number || '');
          setValue('department', data.department || '');
          setValue('study_level', (data.study_level as any) || '100');
          setValue('hall_of_residence', data.hall_of_residence || '');
          setValue('home_address', data.home_address || '');
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user, contextProfile, setValue]);

  const onSubmit = async (data: ProfileForm) => {
    if (!user) return;
    
    try {
      const { error } = await updateProfile(user.id, data);
      
      if (error) throw error;
      
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-12 text-center">
          <div className="spinner"></div>
          <p className="mt-4 text-gray-600">Loading profile data...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Profile Information</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your personal information and preferences
          </p>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            {isEditing ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput<ProfileForm>
                    label="Full Name"
                    name="full_name"
                    register={register}
                    error={errors.full_name?.message}
                    required
                  />
                  
                  <FormInput<ProfileForm>
                    label="Email Address"
                    name="email"
                    type="email"
                    register={register}
                    error={errors.email?.message}
                    disabled
                  />

                  <FormInput<ProfileForm>
                    label="Matric Number"
                    name="matric_number"
                    register={register}
                    error={errors.matric_number?.message}
                    required
                  />

                  <FormInput<ProfileForm>
                    label="Phone Number"
                    name="phone_number"
                    register={register}
                    error={errors.phone_number?.message}
                    required
                  />

                  <FormInput<ProfileForm>
                    label="Department"
                    name="department"
                    register={register}
                    error={errors.department?.message}
                    required
                  />

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Study Level
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      {...register('study_level')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="100">100 Level</option>
                      <option value="200">200 Level</option>
                      <option value="300">300 Level</option>
                      <option value="400">400 Level</option>
                      <option value="500">500 Level</option>
                    </select>
                    {errors.study_level && (
                      <p className="text-sm text-red-600">{errors.study_level.message}</p>
                    )}
                  </div>

                  <FormInput<ProfileForm>
                    label="Hall of Residence"
                    name="hall_of_residence"
                    register={register}
                    error={errors.hall_of_residence?.message}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Home Address (Optional)
                  </label>
                  <textarea
                    {...register('home_address')}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Enter your home address"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
                  >
                    Edit Profile
                  </button>
                </div>
                
                <div className="border-t border-gray-200 pt-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                    <p className="mt-1 text-sm text-gray-900">{watch('full_name')}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Email Address</h3>
                    <p className="mt-1 text-sm text-gray-900">{watch('email')}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Matric Number</h3>
                    <p className="mt-1 text-sm text-gray-900">{watch('matric_number')}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
                    <p className="mt-1 text-sm text-gray-900">{watch('phone_number')}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Department</h3>
                    <p className="mt-1 text-sm text-gray-900">{watch('department')}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Study Level</h3>
                    <p className="mt-1 text-sm text-gray-900">{watch('study_level')} Level</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Hall of Residence</h3>
                    <p className="mt-1 text-sm text-gray-900">{watch('hall_of_residence')}</p>
                  </div>
                </div>

                {watch('home_address') && (
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-sm font-medium text-gray-500">Home Address</h3>
                    <p className="mt-1 text-sm text-gray-900">{watch('home_address')}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};