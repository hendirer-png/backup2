import { Lead, LeadStatus, ContactChannel, Client, Project, Package, AddOn, Transaction, Card, FinancialPocket, PromoCode, Profile, ViewType, NavigationAction } from '@/types';

export interface LeadFormData {
    name: string;
    contactChannel: ContactChannel;
    location: string;
    address: string;
    whatsapp: string;
    notes: string;
    date: string;
    status: LeadStatus;
}

export interface ConvertLeadFormData {
    clientName: string;
    email: string;
    phone: string;
    whatsapp: string;
    instagram: string;
    clientType: string;
    projectName: string;
    projectType: string;
    location: string;
    address: string;
    date: string;
    packageId: string;
    selectedAddOnIds: string[];
    dp: string | number;
    dpDestinationCardId: string;
    notes: string;
    promoCodeId: string;
    unitPrice?: number;
    durationSelection?: string;
}

export interface LeadsPageProps {
    showNotification?: (message: string) => void;
    handleNavigation?: (view: ViewType, action?: NavigationAction) => void;
}


