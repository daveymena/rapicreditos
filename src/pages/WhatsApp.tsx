import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Smartphone, CheckCircle, RefreshCcw, Bot, Sparkles,
    Send, MessageSquare, Loader2, Wifi, WifiOff, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { toast } from "sonner";
import { QRCodeSVG } from 'qrcode.react';
import { api } from "@/lib/apiClient";
import { useAuth } from "@/components/auth/AuthContext";

const WhatsApp = () => {
    const { user } = useAuth();
    const [isConnected, setIsConnected] = useState(false);
    const [qrCode, setQrCode] = useState("");
    const [connectionStatus, setConnectionStatus] = useState("disconnected");
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isConnecting, setIsConnecting] = useState(false);
    const [msgCount, setMsgCount] = useState(0);

    useEffect(() => {
        initSession();
    }, [user]);

    const initSession = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const sessions = await api.get<any[]>('/whatsapp/sessions');
            if (sessions && sessions.length > 0) {
                const session = sessions[0];
                setSessionId(session.id);
                setConnectionStatus(session.status);
                setIsConnected(session.status === 'connected');
                if (session.qr_code) setQrCode(session.qr_code);
            } else {
                const newSession = await api.post<any>('/whatsapp/sessions', {});
                if (newSession) setSessionId(newSession.id);
            }
        } catch (e) {
            console.error('Error init session:', e);
        }
        setIsLoading(false);
    };

    // Polling para QR y estado
    useEffect(() => {
        if (!sessionId) return;
        const interval = setInterval(async () => {
            try {
                const sessions = await api.get<any[]>('/whatsapp/sessions');
                const data = sessions?.find((s: any) => s.id === sessionId);
                if (data) {
                    setConnectionStatus(data.status);
                    const connected = data.status === 'connected';
                    if (connected && !isConnected) {
                        toast.success("¡WhatsApp conectado exitosamente!");
                        setIsConnecting(false);
                    }
                    setIsConnected(connected);
                    setQrCode(data.qr_code || '');
                    if (data.qr_code && isConnecting) setIsConnecting(false);
                }
            } catch {}
        }, 3000);
        return () => clearInterval(interval);
    }, [sessionId, isConnected, isConnecting]);

    const handleConnect = async () => {
        if (!sessionId) return;
        setIsConnecting(true);
        toast.info("Iniciando Baileys, generando QR...");
        try {
            await api.post(`/api/sessions/${sessionId}/restart`, { userId: user?.id });
        } catch {
            // Backend puede no estar disponible localmente
        }
        setTimeout(() => setIsConnecting(false), 20000);
    };

    const handleDisconnect = async () => {
        if (!sessionId) return;
        try {
            await api.post(`/api/sessions/${sessionId}/restart`, { userId: user?.id });
        } catch {}
        setIsConnected(false);
        setQrCode("");
        toast.info("Sesión desconectada");
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center space-y-4">
                        <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
                        <p className="text-muted-foreground text-sm">Cargando sesión...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
            >
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Sincronización WhatsApp</h1>
                    <p className="text-muted-foreground">
                        Conecta tu número para enviar recordatorios automáticos con IA
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* QR / Estado */}
                    <Card className="border-border shadow-elevated">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Smartphone className="w-5 h-5 text-primary" />
                                Estado de Conexión
                            </CardTitle>
                            <CardDescription>
                                Escanea el QR desde WhatsApp → Dispositivos vinculados
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center min-h-[420px]">
                            <AnimatePresence mode="wait">
                                {isConnected ? (
                                    <motion.div
                                        key="connected"
                                        initial={{ scale: 0.85, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.85, opacity: 0 }}
                                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                        className="text-center space-y-6"
                                    >
                                        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto ring-4 ring-primary/20 animate-pulse-glow">
                                            <CheckCircle className="w-12 h-12 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold mb-2">¡Conectado!</h3>
                                            <p className="text-muted-foreground max-w-xs mx-auto text-sm">
                                                Baileys activo — escuchando mensajes en tiempo real.
                                            </p>
                                        </div>
                                        <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5">
                                            <Wifi className="w-3 h-3 mr-1.5" /> En línea
                                        </Badge>
                                        <Button
                                            variant="outline"
                                            onClick={handleDisconnect}
                                            className="text-destructive hover:bg-destructive/10 border-destructive/20"
                                        >
                                            <WifiOff className="w-4 h-4 mr-2" />
                                            Desconectar
                                        </Button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="disconnected"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="w-full max-w-sm space-y-6 text-center"
                                    >
                                        {/* QR Box */}
                                        <div className="relative bg-white p-5 rounded-2xl border-2 border-dashed border-border/40 mx-auto w-64 h-64 flex items-center justify-center overflow-hidden shadow-inner">
                                            <AnimatePresence mode="wait">
                                                {isConnecting && !qrCode ? (
                                                    <motion.div
                                                        key="connecting"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        className="flex flex-col items-center gap-3"
                                                    >
                                                        <div className="relative">
                                                            <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                                                            <Zap className="w-6 h-6 text-primary absolute inset-0 m-auto" />
                                                        </div>
                                                        <p className="text-xs text-gray-500 font-medium">Generando QR...</p>
                                                        <p className="text-[10px] text-gray-400">Puede tomar 10-20 segundos</p>
                                                    </motion.div>
                                                ) : qrCode ? (
                                                    <motion.div
                                                        key="qr"
                                                        initial={{ scale: 0.8, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        transition={{ type: "spring", stiffness: 200 }}
                                                    >
                                                        <QRCodeSVG value={qrCode} size={210} level="H" />
                                                    </motion.div>
                                                ) : (
                                                    <motion.div
                                                        key="idle"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        className="flex flex-col items-center gap-3"
                                                    >
                                                        <Smartphone className="w-12 h-12 text-gray-300" />
                                                        <p className="text-xs text-gray-400">Presiona el botón para generar el QR</p>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        <div className="space-y-3 text-sm text-muted-foreground">
                                            <p>1. Abre WhatsApp en tu teléfono</p>
                                            <p>2. Menú → Dispositivos vinculados</p>
                                            <p>3. Vincular un dispositivo → Escanea</p>
                                        </div>

                                        <Button
                                            onClick={handleConnect}
                                            disabled={isConnecting}
                                            className="w-full relative overflow-hidden"
                                        >
                                            {isConnecting ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Generando QR...
                                                </>
                                            ) : qrCode ? (
                                                <>
                                                    <RefreshCcw className="w-4 h-4 mr-2" />
                                                    Regenerar QR
                                                </>
                                            ) : (
                                                <>
                                                    <Zap className="w-4 h-4 mr-2" />
                                                    Generar QR
                                                </>
                                            )}
                                        </Button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </CardContent>
                    </Card>

                    {/* Panel IA + Stats */}
                    <div className="space-y-6">
                        <Card className="bg-gradient-to-br from-indigo-950 to-violet-950 text-white border-indigo-800/40 shadow-xl overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-white">
                                    <Bot className="w-6 h-6" />
                                    Asistente IA
                                </CardTitle>
                                <CardDescription className="text-indigo-300">
                                    Cobranza automática inteligente
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 relative z-10">
                                <div className="flex gap-4 items-start">
                                    <div className="p-3 bg-white/10 rounded-xl shrink-0">
                                        <Bot className="w-7 h-7 text-indigo-300" />
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <h4 className="font-semibold">Asistente de Cobranza</h4>
                                        <p className="text-sm text-indigo-300 mt-1 leading-relaxed">
                                            Detecta vencimientos y responde mensajes automáticamente con tono amable.
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10 space-y-2">
                                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase mb-3">
                                        <Sparkles className="w-3 h-3" /> Estado del Sistema
                                    </div>
                                    {[
                                        { label: "Motor IA", value: "Activo", ok: true },
                                        { label: "WhatsApp", value: isConnected ? "Conectado" : "Desconectado", ok: isConnected },
                                        { label: "Scheduler", value: "8:00 AM diario", ok: true },
                                    ].map(item => (
                                        <div key={item.label} className="flex justify-between text-sm text-indigo-100">
                                            <span>{item.label}</span>
                                            <span className={`font-bold ${item.ok ? 'text-green-400' : 'text-yellow-400'}`}>
                                                {item.value} {item.ok ? '✅' : '⏳'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 300 }}>
                                <Card className="border-border">
                                    <CardContent className="p-5 flex items-center gap-3">
                                        <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                                            <Send className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Mensajes IA</p>
                                            <p className="font-bold text-xl">{msgCount}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                            <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 300 }}>
                                <Card className="border-border">
                                    <CardContent className="p-5 flex items-center gap-3">
                                        <div className="p-2.5 bg-accent/10 text-accent rounded-xl">
                                            <MessageSquare className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Estado</p>
                                            <p className="font-bold text-sm capitalize">{connectionStatus}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </DashboardLayout>
    );
};

export default WhatsApp;

