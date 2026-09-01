/**
 * Fields from AgentApplicationSerializer (apps/agent/serializers.py) — the agent onboarding /
 * role-upgrade approval flow. Approving an application activates the applicant's Agent profile
 * and flips their MyUser.role to AGENT.
 */
export type AgentApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface AgentApplication {
  id: number
  user_id: number
  user_email: string
  status: AgentApplicationStatus
  full_name: string
  phone_number: string
  email: string
  profession_title: string
  license_number: string
  agency_name: string
  experience_years: number | null
  specialization: string
  operating_city: string
  bio: string
  portfolio_link: string
  linkedin_profile: string
  website: string
  admin_note: string
  reviewed_by_name: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
}

export interface AgentApplicationListParams {
  page?: number
  page_size?: number
  status?: AgentApplicationStatus
}

export interface AgentApplicationDecisionResponse {
  application: AgentApplication
}
