import React from 'react';
import { PaymentStatus, ClientType } from '@/types';

interface ClientFilterBarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    searchQuery: string;
    onSearchChange: (val: string) => void;
    statusFilter: string;
    onStatusFilterChange: (val: string) => void;
    typeFilter: string;
    onTypeFilterChange: (val: string) => void;
    startDate: string;
    onStartDateChange: (val: string) => void;
    endDate: string;
    onEndDateChange: (val: string) => void;
    sortConfig: { key: string; direction: 'asc' | 'desc' } | null;
    onSortChange: (config: { key: string; direction: 'asc' | 'desc' } | null) => void;
}

export const ClientFilterBar: React.FC<ClientFilterBarProps> = ({
    activeTab, onTabChange,
    searchQuery, onSearchChange,
    statusFilter, onStatusFilterChange,
    typeFilter, onTypeFilterChange,
    startDate, onStartDateChange,
    endDate, onEndDateChange,
}) => {
    const tabConfigs = [
        { id: 'all', label: 'Semua', activeColor: 'bg-blue-600 text-white shadow-md shadow-blue-100', inactiveColor: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
        { id: 'inactive', label: 'Tidak Aktif', activeColor: 'bg-slate-600 text-white shadow-md shadow-slate-100', inactiveColor: 'bg-slate-100 text-slate-500 hover:bg-slate-200' },
        { id: 'unpaid', label: 'Belum Lunas', activeColor: 'bg-rose-600 text-white shadow-md shadow-rose-100', inactiveColor: 'bg-rose-50 text-rose-600 hover:bg-rose-100' },
    ];

    return (
        <div className="bg-white p-4 md:p-5 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
            <div className="flex flex-wrap items-center gap-4">
                {/* Tabs */}
                <div className="flex gap-1 bg-slate-50 p-1 rounded-xl shrink-0">
                    {tabConfigs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`px-4 py-2 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                                activeTab === tab.id
                                    ? tab.activeColor
                                    : `text-slate-500 hover:bg-slate-100 hover:text-slate-700`
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Search Bar */}
                <div className="relative flex-grow min-w-[200px] lg:max-w-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="search"
                        value={searchQuery}
                        onChange={e => onSearchChange(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none text-xs font-bold text-slate-700 transition-all placeholder:text-slate-400"
                        placeholder="Cari pengantin..."
                    />
                </div>

                {/* Vertical Divider (Desktop) */}
                <div className="hidden lg:block w-px h-8 bg-slate-200"></div>

                {/* Date Filters */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="text-[9px] font-black uppercase text-slate-400">Dari</span>
                        <input
                            type="date"
                            value={startDate}
                            onChange={e => onStartDateChange(e.target.value)}
                            className="bg-transparent border-none p-0 text-xs font-bold text-slate-700 focus:ring-0 outline-none w-[105px]"
                        />
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="text-[9px] font-black uppercase text-slate-400">Ke</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={e => onEndDateChange(e.target.value)}
                            className="bg-transparent border-none p-0 text-xs font-bold text-slate-700 focus:ring-0 outline-none w-[105px]"
                        />
                    </div>
                </div>

                {/* Select Filters */}
                <div className="flex items-center gap-2 flex-grow sm:flex-grow-0">
                    <select
                        value={statusFilter}
                        onChange={e => onStatusFilterChange(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer w-full sm:w-40"
                    >
                        <option value="Semua Status">Semua Status</option>
                        {Object.values(PaymentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    <select
                        value={typeFilter}
                        onChange={e => onTypeFilterChange(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer w-full sm:w-40"
                    >
                        <option value="Semua Tipe">Semua Tipe</option>
                        {Object.values(ClientType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
            </div>
        </div>
    );
};
