export interface IcfDomains {
  body: string[]
  activity: string[]
  participation: string[]
  environment: string[]
  personal: string[]
}

export interface IcfAnalysisResult {
  domains: IcfDomains
  coverage: {
    hasGaps: boolean
    missingOrWeak: string[]
  }
  followUpQuestion: string
  clinicalNote: string
}

export interface IcfTurn {
  input: string
  result: IcfAnalysisResult
}

export interface IcfAssessment {
  id: string
  patientId: string
  date: string       // yyyy-mm-dd
  createdAt: string
  turns: IcfTurn[]
  finalDomains: IcfDomains
  finalNote: string
}

export type IcfDomainKey = keyof IcfDomains

export const DOMAIN_META: Record<IcfDomainKey, { label: string; color: string; bg: string; border: string }> = {
  body:          { label: '신체 기능',  color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-200' },
  activity:      { label: '활동',       color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200' },
  participation: { label: '참여',       color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-200' },
  environment:   { label: '환경',       color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  personal:      { label: '개인',       color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-200' },
}

export const DOMAIN_KEYS: IcfDomainKey[] = ['body', 'activity', 'participation', 'environment', 'personal']

export function mergeDomains(turns: IcfTurn[]): IcfDomains {
  const merged: IcfDomains = { body: [], activity: [], participation: [], environment: [], personal: [] }
  for (const turn of turns) {
    for (const key of DOMAIN_KEYS) {
      for (const item of turn.result.domains[key]) {
        if (!merged[key].includes(item)) merged[key].push(item)
      }
    }
  }
  return merged
}
