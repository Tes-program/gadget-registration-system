// src/types/supabase.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          matric_number: string | null
          staff_id: string | null
          phone_number: string | null
          role: 'student' | 'staff'
          department: string | null
          study_level: string | null
          hall_of_residence: string | null
          home_address: string | null
          biography: string | null
          status: 'active' | 'suspended' | 'graduated' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          matric_number?: string | null
          staff_id?: string | null
          phone_number?: string | null
          role: 'student' | 'staff'
          department?: string | null
          study_level?: string | null
          hall_of_residence?: string | null
          home_address?: string | null
          biography?: string | null
          status?: 'active' | 'suspended' | 'graduated' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          matric_number?: string | null
          staff_id?: string | null
          phone_number?: string | null
          role?: 'student' | 'staff'
          department?: string | null
          study_level?: string | null
          hall_of_residence?: string | null
          home_address?: string | null
          biography?: string | null
          status?: 'active' | 'suspended' | 'graduated' | null
          created_at?: string
          updated_at?: string
        }
      }
      devices: {
        Row: {
          id: string
          user_id: string
          name: string
          serial_number: string
          brand: string
          model: string
          type: 'smartphone' | 'laptop' | 'tablet' | 'other'
          status: 'pending' | 'verified' | 'reported'
          additional_details: string | null
          verified_by: string | null
          verification_date: string | null
          verification_notes: string | null
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          serial_number: string
          brand: string
          model: string
          type: 'smartphone' | 'laptop' | 'tablet' | 'other'
          status: 'pending' | 'verified' | 'reported'
          additional_details?: string | null
          verified_by?: string | null
          verification_date?: string | null
          verification_notes?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          serial_number?: string
          brand?: string
          model?: string
          type?: 'smartphone' | 'laptop' | 'tablet' | 'other'
          status?: 'pending' | 'verified' | 'reported'
          additional_details?: string | null
          verified_by?: string | null
          verification_date?: string | null
          verification_notes?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      device_reports: {
        Row: {
          id: string
          device_id: string
          user_id: string
          incident_type: 'lost' | 'stolen'
          incident_date: string
          location: string
          description: string
          police_report: string | null
          status: 'active' | 'resolved' | 'cancelled'
          resolution_type: 'found' | 'recovered' | null
          resolved_by: string | null
          resolution_date: string | null
          resolution_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          device_id: string
          user_id: string
          incident_type: 'lost' | 'stolen'
          incident_date: string
          location: string
          description: string
          police_report?: string | null
          status: 'active' | 'resolved' | 'cancelled'
          resolution_type?: 'found' | 'recovered' | null
          resolved_by?: string | null
          resolution_date?: string | null
          resolution_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          device_id?: string
          user_id?: string
          incident_type?: 'lost' | 'stolen'
          incident_date?: string
          location?: string
          description?: string
          police_report?: string | null
          status?: 'active' | 'resolved' | 'cancelled'
          resolution_type?: 'found' | 'recovered' | null
          resolved_by?: string | null
          resolution_date?: string | null
          resolution_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: 'device_verification' | 'device_report' | 'system'
          related_device_id: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: 'device_verification' | 'device_report' | 'system'
          related_device_id?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: 'device_verification' | 'device_report' | 'system'
          related_device_id?: string | null
          is_read?: boolean
          created_at?: string
        }
      }
      settings: {
        Row: {
          user_id: string
          notification_new_devices: boolean
          notification_device_verifications: boolean
          notification_lost_devices: boolean
          notification_system_updates: boolean
          two_factor_auth: boolean
          login_notifications: boolean
          session_timeout: number
          updated_at: string
        }
        Insert: {
          user_id: string
          notification_new_devices?: boolean
          notification_device_verifications?: boolean
          notification_lost_devices?: boolean
          notification_system_updates?: boolean
          two_factor_auth?: boolean
          login_notifications?: boolean
          session_timeout?: number
          updated_at?: string
        }
        Update: {
          user_id?: string
          notification_new_devices?: boolean
          notification_device_verifications?: boolean
          notification_lost_devices?: boolean
          notification_system_updates?: boolean
          two_factor_auth?: boolean
          login_notifications?: boolean
          session_timeout?: number
          updated_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          details: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}