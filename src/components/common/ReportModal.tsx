// src/components/student/ReportLostModal.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../common/Modal';
import { FormInput } from '../common/FormInput';

interface ReportLostModalProps {
  isOpen: boolean;
  onClose: () => void;
  device: {
    id: string;
    name: string;
  };
  onReportSubmit: (data: ReportLostFormData) => Promise<void>;
}

const reportLostSchema = z.object({
  location: z.string().min(1, 'Location is required'),
  dateOfIncident: z.string().min(1, 'Date of incident is required'),
  description: z.string().min(10, 'Please provide more details about the incident'),
  incidentType: z.enum(['lost', 'stolen'], {
    errorMap: () => ({ message: 'Please select an incident type' }),
  }),
  policeReport: z.string().optional(),
});

export type ReportLostFormData = z.infer<typeof reportLostSchema>;

export const ReportLostModal = ({ isOpen, onClose, device, onReportSubmit }: ReportLostModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReportLostFormData>({
    resolver: zodResolver(reportLostSchema),
    defaultValues: {
      incidentType: 'lost',
    }
  });

  const incidentType = watch('incidentType');

  const onSubmit = async (data: ReportLostFormData) => {
    setIsSubmitting(true);
    try {
      await onReportSubmit(data);
      reset();
      onClose();
    } catch (error) {
      console.error('Failed to report device:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Report ${device.name} as Lost/Stolen`}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Incident Type Selection */}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        {/* Police Report (Conditional) */}
        {incidentType === 'stolen' && (
          <FormInput
            label="Police Report Number (Optional)"
            name="policeReport"
            register={register}
            error={errors.policeReport?.message}
            placeholder="Enter the police report number if available"
          />
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
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
    </Modal>
  );
};