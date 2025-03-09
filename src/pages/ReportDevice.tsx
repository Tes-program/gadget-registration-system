/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/student/ReportDevice.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { FormInput } from '../components/common/FormInput';
import toast from 'react-hot-toast';
import { useSupabase } from '../context/SupabaseContext';
import { getDevicesByUser } from '../services/deviceService';
import { reportDevice } from '../services/reportService';
import { supabase } from '../lib/supabase';

// Define the schema for form validation
const reportSchema = z.object({
  deviceId: z.string().min(1, 'Please select a device'),
  dateOfIncident: z.string().min(1, 'Date of incident is required'),
  location: z.string().min(1, 'Location is required'),
  incidentType: z.enum(['lost', 'stolen'], {
    errorMap: () => ({ message: 'Please select an incident type' }),
  }),
  description: z.string().min(10, 'Please provide more details about the incident'),
  policeReport: z.string().optional(),
  additionalInfo: z.string().optional(),
  lastSeenTime: z.string().optional(),
});

type ReportForm = z.infer<typeof reportSchema>;

// Interface for devices from the database
interface Device {
  id: string;
  name: string;
  serial_number: string;
  status: string;
}

export const ReportDevice = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userDevices, setUserDevices] = useState<Device[]>([]);
  const { user } = useSupabase();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<ReportForm>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      incidentType: 'lost',
    }
  });

  const incidentType = watch('incidentType');

  // Fetch user's active devices (not already reported)
  useEffect(() => {
    const fetchDevices = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const { data, error } = await getDevicesByUser(user.id);
        
        if (error) throw error;
        
        // Filter out devices that are already reported
        const activeDevices = data?.filter(device => device.status !== 'reported') || [];
        setUserDevices(activeDevices);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load your devices');
        console.error('Error fetching devices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, [user]);

  const onSubmit = async (data: ReportForm) => {
    if (!user) {
      toast.error('You must be logged in to report a device');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Create the report in the database
      const { error } = await reportDevice(user.id, {
        device_id: data.deviceId,
        incident_type: data.incidentType,
        incident_date: data.dateOfIncident,
        location: data.location,
        description: data.description,
        police_report: data.policeReport || undefined
      });
      
      if (error) throw error;
      
      // Update the device status to 'reported'
      const { error: deviceUpdateError } = await supabase
        .from('devices')
        .update({ status: 'reported' })
        .eq('id', data.deviceId)
        .eq('user_id', user.id); // Security check
      
      if (deviceUpdateError) throw deviceUpdateError;
      
      toast.success('Device reported successfully');
      
      // Reset the form
      reset();
      
      // Refresh the device list to remove the reported device
      const { data: refreshedDevices, error: refreshError } = await getDevicesByUser(user.id);
      if (!refreshError && refreshedDevices) {
        const activeDevices = refreshedDevices.filter(device => device.status !== 'reported');
        setUserDevices(activeDevices);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to report device');
      console.error('Error reporting device:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Report Lost/Stolen Device</h1>
          <p className="mt-1 text-sm text-gray-500">
            Please provide details about your lost or stolen device
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="spinner"></div>
          </div>
        ) : userDevices.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <div className="py-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No active devices</h3>
              <p className="mt-1 text-sm text-gray-500">
                You don't have any active devices to report. All your devices might be already reported or you haven't registered any devices yet.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
              {/* Device Selection */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Select Device
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  {...register('deviceId')}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors.deviceId ? 'border-red-300' : 'border-gray-300'
                  } focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                >
                  <option value="">Select a device</option>
                  {userDevices.map((device) => (
                    <option key={device.id} value={device.id}>
                      {device.name} - {device.serial_number}
                    </option>
                  ))}
                </select>
                {errors.deviceId && (
                  <p className="text-sm text-red-600">{errors.deviceId.message}</p>
                )}
              </div>

              {/* Incident Type */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Incident Type
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      {...register('incidentType')}
                      value="lost"
                      className="form-radio h-4 w-4 text-indigo-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">Lost</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      {...register('incidentType')}
                      value="stolen"
                      className="form-radio h-4 w-4 text-indigo-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">Stolen</span>
                  </label>
                </div>
                {errors.incidentType && (
                  <p className="text-sm text-red-600">{errors.incidentType.message}</p>
                )}
              </div>

              {/* Date and Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  label="Date of Incident"
                  name="dateOfIncident"
                  type="date"
                  register={register}
                  error={errors.dateOfIncident?.message}
                  required
                />

                <FormInput
                  label="Location"
                  name="location"
                  register={register}
                  error={errors.location?.message}
                  placeholder="Where did the incident occur?"
                  required
                />

                {/* Last Seen Time (optional) */}
                <FormInput
                  label="Last Seen Time"
                  name="lastSeenTime"
                  type="time"
                  register={register}
                  error={errors.lastSeenTime?.message}
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Description of Incident
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className={`mt-1 block w-full rounded-md shadow-sm ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  } focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                  placeholder="Please provide details about how the device was lost or stolen"
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              {/* Police Report Number (conditional) */}
              {incidentType === 'stolen' && (
                <FormInput
                  label="Police Report Number (Optional)"
                  name="policeReport"
                  register={register}
                  error={errors.policeReport?.message}
                  placeholder="Enter the police report number if available"
                />
              )}

              {/* Additional Information */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Additional Information (Optional)
                </label>
                <textarea
                  {...register('additionalInfo')}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Any additional information that might be helpful"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => reset()}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Clear Form
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || userDevices.length === 0}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting Report...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};