import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, upsertProfile } from '@/services/profile';
import { Profile } from '@/types';


export const useProfile = () => {
    return useQuery<Profile | null>({
        queryKey: ['profile'],
        queryFn: getProfile,
        staleTime: 1000 * 60 * 30, // 30 minutes
    });
};

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (profile: Partial<Profile>) => upsertProfile(profile as any),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        },
    });
};

