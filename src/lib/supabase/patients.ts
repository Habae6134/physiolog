'use server'

import { createClient } from './server'
import { revalidatePath } from 'next/cache'
import type { Patient, PatientInput } from '@/features/patients/domain/types'

// 환자 목록 조회 (자신이 등록한 환자만)
export async function getPatients(): Promise<Patient[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching patients:', error)
    return []
  }

  // snake_case -> camelCase 변환
  return data.map(dbToPatient)
}

// 특정 환자 상세 조회
export async function getPatient(id: string): Promise<Patient | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  return dbToPatient(data)
}

// 환자 등록
export async function createPatient(input: PatientInput): Promise<{ success: boolean; data?: Patient; error?: string }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '로그인이 필요합니다.' }

  const { data, error } = await supabase
    .from('patients')
    .insert({
      user_id: user.id,
      name: input.name,
      birth_date: input.birthDate,
      gender: input.gender,
      phone: input.phone,
      address: input.address,
      referral_route: input.referralRoute,
      medical_history: input.medicalHistory,
      other_medical_history: input.otherMedicalHistory,
      diagnosis: input.diagnosis,
      surgery_history: input.surgeryHistory,
      insurance: input.insurance,
      notes: input.notes,
      treatment_start_date: input.treatmentStartDate,
      therapist: input.therapist,
      status: input.status,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating patient:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/patients')
  
  return { success: true, data: dbToPatient(data) }
}

// 환자 정보 수정
export async function updatePatient(id: string, updates: Partial<PatientInput>): Promise<{ success: boolean; data?: Patient; error?: string }> {
  const supabase = await createClient()

  // camelCase 업데이트 데이터를 snake_case로 변환
  const dbUpdates: any = {}
  if (updates.name !== undefined) dbUpdates.name = updates.name
  if (updates.birthDate !== undefined) dbUpdates.birth_date = updates.birthDate
  if (updates.gender !== undefined) dbUpdates.gender = updates.gender
  if (updates.phone !== undefined) dbUpdates.phone = updates.phone
  if (updates.address !== undefined) dbUpdates.address = updates.address
  if (updates.referralRoute !== undefined) dbUpdates.referral_route = updates.referralRoute
  if (updates.medicalHistory !== undefined) dbUpdates.medical_history = updates.medicalHistory
  if (updates.otherMedicalHistory !== undefined) dbUpdates.other_medical_history = updates.otherMedicalHistory
  if (updates.diagnosis !== undefined) dbUpdates.diagnosis = updates.diagnosis
  if (updates.surgeryHistory !== undefined) dbUpdates.surgery_history = updates.surgeryHistory
  if (updates.insurance !== undefined) dbUpdates.insurance = updates.insurance
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes
  if (updates.treatmentStartDate !== undefined) dbUpdates.treatment_start_date = updates.treatmentStartDate
  if (updates.therapist !== undefined) dbUpdates.therapist = updates.therapist
  if (updates.status !== undefined) dbUpdates.status = updates.status

  const { data, error } = await supabase
    .from('patients')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating patient:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/')
  revalidatePath(`/patients/${id}`)
  
  return { success: true, data: dbToPatient(data) }
}

// 환자 삭제
export async function deletePatient(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('patients')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting patient:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/patients')
  
  return { success: true }
}

// 헬퍼 함수: DB snake_case 포맷을 앱의 camelCase Patient 타입으로 변환
function dbToPatient(dbRecord: any): Patient {
  return {
    id: dbRecord.id,
    name: dbRecord.name,
    birthDate: dbRecord.birth_date,
    gender: dbRecord.gender,
    phone: dbRecord.phone,
    address: dbRecord.address,
    referralRoute: dbRecord.referral_route,
    medicalHistory: dbRecord.medical_history || [],
    otherMedicalHistory: dbRecord.other_medical_history,
    diagnosis: dbRecord.diagnosis,
    surgeryHistory: dbRecord.surgery_history,
    insurance: dbRecord.insurance,
    notes: dbRecord.notes,
    treatmentStartDate: dbRecord.treatment_start_date,
    therapist: dbRecord.therapist,
    status: dbRecord.status,
    createdAt: dbRecord.created_at,
    updatedAt: dbRecord.updated_at,
  }
}
