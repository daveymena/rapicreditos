import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  DollarSign,
  Calculator,
  User,
  LogOut,
  Banknote,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  CreditCard,
  HelpCircle,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthContext";
import { useToast } from "@/hooks/use-toast";
import SupportChat from "@/components/support/SupportChat";
import AdSlot from "@/components/ads/AdSlot";
import AdPopup from "@/components/ads/AdPopup";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const AdSpace = ({ position, isTrialExpired }: { position: string, isTrialExpired: boolean }) => {
  if (position === "sidebar") {
    return (
      <div className="mx-3 mt-auto mb-4">
        <AdSlot slot="sidebar" className="mx-auto" />
      </div>
    );
  }
  if (position === "banner") {
    return (
      <div className="w-full flex justify-center px-4">
        <AdSlot slot="banner-top" />
      </div>
    );
  }
  if (position === "footer") {
    return (
      <div className="w-full flex justify-center mt-10 mb-24 lg:mb-4">
        <AdSlot slot="banner-bottom" />
      </div>
    );
  }
  if (position === "fixed-bottom") {
    if (!isTrialExpired) return null;
    return (
      <div className="fixed bottom-24 left-0 w-full z-40 bg-background/90 backdrop-blur-sm border-t border-border flex justify-center py-1 lg:hidden">
        <AdSlot slot="mobile-bottom" />
      </div>
    );
  }
  return null;
};

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const { user, signOut, subscriptionStatus, isTrialExpired } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (subscriptionStatus === "pro" || subscriptionStatus === "active") {
      setIsPro(true);
    }
  }, [subscriptionStatus]);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleLogout = () => {
    signOut();
    toast({ title: "Sesión cerrada", description: "Has cerrado sesión correctamente." });
  };

  // Íconos principales para la barra inferior móvil
  const mobileNavItems = [
    { icon: LayoutDashboard, label: "Inicio", path: "/dashboard" },
    { icon: Users, label: "Clientes", path: "/clients" },
    { icon: DollarSign, label: "Préstamos", path: "/loans" },
    { icon: MessageSquare, label: "WhatsApp", path: "/whatsapp" },
    { icon: User, label: "Perfil", path: "/profile" },
  ];

  // Íconos para el sidebar de escritorio
  const sideItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Users, label: "Clientes", path: "/clients" },
    { icon: DollarSign, label: "Préstamos", path: "/loans" },
    { icon: Calculator, label: "Simulador", path: "/simulator" },
    { icon: MessageSquare, label: "WhatsApp", path: "/whatsapp" },
    { icon: CreditCard, label: "Planes y Precios", path: "/pricing" },
    { icon: User, label: "Mi Perfil", path: "/profile" },
    { icon: HelpCircle, label: "Ayuda", path: "/help" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row overflow-hidden relative">
      
      {/* Mobile Bottom Navigation Bar (EL ÚNICO MENÚ EN MÓVIL) */}
      <nav className="lg:hidden fixed bottom-6 left-6 right-6 h-16 bg-card/70 backdrop-blur-3xl border border-white/10 rounded-[2rem] z-[100] flex items-center justify-around px-2 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
        {mobileNavItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center gap-1 transition-all duration-300 relative px-4 py-2 rounded-2xl",
              isActive(item.path) ? "text-primary" : "text-muted-foreground"
            )}
          >
            {isActive(item.path) && (
              <motion.div
                layoutId="mobile-nav-active"
                className="absolute inset-x-1 inset-y-1 bg-primary/10 rounded-2xl -z-10"
                transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
              />
            )}
            <item.icon className={cn("w-6 h-6", isActive(item.path) && "scale-110")} />
            <span className="text-[10px] font-bold">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Sidebar - SOLO VISIBLE EN ESCRITORIO O PANTALLAS GRANDES */}
      <motion.aside
        className={cn(
          "hidden lg:flex sticky top-0 left-0 h-screen z-[120]",
          "bg-card/40 backdrop-blur-2xl border-r border-border/50",
          "flex-col group/sidebar transition-all duration-500 ease-in-out"
        )}
        animate={{
          width: isSidebarOpen ? "280px" : "90px",
        }}
      >
        {/* Toggle Button (Desktop Only) */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={cn(
            "absolute -right-4 top-10 w-8 h-8 rounded-full border border-border/50 bg-card text-foreground flex items-center justify-center shadow-xl hover:scale-110 transition-all z-50 group",
            !isSidebarOpen && "right-[-16px]"
          )}
        >
          {isSidebarOpen ? (
            <ChevronLeft className="w-4 h-4 text-primary group-hover:-translate-x-0.5 transition-transform" />
          ) : (
            <ChevronRight className="w-4 h-4 text-primary group-hover:translate-x-0.5 transition-transform" />
          )}
        </button>

        {/* Logo Section */}
        <div className="h-24 flex items-center px-6 border-b border-border/30 justify-between whitespace-nowrap overflow-hidden">
          <Link to="/dashboard" className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-primary-glow flex items-center justify-center shadow-2xl shadow-primary/30 flex-shrink-0">
              <Banknote className="w-7 h-7 text-white" />
            </div>
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex flex-col"
                >
                  <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/60 tracking-tight">
                    Krédit
                  </span>
                  <span className="text-[10px] text-primary font-bold uppercase tracking-widest -mt-1">
                    AI Solutions
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto overflow-x-hidden scrollbar-none">
          {sideItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="group relative flex items-center"
            >
              <div
                className={cn(
                  "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 w-full min-w-0 border border-transparent",
                  isActive(item.path)
                    ? "bg-primary/10 text-primary border-primary/20 shadow-sm"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:border-border/50"
                )}
              >
                <item.icon className={cn("w-6 h-6 flex-shrink-0 transition-transform duration-300 group-hover:scale-110", isActive(item.path) && "text-primary")} />

                {isSidebarOpen && (
                    <span className="font-semibold text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                      {item.label}
                    </span>
                )}

                {isActive(item.path) && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                  />
                )}
              </div>
            </Link>
          ))}

          {/* Ad Space */}
          {isSidebarOpen && !isPro && <div className="pt-6"><AdSpace position="sidebar" isTrialExpired={isTrialExpired} /></div>}
        </nav>

        {/* User Footer Section */}
        <div className="p-4 border-t border-border/30 mt-auto px-6">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={cn(
              "w-full justify-start text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-2xl transition-all h-12 px-0",
              isSidebarOpen ? "px-4" : "justify-center"
            )}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isSidebarOpen && <span className="ml-3 font-semibold text-sm">Cerrar Sesión</span>}
          </Button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen relative overflow-hidden transition-all duration-300 min-w-0 pb-32 lg:pb-0">
        
        {/* Modern Mobile Header (Sólo logo y perfil) */}
        <header className="lg:hidden h-20 bg-background/60 backdrop-blur-xl border-b border-border/50 flex items-center justify-between px-6 sticky top-0 z-[90]">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-primary-glow flex items-center justify-center">
              <Banknote className="w-6 h-6 text-white" />
            </div>
            <span className="font-black text-xl tracking-tight">Krédit</span>
          </div>

          <div className="flex items-center gap-3">
             <Button variant="ghost" size="icon" className="rounded-full bg-muted/50 w-10 h-10">
              <Bell className="w-5 h-5 text-muted-foreground" />
            </Button>
            <Link to="/profile" className="w-10 h-10 rounded-full border-2 border-primary/20 p-0.5 overflow-hidden">
               <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
               </div>
            </Link>
          </div>
        </header>

        {/* Content Section */}
        <div className="flex-1 p-4 lg:p-10 overflow-y-auto relative">
          
          {/* Background Decorative Blur */}
          <div className="absolute top-[-10%] right-[-5%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[20%] h-[20%] bg-accent/5 rounded-full blur-[80px] pointer-events-none" />

          {!isPro && <div className="mb-8"><AdSpace position="banner" isTrialExpired={isTrialExpired} /></div>}

          <div className="max-w-7xl mx-auto pb-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
            {!isPro && <AdSpace position="footer" isTrialExpired={isTrialExpired} />}
          </div>
        </div>
      </main>

      {/* Extra Services/Ads */}
      <SupportChat />
      {!isPro && (
        <>
          <AdPopup />
          <AdSpace position="fixed-bottom" isTrialExpired={isTrialExpired} />
        </>
      )}
    </div>
  );
};

export default DashboardLayout;
