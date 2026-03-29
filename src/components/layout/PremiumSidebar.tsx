import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthContext';
import {
    LayoutDashboard,
    Smartphone,
    Bot,
    BarChart3,
    LogOut,
    Users,
    CreditCard,
    Zap,
    LifeBuoy,
    User,
    Calculator
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function PremiumSidebar() {
    const { pathname } = useLocation();
    const { signOut } = useAuth();

    const links = [
        { to: '/dashboard', icon: <LayoutDashboard size={22} />, label: 'Inicio' },
        { to: '/loans', icon: <CreditCard size={22} />, label: 'Préstamos' },
        { to: '/clients', icon: <Users size={22} />, label: 'Clientes' },
        { to: '/simulator', icon: <Calculator size={22} />, label: 'Simulador' },
        { to: '/whatsapp', icon: <Smartphone size={22} />, label: 'WhatsApp' },
        { to: '/agents', icon: <Bot size={22} />, label: 'Agentes IA' },
        { to: '/analytics', icon: <BarChart3 size={22} />, label: 'Métricas' },
        { to: '/profile', icon: <User size={22} />, label: 'Perfil' },
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-20 md:w-72 glass border-r-0 rounded-r-[3rem] z-50 p-6 flex flex-col gap-8 hidden md:flex">
            <div className="flex items-center gap-3 px-2">
                <div className="w-10 h-10 flex-shrink-0 bg-primary rounded-[1rem] flex items-center justify-center shadow-lg shadow-primary/40 rotate-12">
                    <Zap className="text-white fill-white" size={20} />
                </div>
                <span className="hidden md:block text-xl font-black tracking-tighter uppercase whitespace-nowrap text-white">
                    RapiCredi <span className="text-primary italic">Pro</span>
                </span>
            </div>

            <nav className="flex flex-col gap-2 flex-1 overflow-y-auto no-scrollbar">
                {links.map((link) => (
                    <Link
                        key={link.to}
                        to={link.to}
                        className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all relative group
                            ${pathname === link.to
                                ? 'bg-primary text-white shadow-xl shadow-primary/20'
                                : 'text-white/40 hover:bg-white/5 hover:text-white'}
                        `}
                    >
                        {link.icon}
                        <span className="hidden md:block font-bold text-sm tracking-wide">{link.label}</span>
                        {pathname === link.to && (
                            <motion.div
                                layoutId="nav-pill"
                                className="absolute -left-1 w-1 h-6 bg-white rounded-full"
                            />
                        )}
                    </Link>
                ))}
            </nav>

            <div className="mt-auto pt-4 border-t border-white/5">
                <Link
                    to="/help"
                    className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all mb-2 text-white/40 hover:bg-white/5 hover:text-white`}
                >
                    <LifeBuoy size={22} />
                    <span className="hidden md:block font-bold text-sm">Ayuda</span>
                </Link>
                <button
                    onClick={() => signOut()}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-red-500/60 hover:text-white hover:bg-red-500 transition-all group"
                >
                    <LogOut size={22} className="group-hover:text-white" />
                    <span className="hidden md:block font-bold text-sm">Salir</span>
                </button>
            </div>
        </aside>
    );
}
