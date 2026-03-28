import { useMemo } from 'react';
import { Client, Project, Transaction, PaymentStatus, ClientStatus } from '@/types';
import { ExtendedClient, ClientStats } from '@/features/clients/types';
import { formatCurrency } from '@/features/clients/utils/clients.utils';
import { useClients } from '@/features/clients/api/useClients';

interface UseClientsDataProps {
    clients: Client[];
    projects: Project[];
    transactions: Transaction[];
    totals: any;
}

export function useClientsData({ clients: initialClients, projects, transactions, totals }: UseClientsDataProps) {
    // 1. Fetch data from React Query instead of relying solely on props!
    const { data: queryClients, isLoading: isClientsLoading } = useClients({ limit: 100 });
    const clients = queryClients || initialClients;

    const allClientData = useMemo(() => {
        return clients.map(client => {
            const clientProjects = projects.filter(p => p.clientId === client.id)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            
            const totalValue = clientProjects.reduce((sum, p) => sum + p.totalCost, 0);
            const totalPaid = clientProjects.reduce((sum, p) => sum + p.amountPaid, 0);

            const mostRecentProject = clientProjects[0] || null;

            return {
                ...client,
                projects: clientProjects,
                totalProjectValue: totalValue,
                balanceDue: totalValue - totalPaid,
                PackageTerbaru: mostRecentProject 
                    ? `${mostRecentProject.packageName}${mostRecentProject.addOns.length > 0 ? ` + ${mostRecentProject.addOns.length} Add-on` : ''}` 
                    : 'Belum ada Acara Pernikahan',
                overallPaymentStatus: mostRecentProject ? mostRecentProject.paymentStatus : null,
                mostRecentProject,
            } as ExtendedClient;
        });
    }, [clients, projects]);

    const clientsWithDues = useMemo(() => {
        return allClientData
            .filter(client => client.balanceDue > 0)
            .sort((a, b) => b.balanceDue - a.balanceDue);
    }, [allClientData]);

    const clientStats = useMemo(() => {
        const locationCounts = projects.reduce((acc, p) => {
            if (p.location) {
                const mainLocation = p.location.split(',')[0].trim();
                acc[mainLocation] = (acc[mainLocation] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        const mostFrequentLocation = Object.keys(locationCounts).length > 0
            ? Object.keys(locationCounts).reduce((a, b) => locationCounts[a] > locationCounts[b] ? a : b)
            : 'N/A';

        const totalReceivables = allClientData.reduce((sum, c) => sum + c.balanceDue, 0);

        return {
            activeClients: totals.activeClients,
            mostFrequentLocation,
            totalReceivables: formatCurrency(totalReceivables),
            totalClients: totals.clients
        } as ClientStats;
    }, [projects, allClientData, totals]);

    const clientStatusDonutData = useMemo(() => {
        const statusCounts = clients.reduce((acc, client) => {
            acc[client.status] = (acc[client.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const statusColors: { [key in ClientStatus]?: string } = {
            [ClientStatus.ACTIVE]: '#10b981',
            [ClientStatus.INACTIVE]: '#64748b',
            [ClientStatus.LEAD]: '#3b82f6',
            [ClientStatus.LOST]: '#ef4444',
        };

        return Object.entries(statusCounts).map(([label, value]) => ({
            label,
            value,
            color: statusColors[label as ClientStatus] || '#9ca3af'
        }));
    }, [clients]);

    const newClientsChartData = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
        const data = months.map(month => ({ name: month, count: 0 }));

        clients.forEach(c => {
            const joinDate = new Date(c.since);
            if (joinDate.getFullYear() === currentYear) {
                const monthIndex = joinDate.getMonth();
                data[monthIndex].count += 1;
            }
        });
        return data;
    }, [clients]);

    return {
        allClientData,
        clientsWithDues,
        clientStats,
        clientStatusDonutData,
        newClientsChartData,
        isClientsLoading
    };
}
