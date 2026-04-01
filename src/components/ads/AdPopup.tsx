/**
 * AdPopup — Anuncio emergente para usuarios gratuitos
 * - Aparece a los 30s de entrar, luego cada 5 minutos
 * - Se puede cerrar pero vuelve
 * - Usuarios Pro: nunca aparece
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, Star, MessageSquare, TrendingUp, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthContext";

const ADS = [
    {
        icon: <Zap className="w-10 h-10 text-yellow-400" />,
        bg: "from-emerald-600 to-teal-700",
        badge: "🔥 Oferta limitada",
        title: "¡Estás usando la versión gratuita!",
        desc: "Con el Plan Pro tienes clientes ilimitados, WhatsApp con IA, recibos PDF y cero publicidad.",
        price: "Solo $7 USD/mes",
        cta: "Actualizar a Pro ahora",
        href: "/pricing",
    },
    {
        icon: <MessageSquare className="w-10 h-10 text-white" />,
        bg: "from-violet-600 to-purple-800",
        badge: "🤖 IA disponible",
        title: "Tu cobranza puede ser automática",
        desc: "La IA responde por WhatsApp, envía recordatorios y gestiona clientes mientras tú descansas.",
        price: "Actívalo por $7/mes",
        cta: "Quiero la IA ahora",
        href: "/pricing",
    },
    {
        icon: <TrendingUp className="w-10 h-10 text-white" />,
        bg: "from-blue-600 to-indigo-800",
        badge: "📊 Sin límites",
        title: "¿Cuántos clientes tienes esperando?",
        desc: "El plan gratuito solo permite 5 clientes. Con Pro, registra todos los que necesites sin restricciones.",
        price: "$30.000 COP/mes",
        cta: "Desbloquear clientes ilimitados",
        href: "/pricing",
    },
    {
        icon: <Shield className="w-10 h-10 text-white" />,
        bg: "from-orange-500 to-red-700",
        badge: "⚡ Sin publicidad",
        title: "Cansado de los anuncios?",
        desc: "Actualiza a Pro y elimina todos los anuncios para siempre. Interfaz limpia y profesional.",
        price: "Desde $7 USD/mes",
        cta: "Eliminar anuncios",
        href: "/pricing",
    },
];

const FIRST_DELAY = 30000;   // 30 segundos la primera vez
const REPEAT_DELAY = 300000; // cada 5 minutos después

const AdPopup = () => {
    const { subscriptionStatus, isTrialExpired } = useAuth();
    const [visible, setVisible] = useState(false);
    const [isPro, setIsPro] = useState(true);
    const [adIndex, setAdIndex] = useState(0);
    const [closeCount, setCloseCount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const pro = subscriptionStatus === "pro" || subscriptionStatus === "active";
        setIsPro(pro);
        if (!pro && isTrialExpired) scheduleNext(FIRST_DELAY);
    }, [subscriptionStatus, isTrialExpired]);

    const scheduleNext = (delay: number) => {
        setTimeout(() => {
            setAdIndex(Math.floor(Math.random() * ADS.length));
            setVisible(true);
        }, delay);
    };

    const handleClose = () => {
        setVisible(false);
        setCloseCount(c => c + 1);
        // Cuanto más cierra, más rápido vuelve (mínimo 1 minuto)
        const nextDelay = Math.max(60000, REPEAT_DELAY - closeCount * 30000);
        scheduleNext(nextDelay);
    };

    const handleCta = () => {
        setVisible(false);
        navigate("/pricing");
    };

    if (isPro || !isTrialExpired) return null;

    const ad = ADS[adIndex];

    return (
        <AnimatePresence>
            {visible && (
                <>
                    {/* Overlay oscuro */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                        onClick={handleClose}
                    />

                    {/* Popup */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.85, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="fixed inset-0 flex items-center justify-center z-[101] p-4 pointer-events-none"
                    >
                        <div className={`relative w-full max-w-sm rounded-3xl bg-gradient-to-br ${ad.bg} text-white shadow-2xl overflow-hidden pointer-events-auto`}>

                            {/* Botón cerrar — pequeño para que no sea tan fácil */}
                            <button
                                onClick={handleClose}
                                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>

                            {/* Fondo decorativo */}
                            <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
                            <div className="absolute -top-8 -left-8 w-32 h-32 bg-white/5 rounded-full blur-2xl" />

                            <div className="relative p-7 space-y-4">
                                {/* Badge */}
                                <span className="inline-block text-xs font-bold bg-white/20 px-3 py-1 rounded-full">
                                    {ad.badge}
                                </span>

                                {/* Icono */}
                                <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center">
                                    {ad.icon}
                                </div>

                                {/* Texto */}
                                <div>
                                    <h3 className="text-xl font-bold leading-tight mb-2">{ad.title}</h3>
                                    <p className="text-white/80 text-sm leading-relaxed">{ad.desc}</p>
                                </div>

                                {/* Precio */}
                                <div className="bg-white/15 rounded-2xl px-4 py-3 text-center">
                                    <span className="text-2xl font-black">{ad.price}</span>
                                </div>

                                {/* CTA */}
                                <button
                                    onClick={handleCta}
                                    className="w-full bg-white text-gray-900 font-bold py-3.5 rounded-2xl hover:bg-white/90 active:scale-95 transition-all text-sm"
                                >
                                    {ad.cta} →
                                </button>

                                {/* Cerrar link */}
                                <button
                                    onClick={handleClose}
                                    className="w-full text-white/40 hover:text-white/70 text-xs transition-colors py-1"
                                >
                                    No gracias, seguir con anuncios
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default AdPopup;
