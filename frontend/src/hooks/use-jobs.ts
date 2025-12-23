'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getItems, getItem, createItemHelper, updateItemHelper, deleteItemHelper, JobOffer } from '@/lib/directus';

export function useJobs(options?: { status?: string; limit?: number }) {
  return useQuery({
    queryKey: ['job_offers', options],
    queryFn: () =>
      getItems('job_offers', {
        limit: options?.limit || 50,
        sort: ['-created_at'],
        ...(options?.status && {
          filter: { status: { _eq: options.status } },
        }),
      }),
  });
}

export function useJob(id: string) {
  return useQuery({
    queryKey: ['job_offers', id],
    queryFn: () => getItem('job_offers', id),
    enabled: !!id,
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<JobOffer>) => createItemHelper('job_offers', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job_offers'] });
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<JobOffer> }) =>
      updateItemHelper('job_offers', id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job_offers'] });
    },
  });
}
