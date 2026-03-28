import React from 'react';
import { Client, Project, Package, Transaction, Profile, Card, ViewType, NavigationAction, PromoCode, FinancialPocket, ClientFeedback, Contract } from '@/types';
import { ClientsPage as ClientsPageFeature } from '@/features/clients/components/ClientsPage';

import { useApp } from "@/app/AppContext";
import { useUIStore } from '@/store/uiStore';

interface ClientsProps {
    showNotification?: (message: string) => void;
    initialAction?: any;
    setInitialAction?: (val: any) => void;
    handleNavigation?: (view: ViewType, action?: NavigationAction) => void;
    addNotification?: (notif: any) => void;
}



const ClientsPage: React.FC<ClientsProps> = (props) => {
    const { 
        showNotification: contextShowNotification,
        initialAction: contextInitialAction,
        setInitialAction: contextSetInitialAction,
    } = useApp();
    const { setActiveView } = useUIStore();

    const mergedProps = {
        ...props,
        showNotification: props.showNotification || contextShowNotification,
        initialAction: props.initialAction || contextInitialAction,
        setInitialAction: props.setInitialAction || contextSetInitialAction,
        handleNavigation: props.handleNavigation || ((view: ViewType, action?: NavigationAction) => {
            setActiveView(view);
            if (action) {
                contextSetInitialAction(action);
            }
            const pathMap: any = {
                [ViewType.HOMEPAGE]: "home",
                [ViewType.DASHBOARD]: "dashboard",
            };
            const newPath = pathMap[view] || view.toLowerCase().replace(/ /g, "-");
            window.location.hash = `#/${newPath}`;
        }),
        addNotification: props.addNotification || (() => {}), // Fallback
    };

    return <ClientsPageFeature {...mergedProps as any} />;
};


export default ClientsPage;
