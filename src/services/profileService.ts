// src/services/profileService.ts
import { supabase } from '../lib/supabase'

export interface Profile {
  id: string
  email: string
  full_name: string
  matric_number?: string
  staff_id?: string
  phone_number?: string
  role: 'student' | 'staff'
  department?: string
  study_level?: string
  hall_of_residence?: string
  home_address?: string
  biography?: string
  created_at: string
  updated_at: string
}

export async function getProfile(userId: string) {
  return supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
}

export async function updateProfile(userId: string, profileData: Partial<Profile>) {
  return supabase
    .from('profiles')
    .update(profileData)
    .eq('id', userId)
    .select()
    .single()
}

export async function getAllStudents(searchTerm?: string, statusFilter?: string) {
  let query = supabase
    .from('profiles')
    .select(`
      *,
      devices (id)
    `)
    .eq('role', 'student')
    
  if (searchTerm) {
    query = query.or(`full_name.ilike.%${searchTerm}%,matric_number.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
  }
  
  return query
}

// In profileService.ts
export async function updateStudentStatus(studentId: string, status: 'active' | 'suspended' | 'graduated') {
  return supabase
    .from('profiles')
    .update({ status })
    .eq('id', studentId)
    .eq('role', 'student') // Safety check to ensure we're only updating students
}