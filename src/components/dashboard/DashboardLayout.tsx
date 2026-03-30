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
  Menu,
  X,
  ChevronRight,
  MessageSquare,
  CreditCard,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthContext";
import { useToast } from "@/hooks/use-toast";
import SupportChat from "@/components/support/SupportChat";
import AdSlot from "@/components/ads/AdSlot";
import AdPopup from "@/components/ads/AdPopup";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// Componente de Espacio Publicitario (Placeholder)
const AdSpace = ({ position }: { position: "sidebar" | "banner" | "mobile" | "fixed-bottom" | "footer" }) => {

  if (position === "sidebar") {
    return (
      <div className="mx-3 mt-auto mb-4">
        <AdSlot slot="sidebar" className="mx-auto" />
      </div>
    );
  }

  if (position === "banner") {
    return (
      <div className="w-full flex justify-center">
        <AdSlot slot="banner-top" />
      </div>
    );
  }

  if (position === "footer") {
    return (
      <div className="w-full flex justify-center mt-10 mb-4">
        <AdSlot slot="banner-bottom" />
      </div>
    );
  }

  if (position === "fixed-bottom") {
    return (
      <div className="fixed bottom-0 left-0 w-full z-40 bg-background/90 backdrop-blur-sm border-t border-border flex justify-center py-1 lg:hidden">
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
  const { user, signOut, subscriptionStatus } = useAuth();
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
      // En desktop, mantener el estado que el usuario prefiera o abierto por defecto
      // En móvil, siempre cerrado al inicio
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

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Users, label: "Clientes", path: "/clients" },
    { icon: DollarSign, label: "Préstamos", path: "/loans" },
    { icon: Calculator, label: "Simulador", path: "/simulator" },
    { icon: MessageSquare, label: "WhatsApp", path: "/whatsapp" },
    { icon: CreditCard, label: "Planes y Precios", path: "/pricing" },
    { icon: User, label: "Perfil", path: "/profile" },
    { icon: HelpCircle, label: "Ayuda", path: "/help" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row overflow-hidden">
      {/* Overlay for mobile */}
      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen z-50
          bg-card/50 backdrop-blur-xl border-r border-border
          flex flex-col
        `}
        animate={{
          width: isSidebarOpen ? (isMobile ? "80%" : "280px") : (isMobile ? "0px" : "80px"),
          x: isMobile && !isSidebarOpen ? -100 : 0
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Logo Section */}
        <div className="h-20 flex items-center px-6 border-b border-border justify-between whitespace-nowrap overflow-hidden">
          <Link to="/dashboard" className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-primary-glow flex items-center justify-center shadow-lg shadow-primary/20 flex-shrink-0">
              <Banknote className="w-6 h-6 text-white" />
            </div>
            <motion.span
              animate={{ opacity: isSidebarOpen ? 1 : 0, display: isSidebarOpen ? "block" : "none" }}
              className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70"
            >
              Krédit
            </motion.span>
            {isSidebarOpen && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-[10px] text-muted-foreground font-medium tracking-wide mt-0.5"
              >
                Gestión Inteligente con IA
              </motion.p>
            )}
          </Link>

          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden lg:flex"
            >
              <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${isSidebarOpen ? "rotate-180" : ""}`} />
            </Button>
          )}

          {isMobile && (
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
              <X className="w-6 h-6" />
            </Button>
          )}
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden scrollbar-thin">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => isMobile && setIsSidebarOpen(false)}
              className="group relative flex items-center"
            >
              <div
                className={`
                  flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 w-full min-w-0
                  ${isActive(item.path)
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }
                `}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive(item.path) ? "text-white" : ""}`} />

                {isSidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="font-medium whitespace-nowrap overflow-hidden text-ellipsis"
                  >
                    {item.label}
                  </motion.span>
                )}

                {/* Tooltip for collapsed mode */}
                {!isSidebarOpen && !isMobile && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-border">
                    {item.label}
                  </div>
                )}
              </div>
            </Link>
          ))}

          {/* Espacio Publicitario en Sidebar */}
          {isSidebarOpen && !isPro && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8"
            >
              <AdSpace position="sidebar" />
            </motion.div>
          )}
        </nav>

        {/* User Footer Section */}
        <div className="p-4 border-t border-border mt-auto whitespace-nowrap overflow-hidden">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={`w-full justify-start text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors ${!isSidebarOpen && "px-3 justify-center"}`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isSidebarOpen && <span className="ml-3 font-medium">Cerrar Sesión</span>}
          </Button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen relative overflow-hidden transition-all duration-300">

        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 sticky top-0 z-30">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </Button>

          <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-glow">
            Krédit
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="w-10 h-10 rounded-full text-muted-foreground hover:text-destructive transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </Button>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <User className="w-5 h-5 text-primary" />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-4 lg:p-8 overflow-y-auto">

          {/* Espacio Publicitario Banner Superior */}
          {!isPro && (
            <div className="w-full mb-6 lg:mb-8">
              <AdSpace position="banner" />
            </div>
          )}

          <div className="max-w-7xl mx-auto space-y-6 pb-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
            {/* Pie de Página Publicitario */}
            {!isPro && <AdSpace position="footer" />}
          </div>
        </div>
      </main>
      <SupportChat />
      {!isPro && (
        <>
          <AdPopup />
          <AdSpace position="fixed-bottom" />
        </>
      )}
    </div>
  );
};

export default DashboardLayout;
