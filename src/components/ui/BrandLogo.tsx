/**
 * BrandLogo — Logo oficial de Krédit
 * Ícono: RC estilizado con símbolo de moneda y flecha de crecimiento
 */

interface BrandLogoProps {
    size?: number;
    className?: string;
    showText?: boolean;
    textSize?: string;
    dark?: boolean;
}

// Ícono SVG profesional — moneda estilizada limpia
export const BrandIcon = ({ size = 40, className = "" }: { size?: number; className?: string }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <defs>
            <linearGradient id="brandGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="hsl(158, 64%, 32%)" />
                <stop offset="100%" stopColor="hsl(158, 70%, 44%)" />
            </linearGradient>
            <linearGradient id="coinGrad" x1="8" y1="8" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
            </linearGradient>
        </defs>

        {/* Fondo redondeado */}
        <rect width="40" height="40" rx="12" fill="url(#brandGrad)" />

        {/* Moneda exterior */}
        <circle cx="20" cy="20" r="11" fill="url(#coinGrad)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />

        {/* Moneda interior (relieve) */}
        <circle cx="20" cy="20" r="8" stroke="rgba(255,255,255,0.15)" strokeWidth="0.75" fill="none" />

        {/* Símbolo $ — trazo superior */}
        <line x1="20" y1="11.5" x2="20" y2="13.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
        {/* Arco superior del $ */}
        <path d="M23 14.5 C23 13 17 13 17 15.5 C17 18 23 18 23 20.5 C23 23 17 23 17 21.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        {/* Símbolo $ — trazo inferior */}
        <line x1="20" y1="26.5" x2="20" y2="28.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
);

// Logo completo: ícono + texto
const BrandLogo = ({ size = 40, showText = true, textSize = "text-xl", dark = false, className = "" }: BrandLogoProps) => (
    <div className={`flex items-center gap-2.5 ${className}`}>
        <BrandIcon size={size} />
        {showText && (
            <div className="flex flex-col leading-none">
                <span className={`font-black tracking-tight ${textSize} ${dark ? "text-white" : "text-foreground"}`}>
                    Krédit
                </span>
                <span className={`text-[10px] font-medium tracking-widest uppercase ${dark ? "text-white/50" : "text-muted-foreground"}`}>
                    Pro
                </span>
            </div>
        )}
    </div>
);

export default BrandLogo;
