/**
 * PageLoader — Pantalla de carga entre navegaciones
 * Simula carga profesional con barra de progreso y skeleton
 */

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import BrandLogo from "@/components/ui/BrandLogo";

// Barra de progreso superior (estilo NProgress / YouTube)
export const TopProgressBar = () => {
    const location = useLocation();
    const [progress, setProgress] = useState(0);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(true);
        setProgress(0);

        // Simula progreso rápido al inicio, luego más lento
        const t1 = setTimeout(() => setProgress(30), 50);
        const t2 = setTimeout(() => setProgress(60), 150);
        const t3 = setTimeout(() => setProgress(85), 300);
        const t4 = setTimeout(() => setProgress(100), 500);
        const t5 = setTimeout(() => setVisible(false), 700);

        return () => {
            clearTimeout(t1); clearTimeout(t2);
            clearTimeout(t3); clearTimeout(t4); clearTimeout(t5);
        };
    }, [location.pathname]);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed top-0 left-0 right-0 z-[200] h-0.5 bg-transparent"
                >
                    <motion.div
                        className="h-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]"
                        initial={{ width: "0%" }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// Pantalla de splash inicial (solo al cargar la app por primera vez)
export const SplashScreen = ({ onDone }: { onDone: () => void }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const steps = [
            { p: 20, t: 200 },
            { p: 45, t: 500 },
            { p: 70, t: 900 },
            { p: 90, t: 1300 },
            { p: 100, t: 1700 },
        ];

        const timers = steps.map(({ p, t }) =>
            setTimeout(() => setProgress(p), t)
        );
        const done = setTimeout(onDone, 2000);

        return () => { timers.forEach(clearTimeout); clearTimeout(done); };
    }, []);

    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-background"
        >
            {/* Logo animado */}
            <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.1 }}
                className="flex flex-col items-center gap-5 mb-12"
            >
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-primary to-primary-glow flex items-center justify-center shadow-glow">
                    <BrandLogo size={48} showText={false} />
                </div>
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Krédit</h1>
                    <p className="text-muted-foreground text-sm mt-1">Gestión inteligente de préstamos</p>
                </div>
            </motion.div>

            {/* Barra de progreso */}
            <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-primary rounded-full"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                />
            </div>
            <p className="text-xs text-muted-foreground mt-3">Cargando tu panel...</p>
        </motion.div>
    );
};
