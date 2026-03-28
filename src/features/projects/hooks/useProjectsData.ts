import { useState, useMemo, useEffect } from 'react';
import { Project, Client, TeamMember, TeamProjectPayment, Transaction, Card, FinancialPocket } from '@/features/projects/types/project.types';
import { listProjectsWithRelations } from '@/services/projects';
import { useProjects } from '@/features/projects/api/useProjects';
import { useClients } from '@/features/clients/api/useClients';
import { useTransactions } from '@/features/finance/api/useFinanceQueries';

interface UseProjectsDataProps {
    teamMembers: TeamMember[];
    showNotification: (msg: string) => void;
}

export const useProjectsData = ({
    teamMembers,
    showNotification
}: UseProjectsDataProps) => {
    // 1. Fetch data from React Query instead of relying solely on props!
    const { data: queryProjects, isLoading: isQueryLoading } = useProjects({ limit: 50 });
    const { data: queryClients } = useClients({ limit: 50 });
    const { data: queryTransactions } = useTransactions({ limit: 50 });

    const [projects, setProjects] = useState<Project[]>([]);
    const clients = queryClients || [];
    const transactions = queryTransactions || [];

    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // Sync Query Cache -> Local State (Migration Step)
    useEffect(() => {
        if (queryProjects) {
            setProjects(queryProjects as unknown as Project[]);
        }
    }, [queryProjects]);

    const totals = useMemo(() => {
        const activeProjectsCount = projects.filter(p => p.status !== 'Selesai' && p.status !== 'Dibatalkan').length;
        const activeClientsCount = clients.filter(c => c.status === 'Aktif').length;
        
        const discussionLeads = 0; // Simplified for now
        const followUpLeads = 0; 

        return {
            projects: projects.length,
            activeProjects: activeProjectsCount,
            clients: clients.length,
            activeClients: activeClientsCount,
            leads: discussionLeads + followUpLeads,
            discussionLeads,
            followUpLeads,
            teamMembers: teamMembers.length,
            transactions: transactions.length,
            revenue: projects.reduce((sum, p) => sum + (p.totalCost || 0), 0),
            expense: transactions.filter(t => t.type === 'Pengeluaran').reduce((sum, t) => sum + (t.amount || 0), 0)
        };
    }, [projects, clients, teamMembers, transactions]);

    const loadMoreProjects = async () => {
        if (isLoadingMore || !hasMore) return;
        setIsLoadingMore(true);
        try {
            const nextProjects = await listProjectsWithRelations({ limit: 20, offset: projects.length });
            if (nextProjects.length < 20) setHasMore(false);
            setProjects(prev => [...prev, ...nextProjects]);
        } catch (err) {
            console.error('Failed to load more projects:', err);
            showNotification('Gagal memuat lebih banyak proyek.');
        } finally {
            setIsLoadingMore(false);
        }
    };

    return {
        projects,
        setProjects,
        isLoading: isQueryLoading,
        hasMore,
        isLoadingMore,
        loadMoreProjects,
        totals
    };
};
