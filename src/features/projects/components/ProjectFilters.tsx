import React from 'react';
import { 
    CalendarIcon, 
    ListIcon, 
    LayoutGridIcon 
} from 'lucide-react';
import { ProjectStatusConfig } from '@/features/projects/types/project.types';

interface ProjectFiltersProps {
    searchTerm: string;
    setSearchTerm: (val: string) => void;
    dateFrom: string;
    setDateFrom: (val: string) => void;
    dateTo: string;
    setDateTo: (val: string) => void;
    statusFilter: string;
    setStatusFilter: (val: string) => void;
    viewMode: 'list' | 'kanban';
    setViewMode: (mode: 'list' | 'kanban') => void;
    projectStatusConfig: ProjectStatusConfig[];
}

const ProjectFilters: React.FC<ProjectFiltersProps> = ({
    searchTerm,
    setSearchTerm,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    statusFilter,
    setStatusFilter,
    viewMode,
    setViewMode,
    projectStatusConfig
}) => {
    return (
        <div className="bg-brand-surface p-2 rounded-[1.25rem] shadow-xl border border-brand-border flex flex-row items-center gap-2 overflow-x-auto scrollbar-none">
            {/* Search Input */}
            <div className="relative flex-grow min-w-[200px]">
                <input 
                    type="search" 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                    className="w-full h-11 pl-4 pr-10 rounded-xl border border-brand-border bg-brand-bg/50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-all placeholder:text-brand-text-secondary/50" 
                    placeholder="Cari acara atau pengantin..." 
                />
            </div>

            {/* Date Range */}
            <div className="flex items-center gap-1.5 flex-shrink-0 bg-brand-bg/30 p-1 rounded-xl border border-brand-border/50">
                <div className="flex items-center px-3 py-1.5 bg-brand-surface rounded-lg border border-brand-border h-9">
                    <CalendarIcon className="w-3.5 h-3.5 text-brand-accent mr-2" />
                    <input 
                        type="date" 
                        value={dateFrom} 
                        onChange={e => setDateFrom(e.target.value)} 
                        className="bg-transparent text-[11px] font-black uppercase text-brand-text-light focus:outline-none w-[105px]" 
                    />
                </div>
                <span className="text-brand-text-secondary font-black text-xs">–</span>
                <div className="flex items-center px-3 py-1.5 bg-brand-surface rounded-lg border border-brand-border h-9">
                    <CalendarIcon className="w-3.5 h-3.5 text-brand-accent mr-2" />
                    <input 
                        type="date" 
                        value={dateTo} 
                        onChange={e => setDateTo(e.target.value)} 
                        className="bg-transparent text-[11px] font-black uppercase text-brand-text-light focus:outline-none w-[105px]" 
                    />
                </div>
            </div>

            {/* Status Filter */}
            <select 
                value={statusFilter} 
                onChange={e => setStatusFilter(e.target.value)} 
                className="h-11 px-4 rounded-xl border border-brand-border bg-brand-bg/50 text-sm font-bold text-brand-text-primary focus:outline-none focus:ring-2 focus:ring-brand-accent/50 min-w-[160px] appearance-none cursor-pointer hover:bg-brand-input transition-colors"
            >
                <option value="all">Semua Status</option>
                {projectStatusConfig.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>

            {/* View Mode Toggle */}
            <div className="flex-shrink-0 p-1 bg-brand-bg/50 rounded-xl border border-brand-border flex items-center h-11">
                <button 
                    onClick={() => setViewMode('list')} 
                    className={`px-3 py-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-brand-accent text-white shadow-lg shadow-brand-accent/20' : 'text-brand-text-secondary hover:text-brand-text-light'}`}
                    title="List View"
                >
                    <ListIcon className="w-4 h-4" />
                </button>
                <button 
                    onClick={() => setViewMode('kanban')} 
                    className={`px-3 py-2 rounded-lg transition-all ${viewMode === 'kanban' ? 'bg-brand-accent text-white shadow-lg shadow-brand-accent/20' : 'text-brand-text-secondary hover:text-brand-text-light'}`}
                    title="Kanban View"
                >
                    <LayoutGridIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default ProjectFilters;
