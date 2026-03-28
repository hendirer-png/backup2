import { useMemo } from 'react';
import { Transaction, FinancialPocket, Card, Project, Profile, TransactionType, CardType } from '@/types';
import { PRODUCTION_COST_CATEGORIES } from '@/features/finance/utils/finance.utils';

interface UseFinanceAnalyticsProps {
    transactions: Transaction[];
    pockets: FinancialPocket[];
    cards: Card[];
    projects: Project[];
    profile: Profile;
    filteredTransactions: Transaction[];
    reportFilters: { client: string; dateFrom: string; dateTo: string };
    profitReportFilters: { month: number; year: number };
}

export const useFinanceAnalytics = ({
    transactions,
    pockets,
    cards,
    projects,
    profile,
    filteredTransactions,
    reportFilters,
    profitReportFilters
}: UseFinanceAnalyticsProps) => {
    
    const cardStats = useMemo(() => {
        const creditDebt = cards.filter(c => c.cardType === CardType.KREDIT).reduce((sum, c) => sum + (c.balance < 0 ? c.balance : 0), 0);
        const debitAndCashAssets = cards.filter(c => c.cardType !== CardType.KREDIT).reduce((sum, c) => sum + c.balance, 0);
        const cashBalance = cards.filter(c => c.cardType === CardType.TUNAI).reduce((sum, c) => sum + c.balance, 0);

        const cardUsage: Record<string, number> = {};
        transactions.forEach(t => {
            if (t.cardId) cardUsage[t.cardId] = (cardUsage[t.cardId] || 0) + 1;
        });

        const sortedUsage = Object.entries(cardUsage).sort((a, b) => b[1] - a[1]);
        const mostUsed = sortedUsage[0];
        const mostUsedCard = mostUsed ? cards.find(c => c.id === mostUsed[0]) : null;

        return {
            creditDebt,
            debitAndCashAssets,
            cashBalance,
            mostUsedCardName: mostUsedCard ? `${mostUsedCard.bankName} ${mostUsedCard.lastFourDigits}` : 'N/A',
            mostUsedCardTxCount: mostUsed ? mostUsed[1] : 0,
            topUsedCards: sortedUsage.slice(0, 5).map(([id, count]) => ({
                id,
                count,
                name: cards.find(c => c.id === id)?.bankName || 'Unknown'
            }))
        };
    }, [cards, transactions]);

    const cashflowChartData = useMemo(() => {
        const sortedTxs = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        if (sortedTxs.length === 0) return [];

        const dataByMonth: Record<string, { income: number; expense: number; balance: number }> = {};
        let runningBalance = 0;

        sortedTxs.forEach(t => {
            const date = new Date(t.date);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!dataByMonth[key]) dataByMonth[key] = { income: 0, expense: 0, balance: 0 };
            
            if (t.type === TransactionType.INCOME) {
                dataByMonth[key].income += t.amount;
                runningBalance += t.amount;
            } else {
                dataByMonth[key].expense += t.amount;
                runningBalance -= t.amount;
            }
            dataByMonth[key].balance = runningBalance;
        });

        return Object.entries(dataByMonth).map(([key, vals]) => {
            const [y, m] = key.split('-');
            const label = new Date(Number(y), Number(m) - 1).toLocaleString('id-ID', { month: 'short', year: '2-digit' });
            return { label, ...vals };
        }).slice(-12);
    }, [transactions]);

    const cashflowMetrics = useMemo(() => {
        const last6Months = cashflowChartData.slice(-6);
        const totalExpense = last6Months.reduce((sum, d) => sum + d.expense, 0);
        const avgExpense = totalExpense / (last6Months.length || 1);
        const avgIncome = last6Months.reduce((sum, d) => sum + d.income, 0) / (last6Months.length || 1);
        
        const totalAssets = cards.reduce((sum, c) => sum + c.balance, 0);
        const burnRate = avgExpense;
        const runwayMonths = burnRate > 0 ? totalAssets / burnRate : 99;

        return {
            burnRate,
            runway: runwayMonths >= 12 ? '> 12 bln' : `${runwayMonths.toFixed(1)} bln`,
            avgExpense,
            avgIncome
        };
    }, [cashflowChartData, cards]);

    const expenseDonutData = useMemo(() => {
        const expenseByCategory = filteredTransactions
            .filter(t => t.type === TransactionType.EXPENSE)
            .reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + t.amount;
                return acc;
            }, {} as Record<string, number>);

        const colors = ['#f87171', '#fb923c', '#facc15', '#a3e635', '#34d399', '#22d3ee', '#60a5fa', '#a78bfa', '#f472b6'];
        return Object.entries(expenseByCategory)
            .sort((a, b) => b[1] - a[1])
            .map(([label, value], i) => ({ label, value, color: colors[i % colors.length] }));
    }, [filteredTransactions]);

    const reportClientOptions = useMemo(() => {
        const clientMap = new Map();
        projects.forEach(p => {
            if (p.clientName) clientMap.set(p.id, p.clientName);
        });
        return Array.from(clientMap.entries()).map(([id, name]) => ({ id, name }));
    }, [projects]);

    const reportTransactions = useMemo(() => {
        return transactions.filter(t => {
            const date = new Date(t.date);
            const from = reportFilters.dateFrom ? new Date(reportFilters.dateFrom) : null;
            const to = reportFilters.dateTo ? new Date(reportFilters.dateTo) : null;
            if (from) from.setHours(0, 0, 0, 0);
            if (to) to.setHours(23, 59, 59, 999);

            const dateMatch = (!from || date >= from) && (!to || date <= to);
            const clientMatch = reportFilters.client === 'all' || t.projectId === reportFilters.client;
            return dateMatch && clientMatch;
        });
    }, [transactions, reportFilters]);

    const generalReportMetrics = useMemo(() => {
        if (reportFilters.client !== 'all') return null;
        const income = reportTransactions.filter(t => t.type === TransactionType.INCOME).reduce((s, t) => s + t.amount, 0);
        const expense = reportTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((s, t) => s + t.amount, 0);
        
        const incomeByCategory = reportTransactions.filter(t => t.type === TransactionType.INCOME).reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc; }, {} as Record<string, number>);
        const expenseByCategory = reportTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc; }, {} as Record<string, number>);

        const colors = ['#f87171', '#fb923c', '#facc15', '#a3e635', '#34d399', '#22d3ee', '#60a5fa', '#a78bfa', '#f472b6'];
        const formatDonut = (data: Record<string, number>) => Object.entries(data).sort((a, b) => b[1] - a[1]).map(([label, value], i) => ({ label, value, color: colors[i % colors.length] }));

        return {
            reportIncome: income,
            reportExpense: expense,
            incomeDonut: formatDonut(incomeByCategory),
            expenseDonut: formatDonut(expenseByCategory)
        };
    }, [reportTransactions, reportFilters]);

    const projectProfitabilityData = useMemo(() => {
        const filteredProjects = projects.filter(p => {
            const d = new Date(p.date);
            return d.getMonth() === profitReportFilters.month && d.getFullYear() === profitReportFilters.year;
        });

        return filteredProjects.map(p => {
            const pTxs = transactions.filter(t => t.projectId === p.id);
            const totalIncome = pTxs.filter(t => t.type === TransactionType.INCOME).reduce((s, t) => s + t.amount, 0);
            const totalCost = pTxs.filter(t => t.type === TransactionType.EXPENSE && PRODUCTION_COST_CATEGORIES.includes(t.category)).reduce((s, t) => s + t.amount, 0);
            
            const totalPackageRevenue = p.totalCost - (p.customCosts?.reduce((s, c) => s + c.amount, 0) || 0) - (Number(p.transportCost) || 0);
            const totalCustomCosts = p.customCosts?.reduce((s, c) => s + c.amount, 0) || 0;
            const totalTransportCosts = Number(p.transportCost) || 0;

            return {
                clientId: p.id,
                clientName: p.clientName,
                projects: [p],
                totalIncome,
                totalCost,
                profit: totalIncome - totalCost,
                totalPackageRevenue,
                totalCustomCosts,
                totalTransportCosts
            };
        });
    }, [projects, transactions, profitReportFilters]);

    const profitReportMetrics = useMemo(() => {
        const totalProfit = projectProfitabilityData.reduce((s, d) => s + d.profit, 0);
        const avgProfit = totalProfit / (projectProfitabilityData.length || 1);
        const profitableProjectsCount = projectProfitabilityData.filter(d => d.profit > 0).length;
        const mostProfitable = [...projectProfitabilityData].sort((a, b) => b.profit - a.profit)[0];

        return {
            totalProfit,
            avgProfit,
            profitableProjectsCount,
            mostProfitableClient: mostProfitable?.clientName || 'N/A'
        };
    }, [projectProfitabilityData]);

    return {
        cardStats,
        cashflowChartData,
        cashflowMetrics,
        expenseDonutData,
        reportClientOptions,
        reportTransactions,
        generalReportMetrics,
        projectProfitabilityData,
        profitReportMetrics
    };
};
