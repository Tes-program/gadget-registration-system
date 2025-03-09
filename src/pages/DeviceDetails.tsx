// src/components/student/DeviceDetails.tsx
import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../components/common/Modal';
import { FormInput } from '../components/common/FormInput';
import toast from 'react-hot-toast';
import { useSupabase } from '../context/SupabaseContext';
import { supabase } from '../lib/supabase';
import { uploadDeviceImage } from '../services/deviceService';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface DeviceDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  device: {
    id: string;
    name: string;
    serialNumber: string;
    brand: string;
    model: string;
    type: 'smartphone' | 'laptop' | 'tablet' | 'other';
    registrationDate: string;
    status: string;
    imageUrl?: string;
    additionalDetails?: string;
  };
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

// Constants for image validation
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const DeviceDetails = ({ isOpen, onClose, device }: DeviceDetailsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentImage, setCurrentImage] = useState(device.imageUrl);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageChanged, setImageChanged] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useSupabase();

  const {
    register,
    handleSubmit,
    formState: { errors },
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
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      // Validate file type
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast.error('Only .jpg, .jpeg, .png and .webp formats are supported');
        return;
      }
      
      // Store the file for later upload
      setSelectedFile(file);
      setImageChanged(true);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setCurrentImage('');
    setSelectedFile(null);
    setImageChanged(true);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: DeviceUpdateForm) => {
    if (!user) {
      toast.error('You must be logged in to update a device');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Handle image upload if the image was changed
      let imageUrl = device.imageUrl;
      
      if (imageChanged) {
        if (selectedFile) {
          // Upload new image
          const uploadedImageUrl = await uploadDeviceImage(selectedFile);
          if (uploadedImageUrl) {
            imageUrl = uploadedImageUrl;
          }
        } else {
          // Image was removed
          imageUrl = undefined;
        }
      }
      
      // Update device details in database
      const { error } = await supabase
        .from('devices')
        .update({
          name: data.deviceName,
          serial_number: data.serialNumber,
          brand: data.brand,
          model: data.model,
          type: data.deviceType,
          additional_details: data.additionalDetails,
          image_url: imageUrl
        })
        .eq('id', device.id)
        .eq('user_id', user.id); // Security check
      
      if (error) throw error;
      
      toast.success('Device updated successfully!');
      setIsEditing(false);
      
      // Update the local state with the new image
      device.imageUrl = imageUrl || undefined;
      
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || 'Failed to update device');
      console.error('Error updating device:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCurrentImage(device.imageUrl);
    setSelectedFile(null);
    setImageChanged(false);
    reset({
      deviceName: device.name,
      serialNumber: device.serialNumber,
      brand: device.brand,
      model: device.model,
      deviceType: device.type,
      additionalDetails: device.additionalDetails,
    });
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Device Details">
      <div className="space-y-6">
        {/* Image Section */}
        <div className="relative">
          {currentImage ? (
            <div className="aspect-w-16 aspect-h-9">
              <img
                src={currentImage}
                alt={device.name}
                className="object-cover rounded-lg"
              />
              {isEditing && (
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-100 rounded-full p-1"
                >
                  <XMarkIcon className="h-5 w-5 text-red-600" />
                </button>
              )}
            </div>
          ) : (
            <div className="aspect-w-16 aspect-h-9 flex items-center justify-center bg-gray-100 rounded-lg">
              <p className="text-gray-500">No image available</p>
            </div>
          )}
          
          {isEditing && (
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700">
                {currentImage ? "Update Image" : "Add Image"}
              </label>
              <input
                type="file"
                accept={ACCEPTED_IMAGE_TYPES.join(',')}
                ref={fileInputRef}
                onChange={handleImageChange}
                className="mt-1 block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-indigo-50 file:text-indigo-700
                  hover:file:bg-indigo-100"
              />
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, WEBP up to 5MB
              </p>
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
                required
              />
              <FormInput
                label="Serial Number"
                name="serialNumber"
                register={register}
                error={errors.serialNumber?.message}
                required
              />
              <FormInput
                label="Brand"
                name="brand"
                register={register}
                error={errors.brand?.message}
                required
              />
              <FormInput
                label="Model"
                name="model"
                register={register}
                error={errors.model?.message}
                required
              />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Device Type
                  <span className="text-red-500 ml-1">*</span>
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
                {errors.deviceType && (
                  <p className="text-sm text-red-600">{errors.deviceType.message}</p>
                )}
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
                onClick={handleCancel}
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
                <p className="mt-1 text-sm text-gray-900">
                  {device.type.charAt(0).toUpperCase() + device.type.slice(1)}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Registration Date</h4>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(device.registrationDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Status</h4>
                <p className="mt-1 text-sm text-gray-900">
                  {device.status.charAt(0).toUpperCase() + device.status.slice(1)}
                </p>
              </div>
            </div>

            {device.additionalDetails && (
              <div>
                <h4 className="text-sm font-medium text-gray-500">Additional Details</h4>
                <p className="mt-1 text-sm text-gray-900">{device.additionalDetails}</p>
              </div>
            )}

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