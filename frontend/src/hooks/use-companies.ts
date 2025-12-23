'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getItems, createItemHelper, Company } from '@/lib/directus';

export function useCompanies(options?: { search?: string; limit?: number }) {
  return useQuery({
    queryKey: ['companies', options],
    queryFn: () =>
      getItems('companies', {
        limit: options?.limit || 50,
        sort: ['-created_at'],
        ...(options?.search && {
          filter: { name: { _icontains: options.search } },
        }),
      }),
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Company>) => createItemHelper('companies', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
}
