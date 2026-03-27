import React, { useState } from 'react';
import { EyeIcon, PencilIcon, Trash2Icon, PlusIcon, ArrowUpIcon, ArrowDownIcon } from '@/constants';
import { ClientStatus } from '@/types';
import { ExtendedClient } from '@/features/clients/types';
import { formatCurrency, getPaymentStatusClass } from '@/features/clients/utils/clients.utils';

interface ClientActiveListProps {
    clients: ExtendedClient[];
    onViewDetail: (client: ExtendedClient) => void;
    onEditClient: (client: ExtendedClient) => void;
    onDeleteClient: (clientId: string) => void;
    onAddProject: (client: ExtendedClient) => void;
}

export const ClientActiveList: React.FC<ClientActiveListProps> = ({
    clients,
    onViewDetail,
    onEditClient,
    onDeleteClient,
    onAddProject
}) => {
    const [isOpen, setIsOpen] = useState(true);
    const activeClients = clients.filter(c => c.status === ClientStatus.ACTIVE);

    return (
        <div className="bg-brand-surface rounded-2xl shadow-lg border border-brand-border">
            <div className="p-3 md:p-4 border-b border-brand-border">
                <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center">
                    <h3 className="text-sm md:text-base font-semibold text-brand-text-light">Pengantin Aktif ({activeClients.length})</h3>
                    {isOpen ? <ArrowUpIcon className="w-4 h-4 md:w-5 md:h-5 text-brand-text-secondary" /> : <ArrowDownIcon className="w-4 h-4 md:w-5 md:h-5 text-brand-text-secondary" />}
                </button>
            </div>
            {isOpen && (
                <>
                    {/* Mobile cards */}
                    <div className="md:hidden p-3 space-y-2">
                        {activeClients.map(client => (
                            <div key={client.id} className="rounded-xl bg-white/5 border border-brand-border p-3 shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm text-brand-text-light leading-tight truncate">{client.name}</p>
                                        <p className="text-[10px] text-brand-text-secondary mt-0.5 truncate">{client.email}</p>
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        {client.overallPaymentStatus && (
                                            <span className={`px-1.5 py-0.5 text-[9px] font-semibold rounded-full ${getPaymentStatusClass(client.overallPaymentStatus)}`}>{client.overallPaymentStatus}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-2 grid grid-cols-2 gap-y-1.5 text-xs">
                                    <span className="text-brand-text-secondary text-[10px]">Total Nilai</span>
                                    <span className="text-right font-semibold text-xs">{formatCurrency(client.totalProjectValue)}</span>
                                    <span className="text-brand-text-secondary text-[10px]">Sisa Tagihan</span>
                                    <span className="text-right font-bold text-xs text-brand-danger">{formatCurrency(client.balanceDue)}</span>
                                    <span className="text-brand-text-secondary text-[10px]">Acara Pernikahan Terbaru</span>
                                    <span className="text-right text-xs truncate">{client.mostRecentProject?.projectName || '-'}</span>
                                </div>
                                <div className="mt-2 pt-2 border-t border-brand-border/50 flex justify-end gap-1.5">
                                    <button onClick={() => onViewDetail(client)} className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors" title="Detail"><EyeIcon className="w-3 h-3 text-white" /></button>
                                    <button onClick={() => onEditClient(client)} className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors" title="Edit"><PencilIcon className="w-3 h-3 text-white" /></button>
                                    <button onClick={() => onDeleteClient(client.id)} className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-red-600 hover:bg-red-700 transition-colors" title="Hapus"><Trash2Icon className="w-3 h-3 text-white" /></button>
                                    <button onClick={() => onAddProject(client)} className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors" title="Tambah Acara"><PlusIcon className="w-3 h-3 text-white" /></button>
                                </div>
                            </div>
                        ))}
                        {activeClients.length === 0 && (
                            <p className="text-center py-8 text-xs text-brand-text-secondary">Tidak ada pengantin aktif.</p>
                        )}
                    </div>
                    {/* Desktop table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-brand-text-secondary uppercase">
                                <tr>
                                    <th className="px-6 py-4 font-medium tracking-wider">Pengantin</th>
                                    <th className="px-6 py-4 font-medium tracking-wider">Total Package</th>
                                    <th className="px-6 py-4 font-medium tracking-wider">Sisa Tagihan</th>
                                    <th className="px-6 py-4 font-medium tracking-wider">Acara Pernikahan Terbaru</th>
                                    <th className="px-6 py-4 font-medium tracking-wider text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-border">
                                {activeClients.map(client => (
                                    <tr key={client.id} className="hover:bg-brand-bg transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-brand-text-light">{client.name}</p>
                                            <p className="text-xs text-brand-text-secondary">{client.email}</p>
                                        </td>
                                        <td className="px-6 py-4 font-semibold">{formatCurrency(client.totalProjectValue)}</td>
                                        <td className="px-6 py-4 font-semibold text-red-400">{formatCurrency(client.balanceDue)}</td>
                                        <td className="px-6 py-4">
                                            <p>{client.mostRecentProject?.projectName || '-'}</p>
                                            {client.overallPaymentStatus && (
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusClass(client.overallPaymentStatus)}`}>
                                                    {client.overallPaymentStatus}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center space-x-1">
                                                <button onClick={() => onViewDetail(client)} className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors" title="Detail"><EyeIcon className="w-5 h-5 text-white" /></button>
                                                <button onClick={() => onEditClient(client)} className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors" title="Edit"><PencilIcon className="w-5 h-5 text-white" /></button>
                                                <button onClick={() => onDeleteClient(client.id)} className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-red-600 hover:bg-red-700 transition-colors" title="Hapus"><Trash2Icon className="w-5 h-5 text-white" /></button>
                                                <button onClick={() => onAddProject(client)} className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors" title="Tambah Acara"><PlusIcon className="w-5 h-5 text-white" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};
