import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Banknote, Mail, Lock, ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
import BrandLogo from "@/components/ui/BrandLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { authApi, setToken } from "@/lib/apiClient";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // 2FA States
  const [showOTP, setShowOTP] = useState(false);
  const [otpCode, setOTPCode] = useState("");
  const [userIdFor2FA, setUserIdFor2FA] = useState<string | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = await authApi.login(email, password);

      if (data.requires2FA) {
        setUserIdFor2FA(data.userId);
        setShowOTP(true);
        toast({
          title: "Verificación Requerida",
          description: "Ingresa el código enviado a tu cuenta.",
        });
      } else {
        const { user, token } = data;
        setToken(token);
        localStorage.setItem("rc_user", JSON.stringify(user));
        toast({
          title: "¡Bienvenido!",
          description: "Has iniciado sesión correctamente.",
        });
        window.location.href = "/dashboard";
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al iniciar sesión",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userIdFor2FA) return;
    setIsLoading(true);

    try {
      const { user, token } = await authApi.verify2FA(userIdFor2FA, otpCode);
      setToken(token);
      localStorage.setItem("rc_user", JSON.stringify(user));
      toast({
        title: "¡Verificado!",
        description: "Acceso concedido.",
      });
      window.location.href = "/dashboard";
    } catch (error: any) {
      toast({
        title: "Error de código",
        description: error.message || "Código inválido, intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="flex items-center mb-12">
            <BrandLogo size={44} textSize="text-2xl" />
          </Link>

          <AnimatePresence mode="wait">
            {!showOTP ? (
              <motion.div
                key="login-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-foreground mb-2">Bienvenido de nuevo</h1>
                  <p className="text-muted-foreground">Ingresa tus credenciales para continuar</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@correo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 h-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <div className="flex justify-end">
                      <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                        ¿Olvidaste tu contraseña?
                      </Link>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Iniciar Sesión
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </Button>
                </form>

                <p className="mt-8 text-center text-muted-foreground">
                  ¿No tienes cuenta?{" "}
                  <Link to="/register" className="text-primary hover:underline font-medium">
                    Regístrate gratis
                  </Link>
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="otp-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="mb-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                    <ShieldCheck className="w-10 h-10 text-primary" />
                  </div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">Doble Factor</h1>
                  <p className="text-muted-foreground">Ingresa el código de 6 dígitos enviado a tu cuenta.</p>
                </div>

                <form onSubmit={handleVerifyOTP} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="otp">Código de Seguridad</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="000000"
                      value={otpCode}
                      onChange={(e) => setOTPCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="text-center text-2xl tracking-[0.5em] font-bold h-16"
                      required
                      autoFocus
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || otpCode.length < 6}
                    className="w-full h-14 bg-gradient-primary text-lg font-bold shadow-glow"
                  >
                    {isLoading ? "Verificando..." : "Confirmar Acceso"}
                  </Button>

                  <button
                    type="button"
                    onClick={() => setShowOTP(false)}
                    className="w-full text-sm text-muted-foreground hover:text-foreground"
                  >
                    Volver al login
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Right Side - Branding */}
      <div className="hidden lg:flex flex-1 hero-gradient items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold mb-8">
            <ShieldCheck className="w-4 h-4 text-gradient-gold" />
            SEGURIDAD AVANZADA ACTIVA
          </div>
          <h2 className="text-4xl font-bold text-primary-foreground mb-4">
            Tu negocio está
            <span className="block text-gradient-gold mt-2">100% blindado</span>
          </h2>
          <p className="text-lg text-white/70 max-w-md mx-auto">
            Hemos implementado Verificación de Doble Factor (2FA) para que solo tú puedas acceder a tu dashboard financiero.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
