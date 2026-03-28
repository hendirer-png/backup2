import { useState, useMemo } from 'react';
import { Transaction, FinancialPocket, Card, Project, TransactionType } from '@/types';
import { useTransactions, useCards, usePockets } from '@/features/finance/api/useFinanceQueries';

export const useFinanceData = () => {
    const [limit, setLimit] = useState(100);

    // 1. Fetch data from React Query
    const { data: queryTransactions, isLoading: isTxLoading } = useTransactions({ limit });
    const { data: queryCards } = useCards();
    const { data: queryPockets } = usePockets();

    const transactions = queryTransactions || [];
    const cards = queryCards || [];
    const pockets = queryPockets || [];
    const [offset, setOffset] = useState(100);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const loadMoreTransactions = async () => {
        if (isLoadingMore || !hasMore) return;
        setIsLoadingMore(true);
        try {
            // Because React Query handles fetching, we just increase the limit.
            // The hook will trigger a re-fetch in the background.
            setLimit(prev => prev + 100);
            
            // Artificial delay to mimic loading state for the UI, as RQ fetching is backgrounded
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // If the returned list size doesn't increase by limit, we hit the end
            if (transactions.length < limit) {
                setHasMore(false);
            }
        } catch (e) {
            console.error('[Finance] Failed to load more transactions:', e);
        } finally {
            setIsLoadingMore(false);
        }
    };

    const summary = useMemo(() => {
        const totalAssets = cards.reduce((sum, c) => sum + (Number(c.balance) || 0), 0);
        const pocketsTotal = pockets.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        startOfMonth.setHours(0, 0, 0, 0);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);

        const thisMonthTransactions = transactions.filter(t => {
            const txDate = new Date(t.date);
            return txDate >= startOfMonth && txDate <= endOfMonth;
        });

        const totalIncomeThisMonth = thisMonthTransactions
            .filter(t => t.type === TransactionType.INCOME)
            .reduce((sum, t) => sum + t.amount, 0);
        const totalExpenseThisMonth = thisMonthTransactions
            .filter(t => t.type === TransactionType.EXPENSE)
            .reduce((sum, t) => sum + t.amount, 0);

        return {
            totalAssets,
            pocketsTotal,
            totalIncomeThisMonth,
            totalExpenseThisMonth
        };
    }, [cards, pockets, transactions]);

    return {
        transactions,
        pockets,
        cards,
        hasMore,
        isLoadingMore: isLoadingMore || isTxLoading,
        loadMoreTransactions,
        summary
    };
};
