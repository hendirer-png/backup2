import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { DataLoadingWrapper, LoadingState } from '@/shared/ui/LoadingState';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { Project, Client, Transaction, TransactionType, ViewType, TeamMember, Card, FinancialPocket, PocketType, Lead, LeadStatus, TeamProjectPayment, Package, ClientFeedback, ClientStatus, NavigationAction, User, ProjectStatusConfig, Profile, PaymentStatus } from '@/types';
import StatCard from '@/shared/ui/StatCard';
import StatCardModal from '@/shared/ui/StatCardModal';
import Modal from '@/shared/ui/Modal';
import { 
    NAV_ITEMS, DollarSignIcon, FolderKanbanIcon, UsersIcon, BriefcaseIcon, 
    ChevronRightIcon, CalendarIcon, ClipboardListIcon, StarIcon, CameraIcon, 
    FileTextIcon, TrendingUpIcon, AlertCircleIcon, MapPinIcon, MessageSquareIcon, 
    PhoneIcon 
} from '@/constants';
import DonutChart from '@/shared/ui/DonutChart';
import DashboardFilters, { DateRange } from './components/DashboardFilters';

import { useProjects } from '@/features/projects/api/useProjects';
import { useClients } from '@/features/clients/api/useClients';
import { useTeamMembers, useTeamProjectPayments } from '@/features/team/api/useTeamQueries';
import { useLeads } from '@/features/leads/api/useLeadsQueries';
import { useProfile } from '@/features/settings/api/useProfileQueries';
import { useApp } from "@/app/AppContext";
import { useUIStore } from '@/store/uiStore';
import { useFinanceData } from '@/features/finance/hooks/useFinanceData';
import { listClientFeedback } from '@/services/clientFeedback';
import ClientDetailModal from '@/features/clients/components/ClientDetailModal';
import { usePackages } from '@/features/packages/api/usePackagesQueries';

// Helper Functions
const formatCurrency = (amount: number, minimumFractionDigits = 0) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits }).format(amount);
};

const getStatusClass = (status: string, config: ProjectStatusConfig[]) => {
    const statusConfig = config.find(c => c.name === status);
    const color = statusConfig ? statusConfig.color : '#64748b';
    const colorMap: { [key: string]: string } = {
        '#10b981': 'bg-brand-success/20 text-brand-success',
        '#3b82f6': 'bg-blue-500/20 text-blue-400',
        '#8b5cf6': 'bg-purple-500/20 text-purple-400',
        '#f97316': 'bg-orange-500/20 text-orange-400',
        '#06b6d4': 'bg-teal-500/20 text-teal-400',
        '#eab308': 'bg-yellow-500/20 text-yellow-400',
        '#6366f1': 'bg-gray-500/20 text-gray-300',
        '#ef4444': 'bg-brand-danger/20 text-brand-danger'
    };
    return colorMap[color] || 'bg-gray-500/20 text-gray-400';
};

// --- Sub-components for Dashboard ---

