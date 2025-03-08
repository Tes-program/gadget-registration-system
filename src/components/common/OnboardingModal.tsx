/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/student/OnboardingModal.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../common/Modal';
import { FormInput } from '../common/FormInput';
import { useSupabase } from '../../context/SupabaseContext';
import { useOnboarding } from '../../context/OnboardingContext';
import { updateProfile } from '../../services/profileService';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const onboardingSchema = z.object({
  department: z.string().min(1, 'Department is required'),
  study_level: z.enum(['100', '200', '300', '400', '500'], {
    errorMap: () => ({ message: 'Please select your level' })
  }),
  hall_of_residence: z.string().min(1, 'Hall of residence is required'),
  home_address: z.string().optional(),
});

type OnboardingForm = z.infer<typeof onboardingSchema>;

export const OnboardingModal: React.FC = () => {
  const { user, profile } = useSupabase();
  const { needsOnboarding, completeOnboarding } = useOnboarding();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<OnboardingForm>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      department: profile?.department || '',
      study_level: (profile?.study_level as any) || '100',
      hall_of_residence: profile?.hall_of_residence || '',
      home_address: profile?.home_address || '',
    }
  });

  const onSubmit = async (data: OnboardingForm) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await updateProfile(user.id, data);
      
      if (error) throw error;
      
      toast.success('Profile completed successfully!');
      completeOnboarding();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Skip to profile page to complete
  const handleCompleteProfile = () => {
    navigate('/dashboard/profile');
    completeOnboarding(); // Dismiss modal, but they'll be directed to profile page
  };

  return (
    <Modal
      isOpen={needsOnboarding}
      onClose={() => {}} // Empty function - can't close without completing
      title="Complete Your Profile"
    >
      <div className="space-y-6">
        <p className="text-sm text-gray-600">
          Welcome to Gadify! Please complete your profile information to continue.
          This will help us better identify and manage your device registrations.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <FormInput<OnboardingForm>
            label="Department"
            name="department"
            register={register}
            error={errors.department?.message}
            placeholder="e.g., Computer Science"
            required
          />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Study Level <span className="text-red-500">*</span>
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

          <FormInput<OnboardingForm>
            label="Hall of Residence"
            name="hall_of_residence"
            register={register}
            error={errors.hall_of_residence?.message}
            placeholder="e.g., Hall 1"
            required
          />

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

          <div className="flex justify-between space-x-3 pt-4">
            <button
              type="button"
              onClick={handleCompleteProfile}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Complete Later
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Complete Profile'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};