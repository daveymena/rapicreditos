import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Mail, Lock, Loader2, ArrowRight, User, Building2, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [phone, setPhone] = useState('');
    const [isRegister, setIsRegister] = useState(false);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isRegister) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                            business_name: businessName,
                            phone_number: phone,
                        }
                    }
                });
                if (error) throw error;
                toast.success('¡Registro exitoso! Revisa tu email para confirmar tu cuenta.');
                setIsRegister(false);
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) {
                    if (error.message.toLowerCase().includes('email not confirmed') ||
                        error.message.toLowerCase().includes('email_not_confirmed')) {
                        toast.error('Debes confirmar tu email antes de entrar. Revisa tu bandeja de entrada.');
                    } else if (error.message.toLowerCase().includes('invalid login')) {
                        toast.error('Email o contraseña incorrectos.');
                    } else {
                        throw error;
                    }
                    return;
                }
                if (data.user && !data.user.email_confirmed_at) {
                    toast.error('Confirma tu email primero. Revisa tu bandeja de entrada.');
                    return;
                }
                toast.success('Bienvenido de nuevo');
            }
        } catch (error: any) {
            toast.error(error.message || 'Error en la autenticación');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
            <div className="mesh-bg" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass w-full max-w-lg p-10 rounded-[3rem] border-white/5 relative z-10"
            >
                <div className="absolute top-0 left-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2"></div>

                <div className="text-center space-y-4 mb-10">
                    <motion.div
                        animate={{ rotate: [0, 12, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-primary/20"
                    >
                        <Zap className="text-black fill-black" size={32} />
                    </motion.div>
                    <h1 className="text-4xl font-black tracking-tighter">
                        {isRegister ? 'Crear Cuenta' : 'Bienvenido'}
                    </h1>
                    <p className="text-white/40">
                        {isRegister ? 'Completa tus datos para empezar' : 'Accede a tu panel de control inteligente'}
                    </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-5">
                    <AnimatePresence mode="wait">
                        {isRegister && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-5"
                            >
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-white/30 ml-2">Nombre Completo</label>
                                    <div className="relative">
                                        <User className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                                        <input
                                            type="text"
                                            required
                                            className="input-premium w-full pl-12"
                                            placeholder="Juan Pérez"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-white/30 ml-2">Empresa / Negocio</label>
                                        <div className="relative">
                                            <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                                            <input
                                                type="text"
                                                required
                                                className="input-premium w-full pl-12"
                                                placeholder="Mi Negocio IA"
                                                value={businessName}
                                                onChange={(e) => setBusinessName(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-white/30 ml-2">WhatsApp de Contacto</label>
                                        <div className="relative">
                                            <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                                            <input
                                                type="tel"
                                                required
                                                className="input-premium w-full pl-12"
                                                placeholder="+57 300..."
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-white/30 ml-2">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                            <input
                                type="email"
                                required
                                className="input-premium w-full pl-12"
                                placeholder="tu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-white/30 ml-2">Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                            <input
                                type="password"
                                required
                                className="input-premium w-full pl-12"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-premium py-5 text-lg flex items-center justify-center gap-3 group mt-4"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : (
                            <>
                                {isRegister ? 'Comenzar Ahora' : 'Entrar al Panel'}
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <button
                        onClick={() => setIsRegister(!isRegister)}
                        className="text-white/40 hover:text-white transition-colors text-sm font-bold"
                    >
                        {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate gratis'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
