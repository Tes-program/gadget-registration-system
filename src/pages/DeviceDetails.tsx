// src/components/student/DeviceDetails.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../components/common/Modal';
import { FormInput } from '../components/common/FormInput';
import toast from 'react-hot-toast';
import { Device } from './DeviceList';

interface DeviceDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  device: Device; // Use your Device type from DeviceList
}

const deviceUpdateSchema = z.object({
  deviceName: z.string().min(2, 'Device name must be at least 2 characters'),
  serialNumber: z.string().min(1, 'Serial number is required'),
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  deviceType: z.enum(['smartphone', 'laptop', 'tablet', 'other']),
  additionalDetails: z.string().optional(),
});

type DeviceUpdateForm = z.infer<typeof deviceUpdateSchema>;

export const DeviceDetails = ({ isOpen, onClose, device }: DeviceDetailsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentImage, setCurrentImage] = useState(device.imageUrl);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<DeviceUpdateForm>({
    resolver: zodResolver(deviceUpdateSchema),
    defaultValues: {
      deviceName: device.name,
      serialNumber: device.serialNumber,
      brand: device.brand,
      model: device.model,
      deviceType: device.type,
      additionalDetails: device.additionalDetails,
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: DeviceUpdateForm) => {
    try {
      // TODO: Implement API call to update device
      console.log(data);
      toast.success('Device updated successfully!');
      setIsEditing(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error('Failed to update device');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Device Details">
      <div className="space-y-6">
        {/* Image Section */}
        <div className="aspect-w-16 aspect-h-9">
          <img
            src={currentImage}
            alt={device.name}
            className="object-cover rounded-lg"
          />
          {isEditing && (
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700">Update Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-1 block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-indigo-50 file:text-indigo-700
                  hover:file:bg-indigo-100"
              />
            </div>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Device Name"
                name="deviceName"
                register={register}
                error={errors.deviceName?.message}
              />
              <FormInput
                label="Serial Number"
                name="serialNumber"
                register={register}
                error={errors.serialNumber?.message}
              />
              <FormInput
                label="Brand"
                name="brand"
                register={register}
                error={errors.brand?.message}
              />
              <FormInput
                label="Model"
                name="model"
                register={register}
                error={errors.model?.message}
              />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Device Type
                </label>
                <select
                  {...register('deviceType')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="smartphone">Smartphone</option>
                  <option value="laptop">Laptop</option>
                  <option value="tablet">Tablet</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Additional Details
              </label>
              <textarea
                {...register('additionalDetails')}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  reset();
                  setCurrentImage(device.imageUrl);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <>
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
                <h4 className="text-sm font-medium text-gray-500">Brand</h4>
                <p className="mt-1 text-sm text-gray-900">{device.brand}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Model</h4>
                <p className="mt-1 text-sm text-gray-900">{device.model}</p>
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

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
              >
                Edit Device
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};