import React from 'react';
import { CalendarIcon, ChevronRightIcon } from '@/constants';

export type DateRangeType = 'all' | 'today' | 'last7' | 'last30' | 'thisMonth' | 'thisYear' | 'custom';

export interface DateRange {
    type: DateRangeType;
    startDate: Date | null;
    endDate: Date | null;
}

interface DashboardFiltersProps {
    dateRange: DateRange;
    onChange: (range: DateRange) => void;
}

const DashboardFilters: React.FC<DashboardFiltersProps> = ({ dateRange, onChange }) => {
    const presets: { label: string; value: DateRangeType }[] = [
        { label: 'Semua Waktu', value: 'all' },
        { label: 'Hari Ini', value: 'today' },
        { label: '7 Hari Terakhir', value: 'last7' },
        { label: '30 Hari Terakhir', value: 'last30' },
        { label: 'Bulan Ini', value: 'thisMonth' },
        { label: 'Tahun Ini', value: 'thisYear' },
        { label: 'Kustom', value: 'custom' },
    ];

    const handlePresetClick = (type: DateRangeType) => {
        const now = new Date();
        let start: Date | null = null;
        let end: Date | null = new Date();

        if (type === 'custom') {
            onChange({ type: 'custom', startDate: dateRange.startDate || now, endDate: dateRange.endDate || now });
            return;
        }

        switch (type) {
            case 'today':
                start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'last7':
                start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'last30':
                start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case 'thisMonth':
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'thisYear':
                start = new Date(now.getFullYear(), 0, 1);
                break;
            case 'all':
            default:
                start = null;
                end = null;
                break;
        }

        onChange({ type, startDate: start, endDate: end });
    };

    const handleDateChange = (field: 'startDate' | 'endDate', val: string) => {
        const date = new Date(val);
        onChange({
            ...dateRange,
            [field]: date
        });
    };

    return (
        <div className="bg-brand-surface p-2 rounded-2xl shadow-lg border border-brand-border flex flex-col lg:flex-row items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3 px-3">
                <div className="p-2 bg-brand-accent/10 rounded-xl text-brand-accent">
                    <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-sm font-black text-brand-text-light uppercase tracking-tight">Filter Periode</h3>
                    <p className="text-[10px] text-brand-text-secondary font-black uppercase tracking-tighter">Analisa statistik secara mendalam</p>
                </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 p-1 bg-brand-bg rounded-xl w-full lg:w-auto">
                <div className="flex flex-wrap items-center gap-1">
                    {presets.map(preset => (
                        <button
                            key={preset.value}
                            onClick={() => handlePresetClick(preset.value)}
                            className={`px-3 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                                dateRange.type === preset.value 
                                ? 'bg-brand-accent text-white shadow-lg' 
                                : 'text-brand-text-secondary hover:text-brand-text-light hover:bg-white/5'
                            }`}
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>

                {dateRange.type === 'custom' && (
                    <div className="flex items-center gap-2 px-2 py-1 bg-brand-surface/50 rounded-lg border border-brand-border/30 animate-in fade-in slide-in-from-right-2 duration-300">
                        <input
                            type="date"
                            value={dateRange.startDate ? dateRange.startDate.toISOString().split('T')[0] : ''}
                            onChange={(e) => handleDateChange('startDate', e.target.value)}
                            className="bg-transparent text-[11px] font-bold text-brand-accent focus:outline-none [color-scheme:dark]"
                        />
                        <span className="text-brand-text-secondary font-black text-[10px]">TO</span>
                        <input
                            type="date"
                            value={dateRange.endDate ? dateRange.endDate.toISOString().split('T')[0] : ''}
                            onChange={(e) => handleDateChange('endDate', e.target.value)}
                            className="bg-transparent text-[11px] font-bold text-brand-accent focus:outline-none [color-scheme:dark]"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardFilters;
