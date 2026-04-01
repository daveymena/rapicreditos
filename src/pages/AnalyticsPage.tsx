import { useState, useEffect } from 'react';
import { api } from '@/lib/apiClient';
import { useAuth } from '@/components/auth/AuthContext';
import {
    MessageSquare,
    Users,
    Zap,
    TrendingUp,
    Clock,
    ArrowUpRight,
    Activity
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AnalyticsPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalMessages: 0,
        activeSessions: 0,
        totalConversations: 0,
        responseTime: "1.8s"
    });
    const [, setLoading] = useState(true);

    useEffect(() => {
        if (user) fetchStats();
    }, [user]);

    async function fetchStats() {
        if (!user) return;
        setLoading(true);
        try {
            const data = await api.get<any>('/analytics');
            setStats({
                totalMessages: data.totalMessages || 0,
                activeSessions: data.activeSessions || 0,
                totalConversations: data.totalConversations || 0,
                responseTime: "1.8s"
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    }

    const cards = [
        { label: "Mensajes Enviados", value: stats.totalMessages, icon: <MessageSquare />, color: "text-primary" },
        { label: "Sesiones Activas", value: stats.activeSessions, icon: <Zap />, color: "text-[#25D366]" },
        { label: "Conversaciones", value: stats.totalConversations, icon: <Users />, color: "text-accent" },
        { label: "Tiempo de Respuesta", value: stats.responseTime, icon: <Clock />, color: "text-yellow-400" },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 md:p-8 max-w-7xl mx-auto space-y-10 pb-20"
        >
            <div className="glass p-12 rounded-[3.5rem] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 blur-[100px] rounded-full"></div>
                <div>
                    <h1 className="text-5xl font-black tracking-tighter mb-2 text-white">Métricas de <span className="text-primary italic">Rendimiento</span></h1>
                    <p className="text-white/50 text-lg">Visualiza el impacto de tu inteligencia artificial en tiempo real.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={card.label}
                        className="glass p-8 rounded-[2.5rem] border-white/5 relative group overflow-hidden"
                    >
                        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
                            {card.icon}
                        </div>
                        <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/10 ${card.color}`}>
                            {card.icon}
                        </div>
                        <div className="space-y-1">
                            <span className="text-3xl font-black text-white">{card.value}</span>
                            <p className="text-white/40 text-xs font-bold uppercase tracking-widest">{card.label}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass p-10 rounded-[3rem] border-white/5">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-2xl font-bold flex items-center gap-3 text-white">
                            <Activity className="text-primary" /> Actividad Reciente
                        </h3>
                        <span className="text-[10px] font-black uppercase bg-primary/10 text-primary px-3 py-1 rounded-full">En Vivo</span>
                    </div>
                    <div className="space-y-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="flex items-center gap-4 py-4 border-b border-white/5 last:border-0">
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-xs text-white/40">
                                    #{i}
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-sm text-white">Cliente: +57 321 *** 4567</p>
                                    <p className="text-xs text-white/40">Respuesta generada por Agente Ventas</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-primary font-bold text-xs">+15s</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass p-10 rounded-[3rem] border-white/5 flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary shadow-2xl shadow-primary/20">
                        <TrendingUp size={40} />
                    </div>
                    <h3 className="text-3xl font-black tracking-tight text-white">Crecimiento IA</h3>
                    <p className="text-white/40 text-lg max-w-sm">Tu agente ha ahorrado un total de <span className="text-primary font-bold italic">14.5 horas</span> de trabajo manual este mes.</p>
                    <button className="btn-premium flex items-center gap-2">
                        Descargar Reporte <ArrowUpRight size={18} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
