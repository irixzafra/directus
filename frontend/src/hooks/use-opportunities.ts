'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getItems, getItem, createItemHelper, updateItemHelper, deleteItemHelper, Opportunity } from '@/lib/directus';

export function useOpportunities(options?: { stage?: string; companyId?: string; limit?: number }) {
  return useQuery({
    queryKey: ['opportunities', options],
    queryFn: () =>
      getItems('opportunities', {
        limit: options?.limit || 50,
        sort: ['-created_at'],
        fields: ['*', 'company_id.*', 'contact_id.*'],
        ...(options?.stage && {
          filter: { stage: { _eq: options.stage } },
        }),
        ...(options?.companyId && {
          filter: { company_id: { _eq: options.companyId } },
        }),
      }),
  });
}

export function useOpportunity(id: string) {
  return useQuery({
    queryKey: ['opportunities', id],
    queryFn: () => getItem('opportunities', id),
    enabled: !!id,
  });
}

export function useCreateOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Opportunity>) => createItemHelper('opportunities', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    },
  });
}

export function useUpdateOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Opportunity> }) =>
      updateItemHelper('opportunities', id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    },
  });
}

export function useDeleteOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteItemHelper('opportunities', id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    },
  });
}
