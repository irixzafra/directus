'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getItems, getItem, createItemHelper, updateItemHelper, deleteItemHelper, Contact } from '@/lib/directus';

export function useContacts(options?: { companyId?: string; search?: string; limit?: number }) {
  return useQuery({
    queryKey: ['contacts', options],
    queryFn: () =>
      getItems('contacts', {
        limit: options?.limit || 50,
        sort: ['-created_at'],
        fields: ['*', 'company_id.*'],
        ...(options?.companyId && {
          filter: { company_id: { _eq: options.companyId } },
        }),
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

export function useContact(id: string) {
  return useQuery({
    queryKey: ['contacts', id],
    queryFn: () => getItem('contacts', id),
    enabled: !!id,
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Contact>) => createItemHelper('contacts', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Contact> }) =>
      updateItemHelper('contacts', id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteItemHelper('contacts', id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}
