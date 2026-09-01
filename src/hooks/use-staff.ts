import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { staffApi } from '@/services/staff'
import type { StaffCreateValues, StaffUpdateValues, StaffListParams } from '@/types/staff'

export function useStaffList(params: StaffListParams) {
  return useQuery({
    queryKey: ['staff', params],
    queryFn: () => staffApi.list(params).then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}

export function useStaffMember(id: number | undefined) {
  return useQuery({
    queryKey: ['staff', id],
    queryFn: () => staffApi.get(id!).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCreateStaff() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: StaffCreateValues) => staffApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['staff'] })
      toast.success(
        'Staff user created. If no password was set, the backend auto-generates one as {firstname}@123.',
      )
    },
    onError: () => toast.error('Failed to create staff user'),
  })
}

export function useUpdateStaff(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: StaffUpdateValues) => staffApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['staff'] })
      toast.success('Staff user updated')
    },
    onError: () => toast.error('Failed to update staff user'),
  })
}

export function useDeleteStaff() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => staffApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['staff'] })
      toast.success('Staff user deleted')
    },
    onError: () => toast.error('Failed to delete staff user'),
  })
}

export function useStaffActions(id: number) {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['staff'] })

  const activate = useMutation({ mutationFn: () => staffApi.activate(id), onSuccess: invalidate })
  const deactivate = useMutation({ mutationFn: () => staffApi.deactivate(id), onSuccess: invalidate })
  const setRole = useMutation({ mutationFn: (role: string) => staffApi.setRole(id, role), onSuccess: invalidate })

  return { activate, deactivate, setRole }
}
