import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Smartphone,
    Bot,
    Zap,
    MessageSquare,
    ShieldCheck,
    LogOut,
    BarChart3,
    Sparkles
} from 'lucide-react';
import { Toaster } from 'sonner';
import WhatsAppPage from './pages/WhatsAppPage';
import AgentsPage from './pages/AgentsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import LoginPage from './pages/LoginPage';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <Zap className="text-primary animate-pulse" size={48} />
        </div>
    );
    if (!user) return <Navigate to="/login" />;
    return <>{children}</>;
}

function Dashboard() {
    const { user } = useAuth();
    return (
        <div className="space-y-12">
            <header className="relative py-20 px-4 overflow-hidden rounded-[3rem] glass mt-4 mx-4">
                <div className="absolute top-0 right-0 -u-24 -r-24 w-96 h-96 bg-primary/20 blur-[100px] rounded-full"></div>
                <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center">
                        <span className="px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm font-medium flex items-center gap-2">
                            <Sparkles size={14} className="text-yellow-400" /> Hola, {user?.email?.split('@')[0]}
                        </span>
                    </motion.div>
                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-6xl md:text-7xl font-black tracking-tighter leading-none">
                        Panel de <br /> <span className="text-primary italic">Control</span> IA
                    </motion.h1>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                        <Link to="/whatsapp" className="btn-premium">Gestionar WhatsApp</Link>
                        <Link to="/analytics" className="px-8 py-3 rounded-2xl font-bold bg-white/5 hover:bg-white/10 transition-all border border-white/10">Ver Métricas</Link>
                    </motion.div>
                </div>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6">
                {[
                    { icon: <Zap className="text-yellow-400" />, title: "Respuesta Instantánea", desc: "Menos de 2 segundos para procesar y responder." },
                    { icon: <MessageSquare className="text-primary" />, title: "Multilenguaje", desc: "La IA habla y entiende más de 50 idiomas." },
                    { icon: <ShieldCheck className="text-whatsapp-light" />, title: "Seguro & Privado", desc: "Tus datos y conversaciones están encriptados." }
                ].map((feat, i) => (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 + (i * 0.1) }} className="glass p-8 rounded-[2.5rem] space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">{feat.icon}</div>
                        <h3 className="text-2xl font-bold">{feat.title}</h3>
                        <p className="text-white/50 leading-relaxed">{feat.desc}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

const Sidebar = () => {
    const { pathname } = useLocation();
    const { signOut } = useAuth();

    const links = [
        { to: '/', icon: <LayoutDashboard size={22} />, label: 'Panel' },
        { to: '/whatsapp', icon: <Smartphone size={22} />, label: 'WhatsApp' },
        { to: '/agents', icon: <Bot size={22} />, label: 'Agentes IA' },
        { to: '/analytics', icon: <BarChart3 size={22} />, label: 'Métricas' },
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-24 md:w-72 glass border-r-0 rounded-r-[3rem] z-50 p-6 flex flex-col gap-12">
            <div className="flex items-center gap-3 md:px-4">
                <div className="w-12 h-12 flex-shrink-0 bg-primary rounded-[1rem] flex items-center justify-center shadow-lg shadow-primary/40 rotate-12">
                    <Zap className="text-black fill-black" size={24} />
                </div>
                <span className="hidden md:block text-2xl font-black tracking-tighter uppercase whitespace-nowrap">RapiCredi AI</span>
            </div>
            <nav className="flex flex-col gap-4">
                {links.map((link) => (
                    <Link key={link.to} to={link.to} className={`flex items-center gap-4 px-4 py-4 rounded-3xl transition-all relative group
            ${pathname === link.to ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-white/40 hover:bg-white/5 hover:text-white'}
          `}>
                        {link.icon}
                        <span className="hidden md:block font-bold">{link.label}</span>
                        {pathname === link.to && <motion.div layoutId="nav-pill" className="absolute -left-1 w-1 h-8 bg-white rounded-full" />}
                    </Link>
                ))}
            </nav>
            <div className="mt-auto">
                <button onClick={() => signOut()} className="w-full flex items-center gap-4 px-4 py-4 rounded-3xl text-red-500/60 hover:text-red-500 hover:bg-red-500/5 transition-all">
                    <LogOut size={22} />
                    <span className="hidden md:block font-bold">Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/*" element={
                        <ProtectedRoute>
                            <div className="min-h-screen">
                                <div className="mesh-bg" />
                                <Sidebar />
                                <main className="pl-24 md:pl-72 transition-all min-h-screen">
                                    <AnimatePresence mode="wait">
                                        <Routes>
                                            <Route path="/" element={<Dashboard />} />
                                            <Route path="/whatsapp" element={<WhatsAppPage />} />
                                            <Route path="/agents" element={<AgentsPage />} />
                                            <Route path="/analytics" element={<AnalyticsPage />} />
                                            <Route path="*" element={<Navigate to="/" />} />
                                        </Routes>
                                    </AnimatePresence>
                                </main>
                            </div>
                        </ProtectedRoute>
                    } />
                </Routes>
                <Toaster theme="dark" position="top-right" richColors closeButton />
            </Router>
        </AuthProvider>
    );
}

export default App;
