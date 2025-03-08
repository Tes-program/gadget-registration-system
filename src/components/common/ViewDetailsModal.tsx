// src/components/staff/ViewDetailsModal.tsx
import { Modal } from '../common/Modal';

interface ViewDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  device: {
    id: string;
    deviceName: string;
    studentName: string;
    matricNumber: string;
    serialNumber: string;
    registrationDate: string;
    status: string;
  };
}

export const ViewDetailsModal = ({ isOpen, onClose, device }: ViewDetailsModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Device Details"
    >
      <div className="space-y-6">
        {/* Device Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900">Device Information</h3>
          <div className="mt-3 border-t border-gray-200 pt-3">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Device Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{device.deviceName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Serial Number</dt>
                <dd className="mt-1 text-sm text-gray-900">{device.serialNumber}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Registration Date</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(device.registrationDate).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    device.status === 'pending' 
                      ? 'bg-yellow-100 text-yellow-800'
                      : device.status === 'verified'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {device.status.charAt(0).toUpperCase() + device.status.slice(1)}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Student Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900">Student Information</h3>
          <div className="mt-3 border-t border-gray-200 pt-3">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{device.studentName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Matric Number</dt>
                <dd className="mt-1 text-sm text-gray-900">{device.matricNumber}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};