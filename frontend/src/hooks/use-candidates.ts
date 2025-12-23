'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getItems, getItem, createItemHelper, updateItemHelper, deleteItemHelper, Candidate } from '@/lib/directus';

export function useCandidates(options?: { search?: string; limit?: number }) {
  return useQuery({
    queryKey: ['candidates', options],
    queryFn: () =>
      getItems('candidates', {
        limit: options?.limit || 50,
        sort: ['-created_at'],
        ...(options?.search && {
          filter: {
            _or: [
              { first_name: { _icontains: options.search } },
              { last_name: { _icontains: options.search } },
              { email: { _icontains: options.search } },
            ],
          },
        }),
      }),
  });
}

export function useCandidate(id: string) {
  return useQuery({
    queryKey: ['candidates', id],
    queryFn: () => getItem('candidates', id),
    enabled: !!id,
  });
}

export function useCreateCandidate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Candidate>) => createItemHelper('candidates', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
  });
}

export function useUpdateCandidate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Candidate> }) =>
      updateItemHelper('candidates', id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
  });
}

export function useDeleteCandidate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteItemHelper('candidates', id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
  });
}
