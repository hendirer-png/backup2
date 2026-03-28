import { useState, useMemo } from 'react';
import { ExtendedClient } from '@/features/clients/types';


export function useClientsFilters(allClientData: ExtendedClient[]) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('Semua Status');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const filteredClientData = useMemo(() => {
        return allClientData.filter(client => {
            const searchMatch = searchTerm === '' ||
                client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (client.address && client.address.toLowerCase().includes(searchTerm.toLowerCase()));

            const statusMatch = statusFilter === 'Semua Status' || client.overallPaymentStatus === statusFilter;

            const from = dateFrom ? new Date(dateFrom) : null;
            const to = dateTo ? new Date(dateTo) : null;
            if (from) from.setHours(0, 0, 0, 0);
            if (to) to.setHours(23, 59, 59, 999);
            const dateMatch = (!from && !to) || client.projects.some(p => {
                const projectDate = new Date(p.date);
                return (!from || projectDate >= from) && (!to || projectDate <= to);
            });

            return searchMatch && statusMatch && dateMatch;
        });
    }, [allClientData, searchTerm, statusFilter, dateFrom, dateTo]);

    return {
        searchTerm,
        setSearchTerm,
        statusFilter,
        setStatusFilter,
        dateFrom,
        setDateFrom,
        dateTo,
        setDateTo,
        filteredClientData
    };
}
