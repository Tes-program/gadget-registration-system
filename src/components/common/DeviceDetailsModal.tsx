// src/components/staff/DeviceDetailsModal.tsx
import { Modal } from '../common/Modal';
import { Device } from '../../pages/AllDevices';

interface DeviceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  device: Device;
  onVerify?: () => void;
}

export const DeviceDetailsModal = ({ isOpen, onClose, device, onVerify }: DeviceDetailsModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Device Details"
    >
      <div className="space-y-6">
        {/* Device Image */}
        {device.image && (
          <div className="aspect-w-16 aspect-h-9">
            <img
              src={device.image}
              alt={device.name}
              className="object-cover rounded-lg"
            />
          </div>
        )}

        {/* Device Information */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Device Name</h4>
            <p className="mt-1 text-sm text-gray-900">{device.name}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Serial Number</h4>
            <p className="mt-1 text-sm text-gray-900">{device.serialNumber}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Device Type</h4>
            <p className="mt-1 text-sm text-gray-900">{device.type}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Registration Date</h4>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(device.registrationDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Student Information */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-medium text-gray-900">Student Information</h3>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Name</h4>
              <p className="mt-1 text-sm text-gray-900">{device.studentName}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Matric Number</h4>
              <p className="mt-1 text-sm text-gray-900">{device.matricNumber}</p>
            </div>
          </div>
        </div>

        {/* Verification Actions */}
        {device.status === 'pending' && (
          <div className="border-t pt-4">
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={onVerify}
                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
              >
                Verify Device
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};