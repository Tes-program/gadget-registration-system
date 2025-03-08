// src/services/reportService.ts
import { supabase } from '../lib/supabase'

export interface DeviceReport {
  id: string
  device_id: string
  user_id: string
  incident_type: 'lost' | 'stolen'
  incident_date: string
  location: string
  description: string
  police_report?: string
  status: 'active' | 'resolved' | 'cancelled'
  resolution_type?: 'found' | 'recovered'
  resolved_by?: string
  resolution_date?: string
  resolution_notes?: string
  created_at: string
}

export interface ReportData {
  device_id: string
  incident_type: 'lost' | 'stolen'
  incident_date: string
  location: string
  description: string
  police_report?: string
}

export async function reportDevice(userId: string, reportData: ReportData) {
  return supabase
    .from('device_reports')
    .insert({
      user_id: userId,
      ...reportData,
      status: 'active'
    })
    .select()
    .single()
}

export async function getReportsByUser(userId: string) {
  return supabase
    .from('device_reports')
    .select(`
      *,
      devices (
        name,
        serial_number,
        brand,
        model,
        type
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
}

export async function getAllReports(statusFilter?: string, typeFilter?: string) {
  let query = supabase
    .from('device_reports')
    .select(`
      *,
      devices (
        name,
        serial_number,
        brand,
        model,
        type
      ),
      profiles:user_id (
        full_name,
        matric_number,
        email,
        phone_number
      )
    `)
    .order('created_at', { ascending: false })

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter)
  }
  
  if (typeFilter && typeFilter !== 'all') {
    query = query.eq('incident_type', typeFilter)
  }
  
  return query
}

export async function resolveReport(reportId: string, staffId: string, resolutionType: 'found' | 'recovered', notes?: string) {
  return supabase
    .from('device_reports')
    .update({
      status: 'resolved',
      resolution_type: resolutionType,
      resolved_by: staffId,
      resolution_date: new Date().toISOString(),
      resolution_notes: notes
    })
    .eq('id', reportId)
}