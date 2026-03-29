import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, KeyRound, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Usar la URL en español (segura sin ñ) para que coincida con Supabase
            const redirectUrl = `${window.location.origin}/restablecer-clave`;

            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: redirectUrl,
            });

            if (error) throw error;

            setIsSent(true);
            toast.success("Correo de recuperación enviado");
        } catch (error: any) {
            console.error("Error recovery:", error);
            toast.error(error.message || "Error al enviar el correo");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/30">
            {/* Background Gradients */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] animate-float" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] animate-float-delayed" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md z-10"
            >
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center justify-center gap-2 mb-4">
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-glow">
                            Krédit
                        </span>
                    </Link>
                    <h1 className="text-2xl font-bold text-foreground">Recuperar Acceso</h1>
                    <p className="text-muted-foreground mt-2">
                        Te enviaremos un enlace seguro para restablecer tu contraseña
                    </p>
                </div>

                <Card className="border-muted/60 shadow-xl backdrop-blur-sm bg-card/80">
                    <CardContent className="pt-6">
                        {isSent ? (
                            <div className="text-center space-y-6">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-semibold">¡Correo Enviado!</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Hemos enviado las instrucciones a <strong>{email}</strong>.
                                        Revisa tu bandeja de entrada (y spam) para continuar.
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => setIsSent(false)}
                                >
                                    Intentar con otro correo
                                </Button>
                                <Link to="/login" className="block text-sm text-primary hover:underline">
                                    Volver al inicio de sesión
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Correo Electrónico</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="tu@correo.com"
                                            className="pl-10"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                                            Enviando...
                                        </>
                                    ) : (
                                        <>
                                            Enviar Enlace
                                            <KeyRound className="ml-2 w-4 h-4" />
                                        </>
                                    )}
                                </Button>

                                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex gap-3 items-start">
                                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div className="text-xs text-blue-800">
                                        <p className="font-semibold mb-1">¿Prefieres usar WhatsApp?</p>
                                        <p>Si vinculaste tu número, contacta a soporte administrativo para recibir un código temporal.</p>
                                    </div>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>

                <div className="text-center mt-6">
                    <Link
                        to="/login"
                        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver al login
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
