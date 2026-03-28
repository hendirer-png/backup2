import React from 'react';
import { SettingsPage as SettingsFeature } from '@/features/settings';
import { Profile, Transaction, Project, Package, User } from '@/types';

import { useApp } from "@/app/AppContext";

export interface SettingsPageProps {
    currentUser?: User | null;
}


const SettingsPage: React.FC<SettingsPageProps> = (props) => {
    const { currentUser: contextUser } = useApp();
    const currentUser = props.currentUser !== undefined ? props.currentUser : contextUser;
    
    return <SettingsFeature currentUser={currentUser} />;
};


export default SettingsPage;
