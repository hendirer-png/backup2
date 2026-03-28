import React from 'react';
import { ProjectsProps } from '@/features/projects/types/project.types';
import ProjectsPageFeature from '@/features/projects/ProjectsPage';

export const Projects: React.FC<ProjectsProps> = (props) => {
    return <ProjectsPageFeature {...props} />;
};

export type { ProjectsProps };
