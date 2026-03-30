import { useAuth } from '@/components/auth/AuthContext';
import AdsterraPopUnder from './AdsterraPopUnder';
import PopAds from './PopAds';

const AdsManager = () => {
    const { subscriptionStatus, loading } = useAuth();

    if (loading) return null;
    if (subscriptionStatus === "pro" || subscriptionStatus === "active") return null;

    return (
        <>
            <AdsterraPopUnder />
            <PopAds />
        </>
    );
};

export default AdsManager;
