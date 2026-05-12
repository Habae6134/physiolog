import type { Patient } from '@/features/patients/domain/types'
import type { Evaluation } from '@/features/evaluations/domain/types'

/**
 * 환자 정보와 최근 검사 기록을 AI 컨텍스트용 텍스트로 변환합니다.
 */
export function formatPatientContext(patient: Patient, evaluations: Evaluation[]): string {
  let context = `[환자 기본 정보]\n`
  context += `- 이름: ${patient.name}\n`
  context += `- 성별: ${patient.gender === 'male' ? '남성' : '여성'}\n`
  if (patient.diagnosis) context += `- 진단명: ${patient.diagnosis}\n`
  if (patient.medicalHistory && patient.medicalHistory.length > 0) {
    context += `- 과거력: ${patient.medicalHistory.join(', ')}\n`
  }
  if (patient.surgeryHistory) context += `- 수술력: ${patient.surgeryHistory}\n`
  if (patient.notes) context += `- 특이사항: ${patient.notes}\n`

  if (evaluations.length > 0) {
    const latest = evaluations[0] // 가장 최근 기록
    context += `\n[최근 신체 평가 기록 (${latest.date})]\n`
    
    if (latest.vas !== undefined) {
      context += `- VAS(통증): ${latest.vas}/10\n`
    }
    
    if (latest.rom && latest.rom.length > 0) {
      context += `- ROM(가동범위): ${latest.rom.map(r => `${r.jointId}(${r.side === 'left' ? '좌' : r.side === 'right' ? '우' : '양'}) Active:${r.active ?? '-'}°, Passive:${r.passive ?? '-'}°`).join(', ')}\n`
    }
    
    if (latest.mmt && latest.mmt.length > 0) {
      context += `- MMT(근력): ${latest.mmt.map(m => `${m.jointId}(${m.side === 'left' ? '좌' : '우'}) ${m.grade}`).join(', ')}\n`
    }

    if (latest.bodyMeasurement && latest.bodyMeasurement.length > 0) {
      context += `- 신체 계측: ${latest.bodyMeasurement.map(b => `${b.location} ${b.value}${b.unit}(${b.type})`).join(', ')}\n`
    }

    if (latest.painMapping && latest.painMapping.length > 0) {
      context += `- 통증 양상: ${latest.painMapping.map(p => `${p.label}(${p.pattern}, 강도:${p.intensity})`).join(', ')}\n`
    }
  }

  return context
}
