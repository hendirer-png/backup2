import React from 'react';
import { Outlet, Link, useParams } from 'react-router-dom';
import { useApp } from '@/app/AppContext';
import { cleanPhoneNumber } from '@/constants';
import { getProfile } from '@/services/profile';
import { Profile } from '@/types';

export const PublicLayout: React.FC = () => {
    const { vendorId } = useParams<{ vendorId: string }>();
    const { currentUser } = useApp();
    const [profile, setProfile] = React.useState<Profile | null>(null);

    React.useEffect(() => {
        const loadProfile = async () => {
            if (profile && profile.id === vendorId) return; // Optional check if vendorId is valid ID
            try {
                const data = await getProfile(vendorId);
                // Only update if data is different to avoid unnecessary re-renders
                if (data && (!profile || data.id !== profile.id)) {
                    setProfile(data);
                }
            } catch (err) {
                console.error("Failed to load public profile:", err);
            }
        };
        loadProfile();
    }, [vendorId, profile?.id]);

    const userProfile = profile || (currentUser as unknown as Profile); // Fallback to currentUser if typed correctly or available

    return (
        <div className="min-h-screen bg-[#FAF9F6] selection:bg-[#B69255]/20 font-['Manrope',_sans-serif]">
            <nav className="sticky top-0 z-50 bg-[#FAF9F6]/80 backdrop-blur-xl border-b border-black/5 py-4 px-6 md:px-12 flex justify-between items-center transition-all duration-300">
                <div className="flex items-center gap-3">
                    <Link to="/" className="flex items-center gap-3">
                        {userProfile?.logoBase64 ? (
                            <img src={userProfile.logoBase64} alt="Logo" className="h-8 md:h-10 object-contain" />
                        ) : (
                            <span className="text-xl font-black tracking-tighter uppercase">{userProfile?.companyName || 'VENA'}</span>
                        )}
                    </Link>
                </div>
                <div className="flex items-center gap-6">
                    <Link to={vendorId ? `/public-packages/${vendorId}` : "/public-packages"} className="text-xs md:text-sm font-black tracking-widest uppercase hover:text-[#B69255] transition-colors">
                        Packages
                    </Link>
                    <Link to={vendorId ? `/public-booking/${vendorId}` : "/public-booking"} className="text-xs md:text-sm font-black tracking-widest uppercase hover:text-[#B69255] transition-colors font-bold text-[#B69255]">
                        Book
                    </Link>
                    {userProfile?.phone && (
                        <a
                            href={`https://wa.me/${cleanPhoneNumber(userProfile.phone)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs md:text-sm font-black tracking-widest uppercase hover:text-[#B69255] transition-colors"
                        >
                            Contact
                        </a>
                    )}
                </div>
            </nav>

            <main>
                <Outlet />
            </main>

            <footer className="mt-24 pt-24 pb-12 border-t border-black/5 px-6 md:px-12">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
                    <div className="lg:col-span-2">
                        <div className="mb-8">
                            <span className="text-xl font-black tracking-tighter uppercase">{userProfile?.companyName || 'VENA'}</span>
                        </div>
                        <p className="text-[#666666] font-medium leading-relaxed max-w-sm">
                            Membantu Anda mengabadikan setiap detik berharga dengan kualitas terbaik dan dedikasi penuh.
                        </p>
                    </div>
                </div>
                <div className="text-center text-[10px] font-black tracking-[0.2em] uppercase text-[#666666]/50">
                    &copy; {new Date().getFullYear()} {userProfile?.companyName || 'VENA'}. All Rights Reserved.
                </div>
            </footer>
        </div>
    );
};
