// src/components/staff/VerifyDeviceModal.tsx
import { useState } from 'react';
import { Modal } from '../common/Modal';
import toast from 'react-hot-toast';

interface VerifyDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  device: {
    id: string;
    deviceName: string;
    studentName: string;
    serialNumber: string;
    matricNumber: string;
  };
  onVerify: (deviceId: string, notes: string) => Promise<void>;
}

export const VerifyDeviceModal = ({ isOpen, onClose, device, onVerify }: VerifyDeviceModalProps) => {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVerify = async () => {
    setIsSubmitting(true);
    try {
      await onVerify(device.id, notes);
      onClose();
    } catch (error) {
      console.error('Error verifying device:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Verify Device Registration"
    >
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Verification Information
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  You are about to verify the following device registration:
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-b border-gray-200 py-4">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Device Name</dt>
              <dd className="mt-1 text-sm text-gray-900">{device.deviceName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Serial Number</dt>
              <dd className="mt-1 text-sm text-gray-900">{device.serialNumber}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Student Name</dt>
              <dd className="mt-1 text-sm text-gray-900">{device.studentName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Matric Number</dt>
              <dd className="mt-1 text-sm text-gray-900">{device.matricNumber}</dd>
            </div>
          </dl>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Verification Notes (Optional)
          </label>
          <div className="mt-1">
            <textarea
              id="notes"
              name="notes"
              rows={3}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Add any notes about this verification"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleVerify}
            disabled={isSubmitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Verifying...' : 'Verify Device'}
          </button>
        </div>
      </div>
    </Modal>
  );
};