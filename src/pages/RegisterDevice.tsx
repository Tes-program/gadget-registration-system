/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/student/RegisterDevice.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useRef } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { FormInput } from '../components/common/FormInput';
import { useSupabase } from '../context/SupabaseContext';
import { registerDevice, uploadDeviceImage } from '../services/deviceService';
import toast from 'react-hot-toast';
import { XMarkIcon } from '@heroicons/react/24/outline';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const deviceSchema = z.object({
  deviceName: z.string().min(2, 'Device name must be at least 2 characters'),
  serialNumber: z.string().min(1, 'Serial number is required'),
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  deviceType: z.enum(['smartphone', 'laptop', 'tablet', 'other'], {
    errorMap: () => ({ message: 'Please select a device type' }),
  }),
  additionalDetails: z.string().optional(),
  // Remove deviceImage from the form validation
});


type DeviceForm = z.infer<typeof deviceSchema>;

export const RegisterDevice = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useSupabase();
  // Create a ref to store the selected file
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DeviceForm>({
    resolver: zodResolver(deviceSchema),
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error('File size must be less than 5MB');
        return;
      }
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast.error('Only .jpg, .jpeg, .png and .webp formats are supported');
        return;
      }
      
      // Store the file
      setSelectedFile(file);
      
      // Create the preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setSelectedFile(null);
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: DeviceForm) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      // Get the image URL if there's an image
      let imageUrl = null;
      
      console.log("Selected file:", selectedFile);
      
      if (selectedFile) {
        // Upload the file we stored in state
        imageUrl = await uploadDeviceImage(selectedFile);
        console.log("Uploaded image URL:", imageUrl);
      }
      
      // Register device
      const deviceData: {
        name: string;
        serial_number: string;
        brand: string;
        model: string;
        type: 'smartphone' | 'laptop' | 'tablet' | 'other';
        additional_details?: string;
        image_url?: string;
      } = {
        name: data.deviceName,
        serial_number: data.serialNumber,
        brand: data.brand,
        model: data.model,
        type: data.deviceType,
        additional_details: data.additionalDetails,
      };
      
      // Only add image_url if we have one
      if (imageUrl) {
        deviceData.image_url = imageUrl;
      }
      
      const { error } = await registerDevice(user.id, deviceData);
      
      if (error) throw error;
      
      toast.success('Device registered successfully!');
      reset();
      setImagePreview(null);
      setSelectedFile(null);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to register device. Please try again.');
      console.error("Registration error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Register New Device</h1>
          <p className="mt-1 text-sm text-gray-500">
            Please fill in the details of your device for registration
          </p>
        </div>

        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
            {/* Image Upload Section */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Device Image
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Device preview"
                        className="mx-auto h-48 w-auto rounded-md"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-100 rounded-full p-1"
                      >
                        <XMarkIcon className="h-5 w-5 text-red-600" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="deviceImage"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                        >
                          <span>Upload a file</span>
                          <input
                            id="deviceImage"
                            type="file"
                            className="sr-only"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            accept={ACCEPTED_IMAGE_TYPES.join(',')}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, WEBP up to 5MB
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Rest of the form fields remain unchanged */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput<DeviceForm>
                label="Device Name"
                name="deviceName"
                register={register}
                error={errors.deviceName?.message}
                placeholder="e.g., My MacBook Pro"
                required
              />

              <FormInput<DeviceForm>
                label="Serial Number"
                name="serialNumber"
                register={register}
                error={errors.serialNumber?.message}
                placeholder="Enter device serial number"
                required
              />

              <FormInput<DeviceForm>
                label="Brand"
                name="brand"
                register={register}
                error={errors.brand?.message}
                placeholder="e.g., Apple"
                required
              />

              <FormInput<DeviceForm>
                label="Model"
                name="model"
                register={register}
                error={errors.model?.message}
                placeholder="e.g., MacBook Pro 2023"
                required
              />

              <div className="space-y-1">
                <label htmlFor="deviceType" className="block text-sm font-medium text-gray-700">
                  Device Type
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  {...register('deviceType')}
                  className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${
                    errors.deviceType ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a device type</option>
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

            <div className="space-y-1">
              <label htmlFor="additionalDetails" className="block text-sm font-medium text-gray-700">
                Additional Details
              </label>
              <textarea
                {...register('additionalDetails')}
                rows={4}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Any additional information about your device"
              />
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  reset();
                  setImagePreview(null);
                  setSelectedFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Clear Form
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Registering...' : 'Register Device'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};