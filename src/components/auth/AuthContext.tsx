import { createContext, useContext, useEffect, useState } from "react";
import { authApi, setToken, clearToken } from "@/lib/apiClient";

interface AppUser {
  id: string;
  email: string;
  full_name: string;
  business_name?: string;
  phone?: string;
  address?: string;
  avatar_url?: string;
  subscription_status: string;
  whatsapp_connected: boolean;
  created_at: string;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  subscriptionStatus: string;
  isTrialExpired: boolean;
  signOut: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  subscriptionStatus: "free",
  isTrialExpired: false,
  signOut: () => {},
  refreshUser: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState("free");
  const [isTrialExpired, setIsTrialExpired] = useState(false);

  const applyUser = (u: AppUser) => {
    setUser(u);
    setSubscriptionStatus(u.subscription_status || "free");
    if (u.subscription_status === "free") {
      const diffDays = (Date.now() - new Date(u.created_at).getTime()) / (1000 * 60 * 60 * 24);
      setIsTrialExpired(diffDays > 7);
    } else {
      setIsTrialExpired(false);
    }
    localStorage.setItem("rc_user", JSON.stringify(u));
  };

  const refreshUser = async () => {
    try {
      const { user: u } = await authApi.me();
      applyUser(u);
    } catch {
      clearToken();
      setUser(null);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("rc_token");
    if (!token) {
      setLoading(false);
      return;
    }
    // Intentar cargar usuario desde cache primero
    const cached = localStorage.getItem("rc_user");
    if (cached) {
      try { applyUser(JSON.parse(cached)); } catch {}
    }
    // Luego verificar con el servidor
    refreshUser().finally(() => setLoading(false));
  }, []);

  const signOut = () => {
    clearToken();
    setUser(null);
    setSubscriptionStatus("free");
    setIsTrialExpired(false);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, loading, subscriptionStatus, isTrialExpired, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
