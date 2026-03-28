import { Profile, Transaction, Project, User, ViewType, Package, ChatTemplate, ChecklistTemplate, ProjectStatusConfig, SubStatusConfig } from '@/types';

export interface SettingsPageProps {
    currentUser: User | null;
}


export interface UserFormData {
    fullName: string;
    email: string;
    password?: string;
    confirmPassword?: string;
    role: User['role'];
    permissions: ViewType[];
}

export interface TemplateVariable {
    label: string;
    desc: string;
}

export interface ShareTemplateConfig {
    readonly key: keyof Profile;
    readonly label: string;
    readonly desc: string;
    readonly icon: string;
    readonly color: string;
    readonly placeholder: string;
    readonly defaultValue: string;
    readonly variables: readonly TemplateVariable[];
}
