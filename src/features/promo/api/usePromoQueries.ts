import { useQuery } from '@tanstack/react-query';
import { listPromoCodes } from '@/services/promoCodes';
import { PromoCode } from '@/types';

export const usePromoCodes = () => {
    return useQuery<PromoCode[]>({
        queryKey: ['promoCodes'],
        queryFn: listPromoCodes,
        staleTime: 1000 * 60 * 10, // 10 minutes
    });
};
