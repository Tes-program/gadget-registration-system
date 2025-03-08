// src/pages/student/ReportDevice.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { FormInput } from '../components/common/FormInput';
import toast from 'react-hot-toast';
import { useState } from 'react';

// Mock data for device selection
const userDevices = [
  { id: '1', name: 'iPhone 13', serialNumber: 'IMEI123456789' },
  { id: '2', name: 'MacBook Pro', serialNumber: 'SN987654321' },
];

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

export const ReportDevice = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<ReportForm>({
    resolver: zodResolver(reportSchema),
  });

  const incidentType = watch('incidentType');

  const onSubmit = async (data: ReportForm) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement API call to report device
      console.log(data);
      toast.success('Device reported successfully');
      reset();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error('Failed to report device');
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

        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
            {/* Device Selection */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Select Device
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
                    {device.name} - {device.serialNumber}
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
              />

              <FormInput
                label="Location"
                name="location"
                register={register}
                error={errors.location?.message}
                placeholder="Where did the incident occur?"
              />

                {/* Last Seen Time (conditional) */}
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
                disabled={isSubmitting}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting Report...' : 'Submit Report'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};