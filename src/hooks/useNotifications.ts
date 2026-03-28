import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { listNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../services/notifications';
import { Notification } from '../types';

import { useEffect } from 'react';

export function useNotifications() {
    const queryClient = useQueryClient();

    const { data: notifications = [], isLoading } = useQuery({
        queryKey: ['notifications'],
        queryFn: listNotifications,
        staleTime: 5 * 60 * 1000,
    });


    const markReadMutation = useMutation<void, Error, string>({
        mutationFn: markNotificationAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    const markAllReadMutation = useMutation<void, Error, void>({
        mutationFn: markAllNotificationsAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });


    // Realtime subscription
    useEffect(() => {
        const channel = supabase
            .channel('realtime-notifications-hook')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
                queryClient.invalidateQueries({ queryKey: ['notifications'] });
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient]);

    return {
        notifications,
        isLoading,
        handleMarkAsRead: (id: string) => markReadMutation.mutate(id),
        handleMarkAllAsRead: () => markAllReadMutation.mutate(),
        unreadCount: notifications.filter(n => !n.isRead).length
    };
}
