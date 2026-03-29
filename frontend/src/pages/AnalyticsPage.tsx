import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
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

interface RecentMessage {
    id: string;
    content: string;
    created_at: string;
    conversations: {
        customer_phone: string;
    } | null;
}

export default function AnalyticsPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalMessages: 0,
        activeSessions: 0,
        totalConversations: 0,
        responseTime: "< 2s"
    });
    const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) fetchStats();
    }, [user]);

    async function fetchStats() {
        setLoading(true);

        // Total de mensajes enviados por agentes del usuario
        const { count: msgs } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('sender_type', 'agent');

        // Sesiones activas
        const { count: sessions } = await supabase
            .from('whatsapp_sessions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user?.id)
            .eq('status', 'connected');

        // Conversaciones totales
        const { count: convs } = await supabase
            .from('conversations')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user?.id);

        // Mensajes recientes con info de conversación
        const { data: recent } = await supabase
            .from('messages')
            .select('id, content, created_at, conversations(customer_phone)')
            .eq('sender_type', 'agent')
            .order('created_at', { ascending: false })
            .limit(4);

        setStats({
            totalMessages: msgs || 0,
            activeSessions: sessions || 0,
            totalConversations: convs || 0,
            responseTime: "< 2s"
        });
        setRecentMessages((recent as unknown as RecentMessage[]) || []);
        setLoading(false);
    }

    const cards = [
        { label: "Mensajes Enviados", value: stats.totalMessages, icon: <MessageSquare />, color: "text-primary" },
        { label: "Sesiones Activas", value: stats.activeSessions, icon: <Zap />, color: "text-whatsapp-light" },
        { label: "Conversaciones", value: stats.totalConversations, icon: <Users />, color: "text-accent" },
        { label: "Tiempo de Respuesta", value: stats.responseTime, icon: <Clock />, color: "text-yellow-400" },
    ];

    const maskPhone = (phone: string) => {
        if (!phone) return 'Desconocido';
        return phone.replace(/(\d{2,3})\d{4}(\d{4})/, '$1****$2');
    };

    const timeAgo = (dateStr: string) => {
        const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
        if (diff < 60) return `${diff}s`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m`;
        return `${Math.floor(diff / 3600)}h`;
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 md:p-8 max-w-7xl mx-auto space-y-10 pb-20"
        >
            <div className="glass p-12 rounded-[3.5rem] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 blur-[100px] rounded-full"></div>
                <div>
                    <h1 className="text-5xl font-black tracking-tighter mb-2">Métricas de <span className="text-primary italic">Rendimiento</span></h1>
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
                            <span className="text-3xl font-black">{loading ? '...' : card.value}</span>
                            <p className="text-white/40 text-xs font-bold uppercase tracking-widest">{card.label}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass p-10 rounded-[3rem] border-white/5">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-2xl font-bold flex items-center gap-3">
                            <Activity className="text-primary" /> Actividad Reciente
                        </h3>
                        <span className="text-[10px] font-black uppercase bg-primary/10 text-primary px-3 py-1 rounded-full">En Vivo</span>
                    </div>
                    <div className="space-y-6">
                        {loading ? (
                            [1, 2, 3, 4].map(i => (
                                <div key={i} className="h-14 glass rounded-2xl animate-pulse" />
                            ))
                        ) : recentMessages.length === 0 ? (
                            <p className="text-white/30 text-center py-8">Sin actividad reciente</p>
                        ) : (
                            recentMessages.map((msg, i) => (
                                <div key={msg.id} className="flex items-center gap-4 py-4 border-b border-white/5 last:border-0">
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-xs text-white/40">
                                        #{i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm">Cliente: {maskPhone(msg.conversations?.customer_phone || '')}</p>
                                        <p className="text-xs text-white/40 truncate">{msg.content}</p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-primary font-bold text-xs">+{timeAgo(msg.created_at)}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="glass p-10 rounded-[3rem] border-white/5 flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary shadow-2xl shadow-primary/20">
                        <TrendingUp size={40} />
                    </div>
                    <h3 className="text-3xl font-black tracking-tight">Crecimiento IA</h3>
                    <p className="text-white/40 text-lg max-w-sm">
                        Tu agente ha procesado <span className="text-primary font-bold italic">{stats.totalMessages}</span> mensajes en total.
                    </p>
                    <button onClick={fetchStats} className="btn-premium flex items-center gap-2">
                        Actualizar Datos <ArrowUpRight size={18} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
