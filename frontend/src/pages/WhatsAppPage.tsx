import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { Smartphone, RefreshCw, CheckCircle2, QrCode as QrIcon, AlertCircle, Copy, Check, Loader2, Plus, Zap } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface WhatsAppSession {
    id: string;
    session_name: string;
    status: string;
    qr_code: string | null;
    phone_number: string | null;
    agent_id: string | null;
}

export default function WhatsAppPage() {
    const { user } = useAuth();
    const [sessions, setSessions] = useState<WhatsAppSession[]>([]);
    const [agents, setAgents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            fetchSessions();
            fetchAgents();
        }

        const channel = supabase
            .channel('whatsapp-realtime')
            .on(
                'postgres_changes' as any,
                {
                    event: '*',
                    table: 'whatsapp_sessions'
                },
                () => {
                    fetchSessions();
                }
            )
            .subscribe();

        return () => { channel.unsubscribe(); };
    }, [user]);

    async function fetchSessions() {
        if (!user) return;
        const { data } = await supabase
            .from('whatsapp_sessions')
            .select('*')
            .eq('user_id', user.id);
        if (data) setSessions(data);
        setLoading(false);
    }

    async function fetchAgents() {
        if (!user) return;
        const { data } = await supabase
            .from('ai_agents')
            .select('id, name')
            .eq('user_id', user.id);
        if (data) setAgents(data);
    }

    async function createSession() {
        if (!user) return;
        setSaving(true);
        const { data, error } = await supabase
            .from('whatsapp_sessions')
            .insert([{
                user_id: user.id,
                session_name: `Sesión ${sessions.length + 1}`,
                status: 'disconnected'
            }])
            .select();

        if (error) toast.error('Error al crear sesión');
        else {
            toast.success('Sesión iniciada. Esperando QR...');
            // Intentar avisar al backend (opcional si el backend escucha cambios)
            try {
                const apiUrl = import.meta.env.VITE_API_URL || '';
                await fetch(`${apiUrl}/api/sessions/${data[0].id}/restart`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.id })
                });
            } catch (e) {
                console.log('Backend no disponible para reinicio forzado, esperando auto-detección');
            }
        }
        setSaving(false);
    }

    async function updateSession(id: string, updates: any) {
        const { error } = await supabase
            .from('whatsapp_sessions')
            .update(updates)
            .eq('id', id);
        if (error) toast.error('Error al actualizar');
        else toast.success('Configuración guardada');
    }

    const copyId = (id: string) => {
        navigator.clipboard.writeText(id);
        setCopiedId(id);
        toast.success('ID copiado al portapapeles');
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 md:p-8 max-w-7xl mx-auto space-y-10 pb-20"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 glass p-10 rounded-[3rem] border-white/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-64 h-64 bg-whatsapp-light/10 blur-[100px] rounded-full"></div>
                <div className="relative z-10">
                    <h1 className="text-5xl font-black tracking-tighter mb-2">Conexión <span className="text-whatsapp-light">WhatsApp</span></h1>
                    <p className="text-white/50 text-lg">Centraliza tus comunicaciones y asigna cerebros artificiales en segundos.</p>
                </div>
                <button
                    onClick={createSession}
                    disabled={saving}
                    className="btn-premium flex items-center gap-3 disabled:opacity-50"
                >
                    {saving ? <Loader2 className="animate-spin" /> : <Plus size={22} />}
                    Nueva Sesión
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {loading ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="glass h-[600px] rounded-[3rem] animate-pulse"></div>
                    ))
                ) : sessions.length === 0 ? (
                    <div className="col-span-full py-24 text-center glass rounded-[3rem] border-dashed border-2 border-white/10">
                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <QrIcon size={48} className="text-white/20" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2 text-white/40">Sin Conexiones</h2>
                        <p className="text-white/20 mb-10">Vincula tu número de WhatsApp para empezar a responder con IA.</p>
                        <button onClick={createSession} className="btn-premium">Integrar Ahora</button>
                    </div>
                ) : (
                    sessions.map((session) => (
                        <motion.div
                            key={session.id}
                            layout
                            className="glass p-10 rounded-[3rem] border-white/5 flex flex-col items-center group relative h-fit"
                        >
                            <div className={`p-5 rounded-3xl mb-8 ${session.status === 'connected' ? 'bg-whatsapp-light/10 text-whatsapp-light' : 'bg-white/5 text-white/30'
                                }`}>
                                {session.status === 'connected' ? <CheckCircle2 size={40} /> : <Smartphone size={40} />}
                            </div>

                            <div className="text-center mb-10 w-full space-y-2">
                                <input
                                    type="text"
                                    defaultValue={session.session_name}
                                    onBlur={(e) => updateSession(session.id, { session_name: e.target.value })}
                                    className="bg-transparent border-none text-center font-black text-3xl tracking-tight focus:ring-0 w-full"
                                />
                                <div
                                    onClick={() => copyId(session.id)}
                                    className="flex items-center justify-center gap-2 text-[10px] text-white/20 bg-white/5 py-1 px-3 rounded-full cursor-pointer hover:bg-white/10 transition-all mx-auto w-fit font-bold uppercase tracking-widest"
                                >
                                    <Zap size={10} /> {session.id.slice(0, 8)} {copiedId === session.id ? <Check size={10} /> : <Copy size={10} />}
                                </div>
                            </div>

                            {/* QR Code Section */}
                            <div className="w-full aspect-square glass rounded-[2.5rem] p-10 flex flex-col items-center justify-center relative overflow-hidden group/qr mb-8">
                                {session.status === 'qr_ready' && session.qr_code ? (
                                    <div className="relative p-6 bg-white rounded-3xl shadow-2xl scale-110">
                                        <QRCodeSVG value={session.qr_code} size={220} level="H" includeMargin />
                                    </div>
                                ) : session.status === 'connected' ? (
                                    <div className="flex flex-col items-center gap-6">
                                        <div className="w-24 h-24 bg-whatsapp-light/10 text-whatsapp-light rounded-full flex items-center justify-center shadow-2xl shadow-whatsapp-light/20">
                                            <CheckCircle2 size={56} />
                                        </div>
                                        <div className="text-center">
                                            <span className="font-black text-3xl uppercase tracking-tighter block text-whatsapp-light">CONECTADO</span>
                                            <span className="text-white/40 text-xs font-bold uppercase tracking-widest">{session.phone_number || 'NODO ACTIVO'}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-6 text-white/20">
                                        <RefreshCw size={56} className="animate-spin" />
                                        <span className="font-black text-xs uppercase tracking-[0.2em]">Cargando QR...</span>
                                    </div>
                                )}
                            </div>

                            <div className="w-full space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Cerebro Asignado</label>
                                    <select
                                        className="input-premium w-full bg-surface text-sm font-bold"
                                        value={session.agent_id || ''}
                                        onChange={(e) => updateSession(session.id, { agent_id: e.target.value || null })}
                                    >
                                        <option value="">Sin Agente (Solo Humano)</option>
                                        {agents.map(agent => (
                                            <option key={agent.id} value={agent.id}>{agent.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={async () => {
                                            try {
                                                const apiUrl = import.meta.env.VITE_API_URL || '';
                                                await fetch(`${apiUrl}/api/sessions/${session.id}/restart`, {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ userId: user?.id })
                                                });
                                                toast.success('Reiniciando sesión...');
                                            } catch {
                                                toast.error('Error al reiniciar sesión');
                                            }
                                        }}
                                        className="flex-1 py-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all font-bold text-xs uppercase tracking-widest border border-white/5">
                                        Reiniciar
                                    </button>
                                    <button
                                        onClick={async () => {
                                            const { error } = await supabase.from('whatsapp_sessions').delete().eq('id', session.id);
                                            if (error) toast.error('Error al eliminar');
                                            else toast.success('Sesión eliminada');
                                        }}
                                        className="p-4 rounded-2xl bg-red-500/5 text-red-500 hover:bg-red-500/10 transition-all border border-red-500/10"
                                    >
                                        <AlertCircle size={20} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </motion.div>
    );
}
