import React from 'react';
import { WhatsappIcon } from '@/constants';
import { ExtendedClient } from '@/features/clients/types';
import { formatCurrency } from '@/features/clients/utils/clients.utils';

interface ClientUnpaidListProps {
    clients: ExtendedClient[];
    onViewDetail: (client: ExtendedClient) => void;
}

export const ClientUnpaidList: React.FC<ClientUnpaidListProps> = ({
    clients,
    onViewDetail
}) => {
    return (
        <div className="bg-white rounded-3xl shadow-xl border border-brand-border overflow-hidden">
            <div className="p-6 border-b border-brand-border bg-gradient-to-r from-red-50/50 to-transparent">
                <h3 className="font-bold text-brand-text-primary flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    Tagihan Belum Lunas ({clients.length})
                </h3>
            </div>
            
            <div className="divide-y divide-brand-border max-h-[600px] overflow-y-auto custom-scrollbar">
                {clients.map(client => (
                    <div 
                        key={client.id} 
                        onClick={() => onViewDetail(client)}
                        className="p-5 hover:bg-red-50/30 transition-all cursor-pointer group"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="font-bold text-brand-text-primary group-hover:text-blue-600 transition-colors uppercase text-sm">
                                    {client.name}
                                </h4>
                                <p className="text-xs text-brand-text-secondary">
                                    {client.mostRecentProject?.projectName || 'No Project'}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-black text-red-600">
                                    {formatCurrency(client.balanceDue)}
                                </p>
                                <p className="text-[10px] text-brand-text-secondary uppercase font-bold tracking-wider">
                                    Sisa Tagihan
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-3">
                            <div className="flex -space-x-2">
                                <div className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-blue-600">
                                    {client.name.charAt(0)}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all shadow-sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // Logic for quick WhatsApp would go here
                                    }}
                                >
                                    <WhatsappIcon className="w-4 h-4" />
                                </button>
                                <div className="px-2 py-1 rounded bg-gray-100 text-[10px] font-bold text-gray-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    DETAIL
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                
                {clients.length === 0 && (
                    <div className="p-10 text-center space-y-3">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        </div>
                        <h4 className="font-bold text-brand-text-primary">Semua Lunas!</h4>
                        <p className="text-sm text-brand-text-secondary">Tidak ada tagihan tertunda saat ini.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
