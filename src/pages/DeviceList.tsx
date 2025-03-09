/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/student/DeviceList.tsx
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import {
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  DeviceTabletIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { DeviceDetails } from "./DeviceDetails";
import { useSupabase } from "../context/SupabaseContext";
import {
  ReportLostModal,
  ReportLostFormData,
} from "../components/common/ReportModal";
import toast from "react-hot-toast";
import { getDevicesByUser } from '../services/deviceService';
import { reportDevice } from "../services/reportService";
import { supabase } from "../lib/supabase";

// Types
export interface Device {
  id: string;
  name: string;
  type: 'smartphone' | 'laptop' | 'tablet' | 'other';
  serial_number: string;
  brand: string;
  model: string;
  status: 'pending' | 'verified' | 'reported';
  created_at: string;
  image_url: string | null;
  additional_details?: string;
}

export const DeviceList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [deviceToReport, setDeviceToReport] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState<Device[]>([]);
  const { user } = useSupabase();

  useEffect(() => {
    const fetchDevices = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const { data, error } = await getDevicesByUser(user.id);
        
        if (error) throw error;
        
        setDevices(data || []);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load devices');
        console.error('Error fetching devices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, [user]);

  const getDeviceIcon = (type: Device["type"]) => {
    switch (type) {
      case "smartphone":
        return DevicePhoneMobileIcon;
      case "laptop":
        return ComputerDesktopIcon;
      case "tablet":
        return DeviceTabletIcon;
      default:
        return DevicePhoneMobileIcon;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "verified":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "reported":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredDevices = devices.filter(
    (device) =>
      device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleReportDevice = async (formData: ReportLostFormData) => {
    if (!deviceToReport || !user) return Promise.reject(new Error('Missing device or user'));
    
    try {
      // First, create the report in the database
      const { error } = await reportDevice(user.id, {
        device_id: deviceToReport.id,
        incident_type: formData.incidentType,
        incident_date: formData.dateOfIncident,
        location: formData.location,
        description: formData.description,
        police_report: formData.policeReport || undefined
      });
      
      if (error) throw error;
      
      // Then, update the device status to 'reported'
      const { error: deviceUpdateError } = await supabase
        .from('devices')
        .update({ status: 'reported' })
        .eq('id', deviceToReport.id)
        .eq('user_id', user.id); // Security check
      
      if (deviceUpdateError) throw deviceUpdateError;
      
      // Update the local state to reflect the change
      setDevices(devices.map(device => 
        device.id === deviceToReport.id 
          ? { ...device, status: 'reported' } 
          : device
      ));
      
      toast.success(`${deviceToReport.name} has been reported as ${formData.incidentType}`);
      return Promise.resolve();
    } catch (error: any) {
      toast.error(error.message || 'Failed to report device. Please try again.');
      console.error('Error reporting device:', error);
      return Promise.reject(error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Devices</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage and view all your registered devices
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Search devices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="spinner"></div>
          </div>
        ) : (
          <>
            {/* Device Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDevices.map((device) => {
                const DeviceIcon = getDeviceIcon(device.type);
                return (
                  <div
                    key={device.id}
                    className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="bg-indigo-100 rounded-lg p-2">
                            <DeviceIcon className="h-6 w-6 text-indigo-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {device.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {device.brand} {device.model}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            device.status
                          )}`}
                        >
                          {device.status.charAt(0).toUpperCase() + device.status.slice(1)}
                        </span>
                      </div>

                      {device.image_url && (
                        <div className="aspect-w-16 aspect-h-9">
                          <img
                            src={device.image_url}
                            alt={device.name}
                            className="object-cover rounded-md"
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">
                            Serial Number
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {device.serial_number}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">
                            Registration Date
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {new Date(device.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="pt-4 flex justify-end space-x-3">
                        <button
                          onClick={() => setSelectedDevice(device)}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          View Details
                        </button>
                        {device.status !== "reported" && (
                          <button
                            onClick={() => { setDeviceToReport(device) }}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            Report Lost
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {selectedDevice && (
          <DeviceDetails
            isOpen={!!selectedDevice}
            onClose={() => setSelectedDevice(null)}
            device={{
              id: selectedDevice.id,
              name: selectedDevice.name,
              serialNumber: selectedDevice.serial_number,
              brand: selectedDevice.brand,
              model: selectedDevice.model,
              type: selectedDevice.type,
              registrationDate: selectedDevice.created_at,
              status: selectedDevice.status,
              imageUrl: selectedDevice.image_url || '',
              additionalDetails: selectedDevice.additional_details || ''
            }}
          />
        )}

        {deviceToReport && (
          <ReportLostModal
            isOpen={!!deviceToReport}
            onClose={() => setDeviceToReport(null)}
            device={{
              id: deviceToReport.id,
              name: deviceToReport.name
            }}
            onReportSubmit={handleReportDevice}
          />
        )}

        {/* Empty State */}
        {!loading && filteredDevices.length === 0 && (
          <div className="text-center py-12">
            <DeviceTabletIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No devices found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Get started by registering your first device"}
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};