import { useQuery } from '@tanstack/react-query';
import { listPackages } from '@/services/packages';
import { listAddOns } from '@/services/addOns';
import { Package, AddOn } from '@/types';

export const usePackages = () => {
    return useQuery<Package[]>({
        queryKey: ['packages'],
        queryFn: listPackages,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useAddOns = () => {
    return useQuery<AddOn[]>({
        queryKey: ['addOns'],
        queryFn: listAddOns,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
