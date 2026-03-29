import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

const FreelancerPortal: React.FC = () => {
    const { accessId } = useParams<{ accessId: string }>();

    useEffect(() => {
        console.log("Page Loaded: Freelancer Portal", accessId);
    }, [accessId]);

    return (
        <div className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Freelancer Portal</h1>
            <p className="text-brand-text-secondary">Welcome to the Freelancer Portal (Access ID: {accessId})</p>
            {/* Implementation details for freelancer view */}
        </div>
    );
};

export default FreelancerPortal;
