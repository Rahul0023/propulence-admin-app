import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { agentApplicationsApi } from '@/services/agent-applications'
import type { AgentApplicationListParams } from '@/types/agent-applications'

export function useAgentApplications(params: AgentApplicationListParams) {
  return useQuery({
    queryKey: ['agent-applications', params],
    queryFn: () => agentApplicationsApi.list(params).then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}

export function useDecideAgentApplication() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, decision, adminNote }: { id: number; decision: 'approve' | 'reject'; adminNote: string }) =>
      agentApplicationsApi.decide(id, decision, adminNote),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['agent-applications'] })
      toast.success(variables.decision === 'approve' ? 'Application approved' : 'Application rejected')
    },
    onError: () => toast.error('Failed to update application'),
  })
}
