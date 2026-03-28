import { useQuery } from '@tanstack/react-query';
import { listLeads } from '@/services/leads';
import { Lead } from '@/types';

interface UseLeadsOptions {
    limit?: number;
    offset?: number;
    enabled?: boolean;
}

export const useLeads = (options: UseLeadsOptions = {}) => {
    return useQuery<Lead[], Error>({
        queryKey: ['leads', options],
        queryFn: async () => {
            return await listLeads({
                limit: options.limit || 1000,
                offset: options.offset || 0,
            });
        },
        enabled: options.enabled !== false,
        staleTime: 5 * 60 * 1000, 
    });
};
