/**
 * AdSlot — Sistema de publicidad
 *
 * Usuarios GRATUITOS: ven anuncios
 * Usuarios PRO: no ven nada (limpio)
 *
 * Modos:
 *   "house"     → Anuncios propios de Krédit (promoción del plan Pro)
 *   "adsense"   → Google AdSense (pega tu adClient y adSlot)
 *   "adsterra"  → Adsterra (pega scriptSrc y scriptConfig)
 *   "custom"    → Cualquier agencia con script externo
 *
 * Para activar una agencia externa, cambia provider en ADS_CONFIG.
 */

import { useEffect, useRef } from "react";
import { Zap, Star, MessageSquare, TrendingUp, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export type AdSlotId = "banner-top" | "banner-bottom" | "sidebar" | "mobile-bottom";

interface AdSlotConfig {
    enabled: boolean;
    provider: "house" | "adsense" | "adsterra" | "custom";
    adClient?: string;
    adSlot?: string;
    scriptSrc?: string;
    scriptConfig?: string;
    width: number;
    height: number;
}

// ═══════════════════════════════════════════════════════
// CONFIGURACIÓN — Cambia provider cuando contrates agencia
// ═══════════════════════════════════════════════════════
const ADS_CONFIG: Record<AdSlotId, AdSlotConfig> = {
    "banner-top":    { enabled: true, provider: "house", width: 728, height: 90 },
    "banner-bottom": { enabled: true, provider: "house", width: 728, height: 90 },
    "sidebar":       { enabled: true, provider: "house", width: 300, height: 250 },
    "mobile-bottom": { enabled: true, provider: "house", width: 320, height: 50 },
};
// ═══════════════════════════════════════════════════════

// Anuncios propios — rotan aleatoriamente
const HOUSE_ADS = {
    "banner-top": [
        {
            bg: "from-emerald-600 to-teal-700",
            icon: <Zap className="w-5 h-5 text-yellow-300" />,
            title: "¡Actualiza a Pro y elimina los anuncios!",
            desc: "Clientes ilimitados · WhatsApp IA · Sin publicidad",
            cta: "Ver Plan Pro →",
            href: "/pricing",
        },
        {
            bg: "from-violet-600 to-purple-700",
            icon: <MessageSquare className="w-5 h-5 text-white" />,
            title: "Automatiza tu cobranza con IA",
            desc: "WhatsApp + Llama 3 responden por ti las 24 horas",
            cta: "Activar IA →",
            href: "/pricing",
        },
    ],
    "banner-bottom": [
        {
            bg: "from-blue-600 to-indigo-700",
            icon: <TrendingUp className="w-5 h-5 text-white" />,
            title: "Plan Pro desde $7 USD/mes",
            desc: "Gestiona préstamos ilimitados sin restricciones",
            cta: "Comenzar ahora →",
            href: "/pricing",
        },
    ],
    "sidebar": [
        {
            bg: "from-emerald-600 to-teal-700",
            icon: <Star className="w-8 h-8 text-yellow-300" />,
            title: "Plan Pro",
            desc: "Clientes ilimitados, WhatsApp IA, recibos PDF y sin publicidad por solo $7/mes.",
            cta: "Actualizar ahora",
            href: "/pricing",
        },
        {
            bg: "from-orange-500 to-red-600",
            icon: <MessageSquare className="w-8 h-8 text-white" />,
            title: "IA de Cobranza",
            desc: "Deja que la IA envíe recordatorios automáticos por WhatsApp a tus clientes.",
            cta: "Activar IA",
            href: "/whatsapp",
        },
    ],
    "mobile-bottom": [
        {
            bg: "from-emerald-600 to-teal-600",
            icon: <Zap className="w-4 h-4 text-yellow-300" />,
            title: "Pro: sin anuncios + IA",
            cta: "Ver →",
            href: "/pricing",
        },
    ],
};

interface AdSlotProps {
    slot: AdSlotId;
    className?: string;
}

const HouseAd = ({ slot }: { slot: AdSlotId }) => {
    const ads = HOUSE_ADS[slot];
    const ad = ads[Math.floor(Math.random() * ads.length)];
    const [dismissed, setDismissed] = useState(false);

    if (dismissed) return null;

    if (slot === "mobile-bottom") {
        return (
            <Link to={ad.href} className={`flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r ${ad.bg} text-white text-xs font-medium rounded-lg w-full max-w-[320px] mx-auto`}>
                {ad.icon}
                <span className="flex-1 truncate">{ad.title}</span>
                <span className="text-yellow-200 font-bold shrink-0">{ad.cta}</span>
            </Link>
        );
    }

    if (slot === "sidebar") {
        return (
            <div className={`relative rounded-2xl bg-gradient-to-br ${ad.bg} p-5 text-white w-full max-w-[300px] mx-auto overflow-hidden`}>
                <button onClick={() => setDismissed(true)} className="absolute top-2 right-2 text-white/50 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                </button>
                <div className="text-[9px] uppercase tracking-widest text-white/50 mb-3">Publicidad</div>
                <div className="mb-3">{ad.icon}</div>
                <h4 className="font-bold text-base mb-1">{ad.title}</h4>
                <p className="text-white/80 text-xs mb-4">{(ad as any).desc}</p>
                <Link to={ad.href} className="block text-center bg-white/20 hover:bg-white/30 transition-colors rounded-xl py-2 text-sm font-bold">
                    {ad.cta}
                </Link>
            </div>
        );
    }

    // banner-top / banner-bottom
    return (
        <div className={`relative flex items-center gap-4 px-5 py-3 bg-gradient-to-r ${ad.bg} text-white rounded-xl w-full max-w-[728px] mx-auto overflow-hidden`}>
            <button onClick={() => setDismissed(true)} className="absolute top-1.5 right-2 text-white/40 hover:text-white">
                <X className="w-3 h-3" />
            </button>
            <div className="text-[9px] absolute top-1 left-2 uppercase tracking-widest text-white/40">Publicidad</div>
            <div className="shrink-0 mt-1">{ad.icon}</div>
            <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{ad.title}</p>
                <p className="text-white/75 text-xs truncate">{(ad as any).desc}</p>
            </div>
            <Link to={ad.href} className="shrink-0 bg-white/20 hover:bg-white/30 transition-colors rounded-lg px-3 py-1.5 text-xs font-bold whitespace-nowrap">
                {ad.cta}
            </Link>
        </div>
    );
};

const AdSlot = ({ slot, className = "" }: AdSlotProps) => {
    const config = ADS_CONFIG[slot];
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!config.enabled || config.provider === "house") return;
        if (!containerRef.current || containerRef.current.childElementCount > 0) return;

        if (config.provider === "adsense" && config.adClient && config.adSlot) {
            const ins = document.createElement("ins");
            ins.className = "adsbygoogle";
            ins.style.display = "block";
            ins.setAttribute("data-ad-client", config.adClient);
            ins.setAttribute("data-ad-slot", config.adSlot);
            ins.setAttribute("data-ad-format", "auto");
            ins.setAttribute("data-full-width-responsive", "true");
            containerRef.current.appendChild(ins);
            try { (window as any).adsbygoogle.push({}); } catch { /* */ }
        }

        if ((config.provider === "adsterra" || config.provider === "custom") && config.scriptSrc) {
            if (config.scriptConfig) {
                const cfgScript = document.createElement("script");
                cfgScript.type = "text/javascript";
                cfgScript.innerHTML = `atOptions = ${config.scriptConfig}`;
                containerRef.current.appendChild(cfgScript);
            }
            const script = document.createElement("script");
            script.type = "text/javascript";
            script.src = config.scriptSrc;
            script.async = true;
            containerRef.current.appendChild(script);
        }
    }, [config]);

    if (!config.enabled) return null;

    if (config.provider === "house") {
        return (
            <div className={`w-full flex justify-center ${className}`}>
                <HouseAd slot={slot} />
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={`flex justify-center items-center overflow-hidden ${className}`}
            style={{ minHeight: config.height, width: "100%", maxWidth: config.width }}
        />
    );
};

export default AdSlot;
