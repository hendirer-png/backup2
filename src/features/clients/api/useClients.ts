import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listClients,
  createClient,
  updateClient,
  deleteClient,
} from '@/services/clients';
import { Client } from '@/types';

export const clientKeys = {
  all: ['clients'] as const,
  lists: () => [...clientKeys.all, 'list'] as const,
  list: (filters: string) => [...clientKeys.lists(), { filters }] as const,
  details: () => [...clientKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientKeys.details(), id] as const,
};

export function useClients(options?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: clientKeys.list(JSON.stringify(options || {})),
    queryFn: () => listClients(options),
    // Cache is kept fresh for 5 mins
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newClient: Omit<Client, 'id'>) => createClient(newClient),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<Client>) => updateClient(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientKeys.detail(variables.id) });
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
    },
  });
}