const IncomeChartWidget: React.FC<{ transactions: Transaction[], dateRange: DateRange }> = ({ transactions, dateRange }) => {
    const [chartView, setChartView] = useState<'monthly' | 'yearly'>('monthly');

    const filteredTransactions = useMemo(() => {
        if (!dateRange.startDate) return transactions;
        return transactions.filter(t => {
            const d = new Date(t.date);
            return d >= dateRange.startDate! && d <= (dateRange.endDate || new Date());
        });
    }, [transactions, dateRange]);

    const chartData = useMemo(() => {
        const currentYear = new Date().getFullYear();
        if (chartView === 'yearly') {
            const totals: { [year: string]: { income: number, expense: number } } = {};
            filteredTransactions.forEach(t => {
                const year = new Date(t.date).getFullYear().toString();
                if (!totals[year]) totals[year] = { income: 0, expense: 0 };
                if (t.type === TransactionType.INCOME) totals[year].income += t.amount;
                else totals[year].expense += t.amount;
            });
            return Object.entries(totals)
                .sort(([yearA], [yearB]) => parseInt(yearA) - parseInt(yearB))
                .map(([year, values]) => ({ name: year, ...values }));
        } else {
            const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
            const data = months.map(month => ({ name: month, income: 0, expense: 0 }));
            filteredTransactions.forEach(t => {
                const d = new Date(t.date);
                if (d.getFullYear() === currentYear) {
                    const m = d.getMonth();
                    if (t.type === TransactionType.INCOME) data[m].income += t.amount;
                    else data[m].expense += t.amount;
                }
            });
            return data;
        }
    }, [filteredTransactions, chartView]);

    const maxVal = Math.max(...chartData.map(d => Math.max(d.income, d.expense)), 1);

    return (
        <div className="bg-brand-surface p-6 rounded-2xl shadow-lg h-full border border-brand-border">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="font-black text-sm uppercase tracking-widest text-brand-text-light">Analisis Kas & Profit</h3>
                    <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-brand-accent"></div>
                            <span className="text-[10px] text-brand-text-secondary uppercase font-bold tracking-tight">Income</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                            <span className="text-[10px] text-brand-text-secondary uppercase font-bold tracking-tight">Expense</span>
                        </div>
                    </div>
                </div>
                <div className="p-1 bg-brand-bg rounded-lg flex items-center h-fit">
                    {(['monthly', 'yearly'] as const).map(view => (
                        <button
                            key={view}
                            onClick={() => setChartView(view)}
                            className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-tighter rounded-md transition-all ${chartView === view ? 'bg-brand-accent text-white shadow-lg' : 'text-brand-text-secondary hover:text-brand-text-light'}`}
                        >
                            {view === 'monthly' ? 'Bulanan' : 'Tahunan'}
                        </button>
                    ))}
                </div>
            </div>
            <div className="h-56 flex justify-between items-end gap-2 mt-4">
                {chartData.map(item => (
                    <div key={item.name} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-20">
                            <div className="bg-brand-surface border border-brand-border shadow-2xl p-2 rounded-lg text-[9px] whitespace-nowrap">
                                <p className="text-brand-accent font-bold">In: {formatCurrency(item.income, 0)}</p>
                                <p className="text-rose-400 font-bold">Out: {formatCurrency(item.expense, 0)}</p>
                            </div>
                            <div className="w-2 h-2 bg-brand-surface border-r border-b border-brand-border rotate-45 -mt-1"></div>
                        </div>
                        <div className="w-full flex items-end gap-0.5 h-full">
                            <div className="flex-1 bg-brand-accent/30 rounded-t-sm group-hover:bg-brand-accent transition-all duration-300 shadow-[0_0_15px_-5px_rgba(var(--brand-accent-rgb),0.4)]" style={{ height: `${(item.income / maxVal) * 100}%` }}></div>
                            <div className="flex-1 bg-rose-500/30 rounded-t-sm group-hover:bg-rose-500 transition-all duration-300 shadow-[0_0_15px_-5px_rgba(244,63,94,0.4)]" style={{ height: `${(item.expense / maxVal) * 100}%` }}></div>
                        </div>
                        <span className="text-[9px] font-black text-brand-text-secondary mt-3 uppercase tracking-tighter">{item.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ClientEngagementChartWidget: React.FC<{ leads: Lead[], clients: Client[], dateRange: DateRange }> = ({ leads, clients, dateRange }) => {
    const chartData = useMemo(() => {
        const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
        const currentYear = new Date().getFullYear();
        
        return months.map((month, idx) => {
            const leadInteractions = leads.filter(l => {
                const d = new Date(l.date);
                return d.getMonth() === idx && d.getFullYear() === currentYear;
            }).length;

            const clientContact = clients.filter(c => {
                const d = new Date(c.lastContact || c.since);
                return d.getMonth() === idx && d.getFullYear() === currentYear;
            }).length;

            const simulatedMessages = (leadInteractions * 8) + (clientContact * 12) + (Math.floor(Math.random() * 20));

            return {
                name: month,
                interactions: leadInteractions + clientContact,
                messages: simulatedMessages
            };
        });
    }, [leads, clients]);

    const maxMessages = Math.max(...chartData.map(d => d.messages), 1);

    return (
        <div className="bg-brand-surface p-6 rounded-2xl shadow-lg border border-brand-border h-full flex flex-col">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h3 className="font-black text-sm uppercase tracking-widest text-brand-text-light">Grafik Chat & Engagement Klien</h3>
                    <p className="text-[10px] text-brand-text-secondary font-black uppercase mt-1 tracking-tighter">Volume Pesan & Interaksi Konsultasi Real-time</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 bg-brand-accent rounded-full shadow-[0_0_8px_rgba(var(--brand-accent-rgb),0.5)]"></div>
                        <span className="text-[9px] font-black uppercase text-brand-text-secondary">Pesan Masuk</span>
                    </div>
                </div>
            </div>

            <div className="flex-grow h-56 flex justify-between items-end gap-2 mt-4 px-2">
                {chartData.map(item => (
                    <div key={item.name} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-20">
                            <div className="bg-brand-surface border border-brand-border shadow-2xl p-2 rounded-lg text-[9px] whitespace-nowrap">
                                <p className="text-brand-accent font-bold">{item.messages} Pesan</p>
                                <p className="text-brand-text-secondary">{item.interactions} Interaksi</p>
                            </div>
                            <div className="w-2 h-2 bg-brand-surface border-r border-b border-brand-border rotate-45 -mt-1"></div>
                        </div>
                        <div className="w-full bg-brand-accent/10 rounded-t-lg group-hover:bg-brand-accent/30 transition-all duration-300 relative overflow-hidden" style={{ height: `${(item.messages / maxMessages) * 100}%` }}>
                            <div className="absolute bottom-0 left-0 right-0 bg-brand-accent rounded-t-lg shadow-[0_0_20px_rgba(var(--brand-accent-rgb),0.5)]" style={{ height: '100%' }}></div>
                        </div>
                        <span className="text-[9px] font-black text-brand-text-secondary mt-3 uppercase tracking-tighter">{item.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const RecentTransactionsWidget: React.FC<{ transactions: Transaction[], dateRange: DateRange }> = ({ transactions, dateRange }) => {
    const filtered = useMemo(() => {
        if (!dateRange.startDate) return transactions.slice(0, 6);
        return transactions.filter(t => {
            const d = new Date(t.date);
            return d >= dateRange.startDate! && d <= (dateRange.endDate || new Date());
        }).slice(0, 6);
    }, [transactions, dateRange]);

    return (
        <div className="bg-brand-surface p-6 rounded-2xl shadow-lg border border-brand-border h-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-sm uppercase tracking-widest text-brand-text-light">Transaksi Terbaru</h3>
                <div className="p-2 bg-brand-bg rounded-lg text-brand-text-secondary">
                    <DollarSignIcon className="w-4 h-4" />
                </div>
            </div>
            <div className="space-y-4">
                {filtered.map(t => (
                    <div key={t.id} className="flex items-center gap-4 group p-2 hover:bg-white/5 rounded-xl transition-all">
                        <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${t.type === TransactionType.INCOME ? 'bg-brand-success/10' : 'bg-brand-danger/10'}`}>
                            <TrendingUpIcon className={`w-4 h-4 ${t.type === TransactionType.INCOME ? 'text-brand-success' : 'text-brand-danger'}`} />
                        </div>
                        <div className="flex-grow overflow-hidden">
                            <p className="font-bold text-brand-text-light truncate text-xs uppercase tracking-tight">{t.description}</p>
                            <p className="text-[10px] text-brand-text-secondary font-medium uppercase tracking-tighter mt-0.5">{new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                        <div className={`font-black text-xs ${t.type === TransactionType.INCOME ? 'text-brand-success' : 'text-brand-text-light'}`}>
                            {t.type === TransactionType.INCOME ? '+' : '-'}{formatCurrency(t.amount, 0)}
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && (
                    <div className="py-12 text-center">
                        <p className="text-xs text-brand-text-secondary font-bold uppercase tracking-widest">Tidak ada transaksi di periode ini</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const PackageDistributionWidget: React.FC<{ projects: Project[], dateRange: DateRange }> = ({ projects, dateRange }) => {
    const filtered = useMemo(() => {
        if (!dateRange.startDate) return projects;
        return projects.filter(p => {
            const d = new Date(p.date);
            return d >= dateRange.startDate! && d <= (dateRange.endDate || new Date());
        });
    }, [projects, dateRange]);

    const distribution = useMemo(() => {
        const counts: Record<string, number> = {};
        filtered.forEach(p => {
            counts[p.packageName] = (counts[p.packageName] || 0) + 1;
        });
        const total = filtered.length || 1;
        return Object.entries(counts)
            .sort(([, a], [, b]) => b - a)
            .map(([name, count]) => ({ name, count, percentage: (count / total) * 100 }));
    }, [filtered]);

    return (
        <div className="bg-brand-surface p-6 rounded-2xl shadow-lg border border-brand-border h-full">
            <h3 className="font-black text-sm uppercase tracking-widest text-brand-text-light mb-6">Popularitas Paket</h3>
            <div className="space-y-5">
                {distribution.slice(0, 5).map((pkg, idx) => (
                    <div key={pkg.name}>
                        <div className="flex justify-between text-[11px] mb-2">
                            <span className="text-brand-text-light font-black uppercase tracking-tight truncate pr-4">{pkg.name}</span>
                            <span className="text-brand-text-secondary font-bold">{pkg.count} Booking</span>
                        </div>
                        <div className="w-full bg-brand-bg rounded-full h-2 overflow-hidden border border-brand-border/30">
                            <div 
                                className="h-full rounded-full bg-brand-accent transition-all duration-1000" 
                                style={{ width: `${pkg.percentage}%`, opacity: 1 - (idx * 0.15) }}
                            ></div>
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && <p className="text-center text-xs text-brand-text-secondary py-8 font-bold uppercase">No Data</p>}
            </div>
        </div>
    );
};

const ConversionFunnelWidget: React.FC<{ leads: Lead[], dateRange: DateRange }> = ({ leads, dateRange }) => {
    const filtered = useMemo(() => {
        if (!dateRange.startDate) return leads;
        return leads.filter(l => {
            const d = new Date(l.date);
            return d >= dateRange.startDate! && d <= (dateRange.endDate || new Date());
        });
    }, [leads, dateRange]);

    const total = filtered.length || 1;
    const stats = [
        { label: 'Total Leads', count: filtered.length, color: 'from-blue-600 to-blue-400' },
        { label: 'Diskusi Aktif', count: filtered.filter(l => l.status === LeadStatus.DISCUSSION || l.status === LeadStatus.CONVERTED).length, color: 'from-brand-accent to-purple-400' },
        { label: 'Dikonversi', count: filtered.filter(l => l.status === LeadStatus.CONVERTED).length, color: 'from-brand-success to-emerald-400' },
    ];

    return (
        <div className="bg-brand-surface p-6 rounded-2xl shadow-lg border border-brand-border h-full">
            <h3 className="font-black text-sm uppercase tracking-widest text-brand-text-light mb-8">Corong Konversi</h3>
            <div className="flex flex-col items-center space-y-3">
                {stats.map((step, i) => {
                    const width = (step.count / total) * 100;
                    return (
                        <div key={step.label} className="w-full flex flex-col items-center">
                            <div 
                                className={`bg-gradient-to-r ${step.color} h-12 flex items-center justify-between px-6 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-lg transition-all duration-700`}
                                style={{ width: `${Math.max(width, 40)}%`, opacity: 1 - (i * 0.1) }}
                            >
                                <span>{step.label}</span>
                                <span>{step.count}</span>
                            </div>
                            {i < stats.length - 1 && (
                                <div className="py-1">
                                    <ChevronRightIcon className="w-4 h-4 text-brand-text-secondary rotate-90" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const LeadSourceWidget: React.FC<{ leads: Lead[], dateRange: DateRange }> = ({ leads, dateRange }) => {
    const filtered = useMemo(() => {
        if (!dateRange.startDate) return leads;
        return leads.filter(l => {
            const d = new Date(l.date);
            return d >= dateRange.startDate! && d <= (dateRange.endDate || new Date());
        });
    }, [leads, dateRange]);

    const sourceData = useMemo(() => {
        const counts: Record<string, number> = {};
        filtered.forEach(l => {
            counts[l.contactChannel] = (counts[l.contactChannel] || 0) + 1;
        });
        const total = filtered.length || 1;
        return Object.entries(counts)
            .sort(([, a], [, b]) => b - a)
            .map(([name, count]) => ({ name, count, percentage: (count / total) * 100 }));
    }, [filtered]);

    return (
        <div className="bg-brand-surface p-6 rounded-2xl shadow-lg border border-brand-border h-full">
            <h3 className="font-black text-sm uppercase tracking-widest text-brand-text-light mb-6">Omnichannel Marketing</h3>
            <div className="grid grid-cols-1 gap-4">
                {sourceData.map((source, idx) => (
                    <div key={source.name} className="flex items-center gap-4 group">
                        <div className="flex-grow">
                            <div className="flex justify-between text-[11px] mb-2 font-black uppercase tracking-tight">
                                <span className="text-brand-text-light">{source.name}</span>
                                <span className="text-brand-text-secondary">{source.count}</span>
                            </div>
                            <div className="w-full bg-brand-bg rounded-full h-2.5 overflow-hidden border border-brand-border/30">
                                <div 
                                    className="h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(var(--brand-accent-rgb),0.3)]"
                                    style={{ 
                                        width: `${source.percentage}%`,
                                        backgroundColor: `hsl(${idx * 45 + 190}, 75%, 60%)`
                                    }}
                                ></div>
                            </div>
                        </div>
                        <span className="text-xs font-black text-brand-text-light w-10 text-right">{source.percentage.toFixed(0)}%</span>
                    </div>
                ))}
                {filtered.length === 0 && <p className="text-center text-xs text-brand-text-secondary py-8 font-bold uppercase">No Channels Record</p>}
            </div>
        </div>
    );
};

const BusinessHealthWidget: React.FC<{ projects: Project[], transactions: Transaction[], dateRange: DateRange }> = ({ projects, transactions, dateRange }) => {
    const filteredProjects = useMemo(() => {
        if (!dateRange.startDate) return projects;
        return projects.filter(p => {
            const d = new Date(p.date);
            return d >= dateRange.startDate! && d <= (dateRange.endDate || new Date());
        });
    }, [projects, dateRange]);

    const filteredTransactions = useMemo(() => {
        if (!dateRange.startDate) return transactions;
        return transactions.filter(t => {
            const d = new Date(t.date);
            return d >= dateRange.startDate! && d <= (dateRange.endDate || new Date());
        });
    }, [transactions, dateRange]);

    const stats = useMemo(() => {
        const income = filteredTransactions.filter(t => t.type === TransactionType.INCOME).reduce((s, t) => s + t.amount, 0);
        const expense = filteredTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((s, t) => s + t.amount, 0);
        const margin = income > 0 ? ((income - expense) / income) * 100 : 0;
        
        const completed = filteredProjects.filter(p => p.status === 'Selesai').length;
        const total = filteredProjects.length || 1;
        const successRate = (completed / total) * 100;

        return [
            { label: 'Profit Margin', value: `${margin.toFixed(1)}%`, icon: <TrendingUpIcon className="w-4 h-4" />, color: 'text-brand-success', bg: 'bg-brand-success/10' },
            { label: 'Project Success', value: `${successRate.toFixed(1)}%`, icon: <StarIcon className="w-4 h-4" />, color: 'text-brand-accent', bg: 'bg-brand-accent/10' },
            { label: 'Average Revenue', value: formatCurrency(income / total, 0), icon: <DollarSignIcon className="w-4 h-4" />, color: 'text-brand-text-light', bg: 'bg-white/5' },
        ];
    }, [filteredProjects, filteredTransactions]);

    return (
        <div className="bg-brand-surface p-6 rounded-2xl shadow-lg border border-brand-border h-full">
            <h3 className="font-black text-sm uppercase tracking-widest text-brand-text-light mb-8">Statistik Vital Bisnis</h3>
            <div className="space-y-4">
                {stats.map(stat => (
                    <div key={stat.label} className="flex items-center justify-between p-4 bg-brand-bg rounded-2xl border border-brand-border/50 hover:border-brand-accent/30 transition-all hover:scale-[1.02] group">
                        <div className="flex items-center gap-4">
                            <div className={`p-2.5 rounded-xl transition-transform group-hover:scale-110 ${stat.bg} ${stat.color}`}>{stat.icon}</div>
                            <span className="text-xs font-black uppercase tracking-widest text-brand-text-secondary">{stat.label}</span>
                        </div>
                        <span className={`text-lg font-black tracking-tight ${stat.color}`}>{stat.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const BookingDetailedChartWidget: React.FC<{ leads: Lead[], projects: Project[], dateRange: DateRange }> = ({ leads, projects, dateRange }) => {
    const [tooltip, setTooltip] = useState<{ x: number; y: number; data: any } | null>(null);

    const filteredProjects = useMemo(() => {
        if (!dateRange.startDate) return projects;
        return projects.filter(p => {
            const d = new Date(p.date);
            return d >= dateRange.startDate! && d <= (dateRange.endDate || new Date());
        });
    }, [projects, dateRange]);

    const filteredLeads = useMemo(() => {
        if (!dateRange.startDate) return leads;
        return leads.filter(l => {
            const d = new Date(l.date);
            return d >= dateRange.startDate! && d <= (dateRange.endDate || new Date());
        });
    }, [leads, dateRange]);

    const chartData = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
        const data = months.map(month => ({ name: month, count: 0, value: 0, leads: 0 }));

        filteredProjects.forEach(project => {
            const d = new Date(project.date);
            if (d.getFullYear() === currentYear) {
                const m = d.getMonth();
                data[m].count += 1;
                data[m].value += project.totalCost;
            }
        });

        filteredLeads.forEach(lead => {
            const d = new Date(lead.date);
            if (d.getFullYear() === currentYear) {
                const m = d.getMonth();
                data[m].leads += 1;
            }
        });

        return data;
    }, [filteredProjects, filteredLeads]);

    const maxCount = Math.max(...chartData.map(d => Math.max(d.count, d.leads)), 1);
    const maxValue = Math.max(...chartData.map(d => d.value), 1);

    return (
        <div className="bg-brand-surface p-6 rounded-2xl shadow-lg border border-brand-border h-full flex flex-col">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h3 className="font-black text-sm uppercase tracking-widest text-brand-text-light">Performa Booking & Revenue</h3>
                    <p className="text-[10px] text-brand-text-secondary font-black uppercase mt-1 tracking-tighter">Analisa trend pertumbuhan Wedding Date & Lead Intake</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 bg-sky-500 rounded-full shadow-[0_0_8px_rgba(14,165,233,0.5)]"></div>
                        <span className="text-[9px] font-black uppercase text-brand-text-secondary">Booking</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 bg-violet-500 rounded-full shadow-[0_0_8px_rgba(139,92,246,0.5)]"></div>
                        <span className="text-[9px] font-black uppercase text-brand-text-secondary">Leads In</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                        <span className="text-[9px] font-black uppercase text-brand-text-secondary">Revenue</span>
                    </div>
                </div>
            </div>
            
            <div className="relative flex-grow h-64 flex justify-between items-end gap-2 bg-brand-bg/20 rounded-2xl p-6 mb-2">
                {/* SVG for Lead Trend Line */}
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-x-6 inset-y-6 w-[calc(100%-48px)] h-[calc(100%-48px)] pointer-events-none z-10 overflow-visible">
                    <defs>
                        <linearGradient id="leadGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#c084fc" />
                        </linearGradient>
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>
                    <polyline
                        fill="none"
                        stroke="url(#leadGradient)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={chartData.map((d, i) => `${(i / 11) * 100},${100 - (d.leads / maxCount) * 100}`).join(' ')}
                        style={{ vectorEffect: 'non-scaling-stroke', filter: 'url(#glow)' }}
                    />
                    {chartData.map((d, i) => (
                        <circle
                            key={i}
                            cx={(i / 11) * 100}
                            cy={100 - (d.leads / maxCount) * 100}
                            r="1"
                            fill="#8b5cf6"
                            className="drop-shadow-[0_0_10px_rgba(139,92,246,0.8)]"
                        />
                    ))}
                </svg>

                {chartData.map((item, index) => {
                    const countHeight = (item.count / maxCount) * 100;
                    const valueHeight = (item.value / maxValue) * 100;
                    return (
                        <div key={item.name} className="flex-1 flex flex-col items-center justify-end h-full group relative z-0">
                            <div className="absolute bottom-full mb-6 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-40">
                                <div className="bg-brand-surface border border-brand-accent/30 p-4 rounded-2xl shadow-2xl min-w-[200px] backdrop-blur-xl">
                                    <p className="text-[10px] font-black uppercase tracking-widest border-b border-brand-border pb-2 mb-3 text-brand-accent">{item.name}</p>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center bg-violet-500/10 p-2 rounded-lg">
                                            <span className="text-[9px] text-violet-300 font-bold uppercase">Leads Intake</span>
                                            <span className="text-[11px] text-violet-300 font-black">{item.leads}</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-sky-500/10 p-2 rounded-lg">
                                            <span className="text-[9px] text-sky-300 font-bold uppercase">Work Volume</span>
                                            <span className="text-[11px] text-sky-300 font-black">{item.count}</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-emerald-500/10 p-2 rounded-lg">
                                            <span className="text-[9px] text-emerald-300 font-bold uppercase">Gross Value</span>
                                            <span className="text-[11px] text-emerald-300 font-black">{formatCurrency(item.value, 0)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-3 h-3 bg-brand-surface border-r border-b border-brand-accent/30 rotate-45 -mt-1.5 shadow-xl"></div>
                            </div>

                            <div className="w-full flex items-end gap-1.5 h-full max-w-[44px]">
                                <div className="flex-1 bg-gradient-to-t from-sky-600/40 to-sky-400 rounded-t-lg group-hover:from-sky-500 group-hover:to-sky-300 transition-all duration-500 shadow-[0_0_15px_-5px_rgba(14,165,233,0.4)]" style={{ height: `${Math.max(countHeight, 2)}%` }}></div>
                                <div className="flex-1 bg-gradient-to-t from-emerald-600/20 to-emerald-500/40 rounded-t-lg group-hover:from-emerald-500 group-hover:to-emerald-300 transition-all duration-500" style={{ height: `${Math.max(valueHeight, 2)}%` }}></div>
                            </div>
                            <span className="text-[9px] font-black text-brand-text-secondary mt-5 uppercase tracking-tighter group-hover:text-brand-text-light transition-colors">{item.name}</span>
                        </div>
                    );
                })}
            </div>
            <div className="p-4 bg-brand-bg/40 rounded-2xl mt-4 border border-brand-border/30 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-1.5">
                    <div className="w-5 h-5 rounded-lg bg-violet-500/20 flex items-center justify-center">
                        <TrendingUpIcon className="w-3 h-3 text-violet-400" />
                    </div>
                    <span className="text-[10px] font-black uppercase text-brand-text-light tracking-widest">Growth Analytics Insight</span>
                </div>
                <p className="text-[9px] text-brand-text-secondary font-medium leading-relaxed pl-8">Trend garis <span className="text-violet-400 font-bold">Violet</span> merepresentasikan intake calon pengantin, sedangkan bar <span className="text-sky-400 font-bold">Sky Blue</span> menunjukkan konversi nyata menjadi Wedding Date terjadwal.</p>
            </div>
        </div>
    );
};



const LeadsByRegionWidget: React.FC<{ leads: Lead[], dateRange: DateRange }> = ({ leads, dateRange }) => {
    const filtered = useMemo(() => {
        if (!dateRange.startDate) return leads;
        return leads.filter(l => {
            const d = new Date(l.date);
            return d >= dateRange.startDate! && d <= (dateRange.endDate || new Date());
        });
    }, [leads, dateRange]);

    const regionDonutData = useMemo(() => {
        const palette = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f43f5e', '#a855f7', '#14b8a6'];
        const distribution = filtered.reduce((acc, l) => {
            const key = ((l.location || '').trim()) || 'Jakarta';
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        return Object.entries(distribution)
            .sort(([, a], [, b]) => Number(b) - Number(a))
            .map(([label, value], idx) => ({ label, value, color: palette[idx % palette.length] }));
    }, [filtered]);

    return (
        <div className="bg-brand-surface p-6 rounded-2xl shadow-lg border border-brand-border h-full flex flex-col">
            <h3 className="font-black text-sm uppercase tracking-widest text-brand-text-light mb-6">Peta Demografi</h3>
            <div className="flex-grow flex items-center justify-center p-4">
                <DonutChart data={regionDonutData} className="w-full" showValues={true} />
            </div>
        </div>
    );
};

const ProjectValueByTypeWidget: React.FC<{ projects: Project[], dateRange: DateRange }> = ({ projects, dateRange }) => {
    const filtered = useMemo(() => {
        if (!dateRange.startDate) return projects;
        return projects.filter(p => {
            const d = new Date(p.date);
            return d >= dateRange.startDate! && d <= (dateRange.endDate || new Date());
        });
    }, [projects, dateRange]);

    const valueData = useMemo(() => {
        const distribution: Record<string, number> = {};
        filtered.forEach(p => {
            const type = p.projectType || 'Standard';
            distribution[type] = (distribution[type] || 0) + p.totalCost;
        });

        const palette = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
        return Object.entries(distribution)
            .sort(([, a], [, b]) => b - a)
            .map(([label, value], idx) => ({ 
                label, 
                value, 
                color: palette[idx % palette.length] 
            }));
    }, [filtered]);

    return (
        <div className="bg-brand-surface p-6 rounded-2xl shadow-lg border border-brand-border h-full flex flex-col">
            <h3 className="font-black text-sm uppercase tracking-widest text-brand-text-light mb-6">Segmentasi Proyek</h3>
            <div className="flex-grow flex items-center justify-center p-4">
                <DonutChart data={valueData} className="w-full" showValues={true} />
            </div>
        </div>
    );
};

const TeamWorkloadWidget: React.FC<{ teamMembers: TeamMember[], projects: Project[], dateRange: DateRange }> = ({ teamMembers, projects, dateRange }) => {
    const filteredProjects = useMemo(() => {
        if (!dateRange.startDate) return projects;
        return projects.filter(p => {
            const d = new Date(p.date);
            return d >= dateRange.startDate! && d <= (dateRange.endDate || new Date());
        });
    }, [projects, dateRange]);

    const workload = useMemo(() => {
        const counts: Record<string, number> = {};
        filteredProjects.forEach(p => {
            p.team?.forEach(member => {
                counts[member.memberId] = (counts[member.memberId] || 0) + 1;
            });
        });

        return teamMembers.map(m => ({
            name: m.name,
            role: m.role,
            count: counts[m.id] || 0
        })).sort((a, b) => b.count - a.count).slice(0, 6);
    }, [teamMembers, filteredProjects]);

    const maxCount = Math.max(...workload.map(w => w.count), 1);

    return (
        <div className="bg-brand-surface p-6 rounded-2xl shadow-lg border border-brand-border h-full">
            <h3 className="font-black text-sm uppercase tracking-widest text-brand-text-light mb-8">Kapasitas & Beban Kerja Tim</h3>
            <div className="space-y-6">
                {workload.map(member => (
                    <div key={member.name}>
                        <div className="flex justify-between items-center mb-2">
                            <div>
                                <span className="text-[11px] font-black uppercase text-brand-text-light tracking-tight">{member.name}</span>
                                <span className="text-[9px] font-bold text-brand-text-secondary uppercase ml-2 tracking-tighter opacity-70">{member.role}</span>
                            </div>
                            <span className="text-[10px] font-black text-brand-accent">{member.count} Proyek</span>
                        </div>
                        <div className="w-full bg-brand-bg rounded-full h-1.5 border border-brand-border/30">
                            <div className="h-full bg-brand-accent rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(var(--brand-accent-rgb),0.3)]" style={{ width: `${(member.count / maxCount) * 100}%` }}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Client Insights & Status Widgets ---

const ClientDrilldownModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description: string;
    clients: Client[];
    onViewDetail: (client: Client) => void;
}> = ({ isOpen, onClose, title, description, clients, onViewDetail }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-brand-bg/80 backdrop-blur-md" onClick={onClose}></div>
            <div className="relative bg-brand-surface w-full max-w-2xl max-h-[85vh] rounded-3xl border border-brand-border shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-brand-border flex justify-between items-center bg-gradient-to-r from-brand-accent/5 to-transparent">
                    <div>
                        <h2 className="text-xl font-black text-brand-text-light uppercase tracking-tight">{title}</h2>
                        <p className="text-xs text-brand-text-secondary font-bold uppercase mt-1">{description}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-brand-bg rounded-xl text-brand-text-secondary transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-6 space-y-3 custom-scrollbar">
                    {clients.length > 0 ? (
                        clients.map(client => (
                            <div 
                                key={client.id} 
                                onClick={() => { onViewDetail(client); onClose(); }}
                                className="p-4 bg-brand-bg/50 rounded-2xl border border-brand-border/50 hover:border-brand-accent/40 hover:bg-brand-accent/5 transition-all cursor-pointer group flex justify-between items-center"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-xs font-black text-brand-accent">
                                        {client.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sm text-brand-text-light uppercase tracking-tight group-hover:text-brand-accent transition-colors">{client.name}</h4>
                                        <p className="text-[10px] text-brand-text-secondary font-bold uppercase">{client.whatsapp || 'No WhatsApp'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right mr-2">
                                        <p className="text-[11px] font-black text-brand-text-light uppercase tracking-tighter">
                                            {(client as any).balanceDue > 0 ? 'Tagihan:' : 'Status:'}
                                        </p>
                                        <p className={`text-[10px] font-black uppercase ${(client as any).balanceDue > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                            {(client as any).balanceDue > 0 ? formatCurrency((client as any).balanceDue) : 'Lunas'}
                                        </p>
                                    </div>
                                    <ChevronRightIcon className="w-4 h-4 text-brand-text-secondary group-hover:text-brand-accent transition-colors" />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 opacity-40">
                            <UsersIcon className="w-12 h-12 mb-4 text-brand-text-secondary" />
                            <p className="text-sm font-black uppercase tracking-widest text-brand-text-secondary">Tidak ada data klien</p>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-brand-border bg-brand-bg/30">
                    <button 
                        onClick={onClose}
                        className="w-full py-3 bg-brand-surface hover:bg-brand-accent hover:text-white text-brand-text-light rounded-2xl text-xs font-black uppercase tracking-widest border border-brand-border hover:border-brand-accent transition-all"
                    >
                        Tutup Panel
                    </button>
                </div>
            </div>
        </div>
    );
};

const ClientStatusBreakdownWidget: React.FC<{ 
    clients: Client[], 
    projects: Project[],
    onDrilldown: (label: string, filteredClients: Client[]) => void
}> = ({ clients, projects, onDrilldown }) => {
    const statusData = useMemo(() => {
        const activeCount = projects.filter(p => p.status !== 'Selesai' && p.status !== 'Dibatalkan').length;
        const unpaidCount = clients.filter(c => (c as any).balanceDue > 0).length;
        const totalCompleted = projects.filter(p => p.status === 'Selesai').length;
        const inactiveCount = Math.max(0, clients.length - activeCount - unpaidCount);

        return [
            { label: 'Aktif / On-Progress', value: activeCount, color: '#f472b6', type: 'active' }, // Pink
            { label: 'Tagihan Pending', value: unpaidCount, color: '#fb923c', type: 'unpaid' },   // Orange
            { label: 'Lunas & Selesai', value: totalCompleted, color: '#10b981', type: 'completed' }, // Green
            { label: 'Inaktif', value: inactiveCount, color: '#94a3b8', type: 'inactive' }           // Gray
        ];
    }, [clients, projects]);

    const handleChartClick = (item: any) => {
        let filtered: Client[] = [];
        switch(item.type) {
            case 'active':
                const activeProjectClientIds = projects.filter(p => p.status !== 'Selesai' && p.status !== 'Dibatalkan').map(p => p.clientId);
                filtered = clients.filter(c => activeProjectClientIds.includes(c.id));
                break;
            case 'unpaid':
                filtered = clients.filter(c => (c as any).balanceDue > 0);
                break;
            case 'completed':
                const completedIds = projects.filter(p => p.status === 'Selesai').map(p => p.clientId);
                filtered = clients.filter(c => completedIds.includes(c.id));
                break;
            case 'inactive':
            default:
                const busyIds = projects.map(p => p.clientId);
                filtered = clients.filter(c => !busyIds.includes(c.id));
                break;
        }
        onDrilldown(item.label, filtered);
    };

    return (
        <div className="bg-brand-surface p-6 rounded-2xl shadow-lg border border-brand-border h-full flex flex-col">
            <h3 className="font-black text-sm uppercase tracking-widest text-brand-text-light mb-6">Status Database Pengantin</h3>
            <div className="flex-grow flex items-center justify-center p-4">
                <DonutChart 
                    data={statusData} 
                    className="w-full" 
                    showValues={true} 
                    onClick={handleChartClick}
                />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
                {statusData.map(item => (
                    <div 
                        key={item.label} 
                        onClick={() => handleChartClick(item)}
                        className="flex items-center gap-2 p-2 bg-brand-bg hover:bg-brand-accent/5 rounded-lg border border-brand-border/30 cursor-pointer transition-colors group"
                    >
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-[9px] font-black uppercase text-brand-text-secondary truncate group-hover:text-brand-accent">{item.label}</span>
                        <span className="ml-auto text-[10px] font-black text-brand-text-light">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const RecentUnpaidClientsWidget: React.FC<{ 
    clients: Client[], 
    handleNavigation: (view: ViewType) => void,
    onViewClient: (client: Client) => void
}> = ({ clients, handleNavigation, onViewClient }) => {
    const unpaidClients = useMemo(() => {
        return clients
            .filter(c => (c as any).balanceDue > 0)
            .sort((a, b) => (b as any).balanceDue - (a as any).balanceDue)
            .slice(0, 5);
    }, [clients]);

    return (
        <div className="bg-brand-surface p-6 rounded-2xl shadow-lg border border-brand-border h-full flex flex-col">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="font-black text-sm uppercase tracking-widest text-brand-text-light">Tagihan Client Pending</h3>
                    <p className="text-[10px] text-brand-text-secondary font-black uppercase mt-1 tracking-tighter">Prioritas Pelunasan Piutang</p>
                </div>
                <button 
                    onClick={() => handleNavigation(ViewType.CLIENTS)}
                    className="p-2 bg-brand-bg hover:bg-brand-accent/10 text-brand-text-secondary hover:text-brand-accent rounded-xl transition-all border border-brand-border"
                >
                    <ChevronRightIcon className="w-4 h-4" />
                </button>
            </div>

            <div className="flex-grow space-y-3">
                {unpaidClients.map(client => (
                    <div 
                        key={client.id} 
                        onClick={() => onViewClient(client)}
                        className="p-3 bg-brand-bg rounded-xl border border-brand-border/50 hover:border-brand-accent/30 transition-all flex justify-between items-center group cursor-pointer"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-[10px] font-black text-brand-accent">
                                {client.name.charAt(0)}
                            </div>
                            <div>
                                <p className="text-[11px] font-black text-brand-text-light uppercase tracking-tight group-hover:text-brand-accent transition-colors">{client.name}</p>
                                <p className="text-[9px] text-brand-text-secondary font-bold uppercase">{client.whatsapp || 'No WA'}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[11px] font-black text-rose-400">{formatCurrency((client as any).balanceDue || 0)}</p>
                            <p className="text-[8px] text-brand-text-secondary font-black uppercase tracking-widest">Sisa</p>
                        </div>
                    </div>
                ))}

                {unpaidClients.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-48 opacity-40">
                        <StarIcon className="w-8 h-8 mb-2 text-brand-success" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-text-secondary">Semua Lunas!</p>
                    </div>
                )}
            </div>
            
            <button 
                onClick={() => handleNavigation(ViewType.CLIENTS)}
                className="mt-6 w-full py-3 bg-brand-bg hover:bg-brand-accent text-brand-text-secondary hover:text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-brand-border hover:border-brand-accent shadow-sm"
            >
                Kelola Database Klien
            </button>
        </div>
    );
};

// --- Main Dashboard Component ---

interface DashboardProps {
    handleNavigation?: (view: ViewType, action?: NavigationAction) => void;
    currentUser?: User | null;
}

const Dashboard: React.FC<DashboardProps> = ({ 
    handleNavigation: propsHandleNavigation, 
    currentUser: propsCurrentUser 
}) => {
    const { currentUser: contextCurrentUser } = useApp();
    const { setActiveView } = useUIStore();

    const handleNavigation = useCallback((view: ViewType) => {
        setActiveView(view);
        const pathMap: any = {
            [ViewType.HOMEPAGE]: "home",
            [ViewType.DASHBOARD]: "dashboard",
        };
        const newPath = pathMap[view] || view.toLowerCase().replace(/ /g, "-");
        window.location.hash = `#/${newPath}`;
    }, [setActiveView]);

    const { data: profile } = useProfile();
    const projectStatusConfig = profile?.projectStatusConfig || [];

    const [dateRange, setDateRange] = useState<DateRange>({ type: 'all', startDate: null, endDate: null });
    const [activeModal, setActiveModal] = useState<'balance' | 'projects' | 'clients' | 'teamMembers' | 'payments' | null>(null);

    const { data: projects = [] } = useProjects();
    const { data: clients = [] } = useClients();
    const { data: leads = [] } = useLeads();
    const { data: teamMembers = [] } = useTeamMembers();
    const { data: teamProjectPayments = [] } = useTeamProjectPayments();
    const { transactions, cards, pockets } = useFinanceData();
    const [feedback, setFeedback] = useState<ClientFeedback[]>([]);
    const { data: packages = [] } = usePackages();

    // State for Drilldown Modals
    const [drilldown, setDrilldown] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        clients: Client[];
    }>({
        isOpen: false,
        title: '',
        description: '',
        clients: []
    });

    const handleOpenDrilldown = (title: string, description: string, filteredClients: Client[]) => {
        setDrilldown({
            isOpen: true,
            title,
            description,
            clients: filteredClients
        });
    };

    const [selectedClientForModal, setSelectedClientForModal] = useState<Client | null>(null);

    useEffect(() => {
        listClientFeedback().then(setFeedback).catch(console.error);
    }, []);

    const getSubStatusDisplay = (project: Project) => {
        if (project.activeSubStatuses?.length) {
            return `${project.status}: ${project.activeSubStatuses.join(', ')}`;
        }
        return project.status;
    };

    const summary = useMemo(() => {
        const now = new Date();
        const start = dateRange.startDate || new Date(now.getFullYear(), now.getMonth(), 1);
        const end = dateRange.endDate || new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        const projsInPeriod = projects.filter(p => {
            const d = new Date(p.date);
            return d >= start && d <= end;
        });

        const txsInPeriod = transactions.filter(t => {
            const d = new Date(t.date);
            return d >= start && d <= end;
        });

        const incomeInPeriod = txsInPeriod
            .filter(t => t.type === TransactionType.INCOME)
            .reduce((sum, t) => sum + t.amount, 0);

        const newLeadsInPeriod = leads.filter(l => {
            const d = new Date(l.date);
            return d >= start && d <= end;
        }).length;

        const activeProjs = projects.filter(p => p.status !== 'Selesai' && p.status !== 'Dibatalkan').length;
        const activeClis = clients.filter(c => c.status === ClientStatus.ACTIVE).length;
        const unpaidInv = projects.filter(p => p.paymentStatus !== PaymentStatus.LUNAS && p.status !== 'Dibatalkan').length;

        const avgSatisfaction = feedback.length > 0 
            ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length 
            : 4.8;

        const newClientsInPeriod = clients.filter(c => {
            const d = new Date(c.since);
            return d >= start && d <= end;
        }).length;

        const clientsWaitingFollowup = leads.filter(l => l.status === LeadStatus.FOLLOW_UP).length;

        return {
            totalBalance: cards.reduce((sum, c) => sum + Number(c.balance), 0),
            activeProjects: activeProjs,
            activeClients: activeClis,
            eventsInPeriod: projsInPeriod.length,
            incomeInPeriod: incomeInPeriod,
            newLeadsInPeriod: newLeadsInPeriod,
            unpaidInvoices: unpaidInv,
            totalTeamCount: teamMembers.length,
            avgSatisfaction: avgSatisfaction,
            newClientsInPeriod: newClientsInPeriod,
            clientsWaitingFollowup: clientsWaitingFollowup,
            periodLabel: dateRange.type === 'all' ? 'Sepanjang Waktu' : 
                         dateRange.type === 'today' ? 'Hari Ini' :
                         dateRange.type === 'last7' ? '7 Hari Terakhir' :
                         dateRange.type === 'last30' ? '30 Hari Terakhir' :
                         dateRange.type === 'thisMonth' ? 'Bulan Ini' : 'Tahun Ini'
        };
    }, [projects, transactions, leads, cards, clients, dateRange, teamMembers.length, feedback]);

    const unpaidTeamPayments = useMemo(() => teamProjectPayments.filter(p => p.status === PaymentStatus.BELUM_BAYAR), [teamProjectPayments]);

    if (!profile) return <div className="flex items-center justify-center min-h-[400px]"><LoadingState size="large" /></div>;

    const modalTitles: Record<string, string> = {
        balance: 'Rincian Saldo',
        projects: 'Daftar Acara Aktif',
        clients: 'Daftar Pengantin Aktif',
        teamMembers: 'Anggota Tim & Vendor',
        payments: 'Fee Tim Menunggu Pembayaran'
    };

    return (
        <div className="flex flex-col gap-8 p-4 md:p-8 animate-in fade-in slide-in-from-bottom-6 duration-700 bg-brand-bg/50">
            {/* Drilldown Modal */}
            <ClientDrilldownModal 
                isOpen={drilldown.isOpen}
                onClose={() => setDrilldown(prev => ({ ...prev, isOpen: false }))}
                title={drilldown.title}
                description={drilldown.description}
                clients={drilldown.clients}
                onViewDetail={(c) => setSelectedClientForModal(c)}
            />

            {/* Client Detail Modal */}
            {selectedClientForModal && (
                <ClientDetailModal 
                    isOpen={!!selectedClientForModal}
                    onClose={() => setSelectedClientForModal(null)}
                    client={selectedClientForModal}
                    projects={projects}
                    transactions={transactions}
                    packages={packages}
                    cards={cards}
                    onEditClient={() => {
                        handleNavigation ? handleNavigation(ViewType.CLIENTS) : (window.location.hash = '#/clients');
                    }}
                    onDeleteClient={() => {}}
                    onViewReceipt={() => {}}
                    onViewInvoice={() => {}}
                    handleNavigation={handleNavigation || ((v) => window.location.hash = `/#${v.toLowerCase()}`)}
                    onRecordPayment={async () => {}}
                    onSharePortal={() => {}}
                    onDeleteProject={async () => {}}
                    showNotification={(msg: string) => console.log(msg)}
                    userProfile={profile || {} as Profile}
                    setProjects={() => {}}
                    setTransactions={() => {}}
                    setCards={() => {}}
                />
            )}

            {/* Master Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-brand-border/30 pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-brand-accent rounded-xl shadow-[0_0_20px_rgba(var(--brand-accent-rgb),0.3)]">
                            <TrendingUpIcon className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-4xl font-black text-brand-text-light tracking-tighter uppercase italic">Control Center</h1>
                    </div>
                    <p className="text-brand-text-secondary font-black text-[11px] uppercase tracking-[0.3em] pl-1">Intelligent Business Analytics & Operations</p>
                </div>
                <div className="flex-grow max-w-2xl">
                    <DashboardFilters dateRange={dateRange} onChange={setDateRange} />
                </div>
            </div>

            {/* Top Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                <StatCard
                    icon={<DollarSignIcon />}
                    title="Liquid Assets"
                    value={formatCurrency(summary.totalBalance)}
                    subtitle="Current Cash on Hand"
                    colorVariant="blue"
                    onClick={() => setActiveModal('balance')}
                />
                <StatCard
                    icon={<UsersIcon />}
                    title="Total Pengantin"
                    value={summary.activeClients.toString()}
                    subtitle="Active Client Portfolios"
                    colorVariant="pink"
                    onClick={() => setActiveModal('clients')}
                />
                <StatCard
                    icon={<CalendarIcon />}
                    title={`Sessions - ${summary.periodLabel}`}
                    value={summary.eventsInPeriod.toString()}
                    subtitle="Booked Wedding Dates"
                    colorVariant="purple"
                    onClick={() => setActiveModal('projects')}
                />
                <StatCard
                    icon={<TrendingUpIcon />}
                    title={`Revenue - ${summary.periodLabel}`}
                    value={formatCurrency(summary.incomeInPeriod)}
                    subtitle="Gross Income Received"
                    colorVariant="green"
                />
                <StatCard
                    icon={<UsersIcon />}
                    title={`Market Leads - ${summary.periodLabel}`}
                    value={summary.newLeadsInPeriod.toString()}
                    subtitle="Inbound Potential Clients"
                    colorVariant="orange"
                    onClick={() => setActiveModal('clients')}
                />
            </div>


            {/* Section 1: Marketing & Funnel */}
            <section className="space-y-6 pt-4">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-brand-surface border border-brand-border rounded-xl">
                        <UsersIcon className="w-5 h-5 text-brand-accent" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-brand-text-light tracking-tighter uppercase italic">Marketing & Funnel</h2>
                        <p className="text-[10px] text-brand-text-secondary font-black uppercase tracking-widest mt-1">Lead Generation & Acquisition Performance</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8">
                        <BookingDetailedChartWidget leads={leads} projects={projects} dateRange={dateRange} />
                    </div>
                    <div className="lg:col-span-4">
                        <ConversionFunnelWidget leads={leads} dateRange={dateRange} />
                    </div>
                    <div className="lg:col-span-4">
                        <LeadSourceWidget leads={leads} dateRange={dateRange} />
                    </div>
                    <div className="lg:col-span-4">
                        <LeadsByRegionWidget leads={leads} dateRange={dateRange} />
                    </div>
                </div>
            </section>

            {/* Section 2: Client Management */}
            <section className="space-y-6 pt-8 border-t border-brand-border/30">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-brand-surface border border-brand-border rounded-xl">
                        <MessageSquareIcon className="w-5 h-5 text-pink-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-brand-text-light tracking-tighter uppercase italic">Client Insights & Management</h2>
                        <p className="text-[10px] text-brand-text-secondary font-black uppercase tracking-widest mt-1">CRM, Interaction Trend & Retention Strategy</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-9">
                        <ClientEngagementChartWidget leads={leads} clients={clients} dateRange={dateRange} />
                    </div>
                    <div className="lg:col-span-3 flex flex-col gap-4">
                        <StatCard 
                            icon={<UsersIcon />} 
                            title="Total Klien Aktif" 
                            value={summary.activeClients.toString()} 
                            subtitle="Proyek Berjalan" 
                            colorVariant="pink" 
                            onClick={() => {
                                const activeProjectClientIds = projects.filter(p => p.status !== 'Selesai' && p.status !== 'Dibatalkan').map(p => p.clientId);
                                const filtered = clients.filter(c => activeProjectClientIds.includes(c.id));
                                handleOpenDrilldown("Klien Aktif", "Daftar klien dengan proyek yang sedang berjalan", filtered);
                            }}
                        />
                        <StatCard 
                            icon={<StarIcon />} 
                            title="Indeks Kepuasan" 
                            value={summary.avgSatisfaction.toFixed(1)} 
                            subtitle="Rating Klien" 
                            colorVariant="orange" 
                            onClick={() => {
                                // Potentially drilldown to feedback list
                                handleNavigation ? handleNavigation(ViewType.CLIENTS) : (window.location.hash = '#/clients');
                            }}
                        />
                        <StatCard 
                            icon={<PhoneIcon />} 
                            title="Follow-up Pending" 
                            value={summary.clientsWaitingFollowup.toString()} 
                            subtitle="Leads Menunggu" 
                            colorVariant="blue" 
                            onClick={() => {
                                const filtered = leads.map(l => ({ ...l, id: l.id || Math.random().toString(), isLead: true } as any));
                                handleOpenDrilldown("Follow-up Menunggu", "Daftar prospek (leads) yang belum dihubungi", filtered);
                            }}
                        />
                    </div>
                    
                    {/* Insights from Client database */}
                    <div className="lg:col-span-4">
                        <ClientStatusBreakdownWidget 
                            clients={clients} 
                            projects={projects} 
                            onDrilldown={(label, list) => handleOpenDrilldown(label, "Daftar klien berdasarkan filter pilihan", list)}
                        />
                    </div>
                    <div className="lg:col-span-4">
                        <RecentUnpaidClientsWidget 
                            clients={clients} 
                            handleNavigation={(v) => handleNavigation ? handleNavigation(v) : (window.location.hash = `/#${v.toLowerCase()}`)} 
                            onViewClient={(c) => setSelectedClientForModal(c)}
                        />
                    </div>
                    <div className="lg:col-span-4">
                         <div className="bg-brand-surface p-6 rounded-2xl shadow-lg border border-brand-border h-full flex flex-col justify-center items-center text-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="w-16 h-16 rounded-3xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform">
                                <UsersIcon className="w-8 h-8 text-brand-accent" />
                            </div>
                            <h3 className="text-xl font-black text-brand-text-light uppercase tracking-tighter italic mb-2">Database Klien Lengkap</h3>
                            <p className="text-[11px] text-brand-text-secondary font-medium px-4 mb-8">Akses seluruh riwayat pengantin, kontrak digital, dan progres timeline acara dalam satu modul terpusat.</p>
                            <button 
                                onClick={() => handleNavigation ? handleNavigation(ViewType.CLIENTS) : (window.location.hash = '#/clients')}
                                className="px-8 py-3 bg-brand-accent text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(var(--brand-accent-rgb),0.3)] hover:scale-105 transition-all"
                            >
                                Buka Modul Klien
                            </button>
                         </div>
                    </div>
                </div>
            </section>

            {/* Section 2: Operations & Workforce */}
            <section className="space-y-8 pt-8 border-t border-brand-border/30">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-brand-surface border border-brand-border rounded-xl">
                        <BriefcaseIcon className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-brand-text-light tracking-tighter uppercase italic">Operations & Workforce</h2>
                        <p className="text-[10px] text-brand-text-secondary font-black uppercase tracking-widest mt-1">Project Distribution & Team Capacity</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-4">
                        <TeamWorkloadWidget teamMembers={teamMembers} projects={projects} dateRange={dateRange} />
                    </div>
                    <div className="lg:col-span-4">
                        <PackageDistributionWidget projects={projects} dateRange={dateRange} />
                    </div>
                    <div className="lg:col-span-4">
                        <ProjectValueByTypeWidget projects={projects} dateRange={dateRange} />
                    </div>
                </div>
            </section>

            {/* Section 3: Finance & Business Health */}
            <section className="space-y-8 pt-8 border-t border-brand-border/30">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-brand-surface border border-brand-border rounded-xl">
                        <DollarSignIcon className="w-5 h-5 text-brand-success" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-brand-text-light tracking-tighter uppercase italic">Financial Performance</h2>
                        <p className="text-[10px] text-brand-text-secondary font-black uppercase tracking-widest mt-1">Cashflow, Profit Margins & Asset Health</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-9">
                        <IncomeChartWidget transactions={transactions} dateRange={dateRange} />
                    </div>
                    <div className="lg:col-span-3 flex flex-col gap-4">
                        <StatCard 
                            icon={<AlertCircleIcon />} 
                            title="Unpaid Invoices" 
                            value={summary.unpaidInvoices.toString()} 
                            subtitle="Pending Balance" 
                            colorVariant="pink" 
                        />
                         <StatCard 
                            icon={<UsersIcon />} 
                            title="Active Team" 
                            value={summary.totalTeamCount.toString()} 
                            subtitle="Workforce Strength" 
                            colorVariant="blue" 
                            onClick={() => setActiveModal('teamMembers')}
                        />
                    </div>
                    <div className="lg:col-span-4">
                        <BusinessHealthWidget projects={projects} transactions={transactions} dateRange={dateRange} />
                    </div>
                    <div className="lg:col-span-8">
                        <RecentTransactionsWidget transactions={transactions} dateRange={dateRange} />
                    </div>
                </div>
            </section>

            {/* Modals */}
            <StatCardModal
                isOpen={activeModal === 'balance'}
                onClose={() => setActiveModal(null)}
                icon={<DollarSignIcon />}
                title="Asset Distribution"
                value={formatCurrency(summary.totalBalance)}
                colorVariant="blue"
            >
                <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-3">
                        {cards.map(card => (
                            <div key={card.id} className="p-4 bg-brand-bg rounded-2xl flex justify-between items-center border border-brand-border/50">
                                <div>
                                    <p className="font-black text-[10px] uppercase tracking-widest text-brand-text-secondary">{card.bankName}</p>
                                    <p className="font-bold text-brand-text-light">{card.id !== 'CARD_CASH' ? `**** ${card.lastFourDigits}` : 'Physical Cash'}</p>
                                </div>
                                <p className="font-black text-brand-accent">{formatCurrency(card.balance)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </StatCardModal>

            <StatCardModal
                isOpen={activeModal === 'projects'}
                onClose={() => setActiveModal(null)}
                icon={<CalendarIcon />}
                title="Active Sessions"
                value={summary.activeProjects.toString()}
                colorVariant="purple"
            >
                <div className="space-y-3">
                    {projects.filter(p => p.status !== 'Selesai' && p.status !== 'Dibatalkan').map(project => (
                        <div key={project.id} className="p-4 bg-brand-bg rounded-2xl border border-brand-border/50 hover:border-brand-accent/50 transition-all cursor-pointer" onClick={() => { setActiveModal(null); handleNavigation(ViewType.PROJECTS); }}>
                            <div className="flex justify-between items-start mb-2">
                                <p className="font-black text-xs uppercase tracking-tight text-brand-text-light">{project.projectName}</p>
                                <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg ${getStatusClass(project.status, projectStatusConfig)}`}>{project.status}</span>
                            </div>
                            <p className="text-[10px] text-brand-text-secondary font-bold uppercase">{project.clientName}</p>
                        </div>
                    ))}
                </div>
            </StatCardModal>

            <StatCardModal
                isOpen={activeModal === 'teamMembers'}
                onClose={() => setActiveModal(null)}
                icon={<BriefcaseIcon />}
                title="Workforce Directory"
                value={summary.totalTeamCount.toString()}
                colorVariant="orange"
            >
                <div className="space-y-3">
                    {teamMembers.map(member => (
                        <div key={member.id} className="p-4 bg-brand-bg rounded-2xl border border-brand-border/50 flex justify-between items-center">
                            <div>
                                <p className="font-black text-xs uppercase tracking-tight text-brand-text-light">{member.name}</p>
                                <p className="text-[10px] text-brand-text-secondary font-bold uppercase">{member.role}</p>
                            </div>
                            <span className="text-[10px] font-black p-2 bg-brand-surface rounded-xl text-brand-accent">{member.category}</span>
                        </div>
                    ))}
                </div>
            </StatCardModal>

            {/* Other generic modal */}
            <Modal isOpen={!!activeModal && !['balance', 'projects', 'teamMembers'].includes(activeModal)} onClose={() => setActiveModal(null)} title={activeModal ? modalTitles[activeModal] : ''} size="2xl">
                <div className="p-4 text-center">
                    <p className="text-xs text-brand-text-secondary font-bold uppercase">Detail info available in module pages</p>
                </div>
            </Modal>
        </div>
    );
};

export default Dashboard;
