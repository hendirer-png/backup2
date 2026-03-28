import { Transaction, FinancialPocket, Profile, Project, Card, TeamMember, TransactionType } from '@/types';

export interface FinanceProps {
}


export type FinanceTab = 'transactions' | 'pockets' | 'cards' | 'cashflow' | 'laporan' | 'laporanKartu' | 'labaProject';

export interface ModalState {
    type: null | 'transaction' | 'pocket' | 'card' | 'transfer' | 'topup-cash';
    mode: 'add' | 'edit';
    data?: any;
}

export interface FinanceHeaderProps {
    onAddTransaction: () => void;
    onAddPocket: () => void;
    onAddCard: () => void;
    onOpenInfoModal: () => void;
}

export interface FinanceStatsProps {
    summary: {
        totalAssets: number;
        pocketsTotal: number;
        totalIncomeThisMonth: number;
        totalExpenseThisMonth: number;
    };
    onStatClick: (type: 'assets' | 'pockets' | 'income' | 'expense') => void;
}

export interface TransactionListProps {
    transactions: Transaction[];
    projects: Project[];
    cards: Card[];
    pockets: FinancialPocket[];
    onEdit: (transaction: Transaction) => void;
    onDelete: (id: string) => void;
    hasMore: boolean;
    isLoadingMore: boolean;
    onLoadMore: () => void;
    filters: {
        searchTerm: string;
        dateFrom: string;
        dateTo: string;
    };
    onFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    categoryFilter: {
        type: TransactionType | 'all';
        category: string;
    };
    onCategoryFilterChange: (filter: { type: TransactionType | 'all'; category: string }) => void;
    categoryTotals: {
        income: Record<string, number>;
        expense: Record<string, number>;
    };
    onDownloadCSV: () => void;
    monthlyBudgetPocket?: FinancialPocket;
    onCloseBudget: () => void;
}

export interface PocketGridProps {

    pockets: FinancialPocket[];
    cards: Card[];
    summary: { pocketsTotal: number };
    onWithdraw: (pocket: FinancialPocket) => void;
    onDeposit: (pocket: FinancialPocket) => void;
    onEdit: (pocket: FinancialPocket) => void;
    onDelete: (id: string) => void;
    onAddPocket: () => void;
    onViewHistory: (pocket: FinancialPocket) => void;
}

export interface CardGridProps {
    cards: Card[];
    pockets: FinancialPocket[];
    onEdit: (card: Card) => void;
    onDelete: (id: string) => void;
    onAddCard: () => void;
    onTopUp: (card: Card) => void;
    onViewHistory: (card: Card) => void;
    stats: {
        creditDebt: number;
        debitAndCashAssets: number;
        cashBalance: number;
        mostUsedCardName: string;
        mostUsedCardTxCount: number;
        topUsedCards: Array<{ id: string; name: string; count: number }>;
    };
}
