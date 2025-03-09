// src/services/deviceService.ts
import { supabase } from '../lib/supabase'

export interface Device {
  id: string
  user_id: string
  name: string
  serial_number: string
  brand: string
  model: string
  type: 'smartphone' | 'laptop' | 'tablet' | 'other'
  status: 'pending' | 'verified' | 'reported'
  additional_details?: string
  verified_by?: string
  verification_date?: string
  verification_notes?: string
  image_url?: string
  created_at: string
}

export interface DeviceRegistrationData {
  name: string
  serial_number: string
  brand: string
  model: string
  type: 'smartphone' | 'laptop' | 'tablet' | 'other'
  additional_details?: string
  image_url?: string
}

export async function registerDevice(userId: string, deviceData: DeviceRegistrationData) {
  return supabase
    .from('devices')
    .insert({
      user_id: userId,
      ...deviceData,
      status: 'pending'
    })
    .select()
    .single()
}

export async function getDevicesByUser(userId: string) {
  return supabase
    .from('devices')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
}

export async function getAllDevices(statusFilter?: string) {
  let query = supabase
    .from('devices')
    .select(`
      *,
      profiles:user_id (
        full_name,
        matric_number,
        email
      )
    `)
    .order('created_at', { ascending: false })

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter)
  }
  
  return query
}

export async function getDeviceById(deviceId: string) {
  return supabase
    .from('devices')
    .select(`
      *,
      profiles:user_id (
        full_name,
        matric_number,
        email,
        phone_number
      )
    `)
    .eq('id', deviceId)
    .single()
}

export async function verifyDevice(deviceId: string, staffId: string, notes?: string) {
  return supabase
    .from('devices')
    .update({
      status: 'verified',
      verified_by: staffId,
      verification_date: new Date().toISOString(),
      verification_notes: notes
    })
    .eq('id', deviceId)
}

export async function uploadDeviceImage(file: File): Promise<string | null> {
    if (!file) {
      console.log("No file provided to upload");
      return null;
    }
    
    try {
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `device-images/${fileName}`;
      
      console.log("Uploading file:", fileName, "size:", file.size, "type:", file.type);
      
      // Make sure bucket exists
      try {
        const { data: bucketData } = await supabase.storage.getBucket('gadgify');
        console.log("Bucket exists:", bucketData);
      } catch (bucketError) {
        console.error("Bucket check error:", bucketError);
        // Try to create the bucket if it doesn't exist
        try {
          const { data: createData } = await supabase.storage.createBucket('gadgify', {
            public: true
          });
          console.log("Created bucket:", createData);
        } catch (createError) {
          console.error("Failed to create bucket:", createError);
        }
      }
      
      // Upload the file
      const { data, error } = await supabase.storage
        .from('gadgify')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (error) {
        console.error("Upload error:", error);
        throw error;
      }
      
      console.log("Upload successful:", data);
      
      // Get public URL
      const { data: publicUrlData } = await supabase.storage
        .from('gadgify')
        .getPublicUrl(filePath);
      
      console.log("Public URL data:", publicUrlData);
      
      return publicUrlData.publicUrl;
    } catch (error) {
      console.error("Error in uploadDeviceImage:", error);
      return null;
    }
  }