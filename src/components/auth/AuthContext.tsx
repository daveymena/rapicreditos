import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

interface AuthContextType {
    session: Session | null;
    user: User | null;
    loading: boolean;
    subscriptionStatus: string;
    isTrialExpired: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    loading: true,
    subscriptionStatus: "free",
    isTrialExpired: false,
    signOut: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [subscriptionStatus, setSubscriptionStatus] = useState("free");
    const [isTrialExpired, setIsTrialExpired] = useState(false);

    const loadProfile = async (userId: string) => {
        try {
            const { data } = await supabase
                .from("profiles")
                .select("subscription_status, created_at")
                .eq("user_id", userId)
                .single();

            if (data) {
                setSubscriptionStatus(data.subscription_status || "free");

                // Calcular si el trial de 7 días expiró
                if (data.subscription_status === "free") {
                    const createdAt = new Date(data.created_at);
                    const now = new Date();
                    const diffDays = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
                    setIsTrialExpired(diffDays > 7);
                } else {
                    setIsTrialExpired(false);
                }
            }
        } catch (error) {
            console.error("Error loading profile:", error);
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setSession(session);
                setUser(session?.user ?? null);
                if (session?.user) await loadProfile(session.user.id);
            } catch (error) {
                console.error("Error checking auth session:", error);
            } finally {
                setLoading(false);
            }
        };

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) await loadProfile(session.user.id);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ session, user, loading, subscriptionStatus, isTrialExpired, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
