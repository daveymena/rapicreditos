import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Building2,
    Save,
    Camera,
    Loader2,
    CheckCircle,
    AlertCircle,
    MessageSquare,
    Shield,
    Bell,
    DollarSign,
    Percent,
    CreditCard,
    X,
    ShieldCheck,
    ShieldOff,
    QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { authApi } from "@/lib/apiClient";
import { useAuth } from "@/components/auth/AuthContext";
import { toast } from "sonner";

interface ProfileData {
    full_name: string;
    email: string;
    phone: string;
    address: string;
    business_name: string;
    avatar_url: string;
    whatsapp_connected: boolean;
    currency: string;
    default_interest_rate: number;
    late_fee_policy: string;
    payment_qr_url: string;
    payment_instructions: string;
}

const Profile = () => {
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // MFA state (deshabilitado — no aplica con JWT propio)
    const [mfaEnabled] = useState(false);
    const [showMfaSetup] = useState(false);
    const [showMfaDisable] = useState(false);
    const [mfaQR] = useState("");
    const [mfaSecret] = useState("");
    const [mfaFactorId] = useState("");
    const [mfaCode, setMfaCode] = useState("");
    const [isMfaLoading] = useState(false);

    const checkMfaStatus = async () => { /* MFA no disponible con JWT propio */ };

    const handleEnableMfa = async () => {
        toast.error("2FA no disponible en esta versión");
    };

    const handleVerifyMfa = async () => {
        toast.error("2FA no disponible en esta versión");
    };

    const handleDisableMfa = async () => {
        toast.error("2FA no disponible en esta versión");
    };

    const [profileData, setProfileData] = useState<ProfileData>({
        full_name: "",
        email: "",
        phone: "",
        address: "",
        business_name: "",
        avatar_url: "",
        whatsapp_connected: false,
        currency: "COP",
        default_interest_rate: 20,
        late_fee_policy: "Los pagos atrasados generan un cargo adicional del 5% sobre el valor de la cuota.",
        payment_qr_url: "",
        payment_instructions: "",
    });

    useEffect(() => {
        loadProfile();
        checkMfaStatus();
    }, []);

    const loadProfile = async () => {
        if (!user) { navigate("/login"); return; }
        setProfileData({
            full_name: user.full_name || "",
            email: user.email || "",
            phone: user.phone || "",
            address: user.address || "",
            business_name: user.business_name || "",
            avatar_url: user.avatar_url || "",
            whatsapp_connected: user.whatsapp_connected || false,
            currency: "COP",
            default_interest_rate: 20,
            late_fee_policy: "Los pagos atrasados generan un cargo adicional del 5% sobre el valor de la cuota.",
            payment_qr_url: "",
            payment_instructions: "",
        });
    };

    const handleSave = async () => {
        if (!profileData.full_name) { toast.error("El nombre completo es requerido"); return; }
        setIsSaving(true);
        try {
            await authApi.updateProfile({
                full_name: profileData.full_name,
                business_name: profileData.business_name || null,
                phone: profileData.phone || null,
                address: profileData.address || null,
                avatar_url: profileData.avatar_url || null,
            });
            await refreshUser();
            toast.success("¡Perfil actualizado!");
        } catch (error: any) {
            toast.error("Error al guardar el perfil: " + (error.message || "Error desconocido"));
        } finally {
            setIsSaving(false);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Mi Perfil</h1>
                    <p className="text-muted-foreground">
                        Administra tu información personal y configuración de cuenta
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Profile Card */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Foto de Perfil</CardTitle>
                                <CardDescription>
                                    Personaliza tu imagen de perfil
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex flex-col items-center gap-4">
                                    <Avatar className="w-32 h-32">
                                        <AvatarImage src={profileData.avatar_url} />
                                        <AvatarFallback className="text-2xl bg-gradient-primary text-primary-foreground">
                                            {profileData.full_name ? getInitials(profileData.full_name) : "RC"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <Button variant="outline" size="sm" disabled>
                                        <Camera className="mr-2 w-4 h-4" />
                                        Cambiar Foto
                                    </Button>
                                    <p className="text-xs text-muted-foreground text-center">
                                        JPG, PNG o GIF. Máximo 2MB.
                                    </p>
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <MessageSquare className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">WhatsApp</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {profileData.whatsapp_connected ? "Conectado" : "Desconectado"}
                                                </p>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={profileData.whatsapp_connected}
                                            onCheckedChange={(checked) =>
                                                setProfileData({ ...profileData, whatsapp_connected: checked })
                                            }
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                                                <Shield className="w-5 h-5 text-success" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">Autenticación 2FA</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {mfaEnabled ? "Activado — Google Authenticator / Authy" : "Desactivado"}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant={mfaEnabled ? "destructive" : "outline"}
                                            size="sm"
                                            className="text-xs h-8"
                                            onClick={() => mfaEnabled ? setShowMfaDisable(true) : handleEnableMfa()}
                                            disabled={isMfaLoading}
                                        >
                                            {isMfaLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : mfaEnabled ? <><ShieldOff className="w-3 h-3 mr-1" />Desactivar</> : <><ShieldCheck className="w-3 h-3 mr-1" />Activar</>}
                                        </Button>
                                    </div>

                                    {/* Dialog: Setup MFA */}
                                    <Dialog open={showMfaSetup} onOpenChange={setShowMfaSetup}>
                                        <DialogContent className="w-[92vw] max-w-sm rounded-2xl">
                                            <DialogHeader>
                                                <DialogTitle className="flex items-center gap-2">
                                                    <QrCode className="w-5 h-5 text-primary" />
                                                    Activar Autenticación 2FA
                                                </DialogTitle>
                                                <DialogDescription>
                                                    Escanea el código QR con Google Authenticator o Authy, luego ingresa el código de 6 dígitos.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="flex flex-col items-center gap-4 py-2">
                                                {mfaQR && (
                                                    <img src={mfaQR} alt="QR 2FA" className="w-44 h-44 rounded-xl border p-2 bg-white" />
                                                )}
                                                <div className="text-center">
                                                    <p className="text-xs text-muted-foreground mb-1">O ingresa la clave manual:</p>
                                                    <code className="text-xs bg-muted px-2 py-1 rounded font-mono break-all">{mfaSecret}</code>
                                                </div>
                                                <div className="w-full space-y-2">
                                                    <Label className="text-xs">Código de verificación</Label>
                                                    <InputOTP maxLength={6} value={mfaCode} onChange={setMfaCode}>
                                                        <InputOTPGroup>
                                                            <InputOTPSlot index={0} />
                                                            <InputOTPSlot index={1} />
                                                            <InputOTPSlot index={2} />
                                                            <InputOTPSlot index={3} />
                                                            <InputOTPSlot index={4} />
                                                            <InputOTPSlot index={5} />
                                                        </InputOTPGroup>
                                                    </InputOTP>
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button className="w-full" onClick={handleVerifyMfa} disabled={mfaCode.length !== 6 || isMfaLoading}>
                                                    {isMfaLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                                                    Confirmar y Activar
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>

                                    {/* Dialog: Disable MFA */}
                                    <Dialog open={showMfaDisable} onOpenChange={setShowMfaDisable}>
                                        <DialogContent className="w-[92vw] max-w-sm rounded-2xl">
                                            <DialogHeader>
                                                <DialogTitle className="text-destructive flex items-center gap-2">
                                                    <ShieldOff className="w-5 h-5" />
                                                    Desactivar 2FA
                                                </DialogTitle>
                                                <DialogDescription>
                                                    ¿Estás seguro? Tu cuenta quedará menos protegida.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <DialogFooter className="gap-2">
                                                <Button variant="outline" onClick={() => setShowMfaDisable(false)}>Cancelar</Button>
                                                <Button variant="destructive" onClick={handleDisableMfa} disabled={isMfaLoading}>
                                                    {isMfaLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                                    Sí, desactivar
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                                                <Bell className="w-5 h-5 text-accent" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">Notificaciones</p>
                                                <p className="text-xs text-muted-foreground">Activado</p>
                                            </div>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Information Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Personal Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5 text-primary" />
                                    Información Personal
                                </CardTitle>
                                <CardDescription>
                                    Actualiza tus datos personales y de contacto
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">Nombre Completo *</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                            <Input
                                                id="fullName"
                                                placeholder="Juan Pérez"
                                                value={profileData.full_name}
                                                onChange={(e) =>
                                                    setProfileData({ ...profileData, full_name: e.target.value })
                                                }
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Correo Electrónico *</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="correo@ejemplo.com"
                                                value={profileData.email}
                                                onChange={(e) =>
                                                    setProfileData({ ...profileData, email: e.target.value })
                                                }
                                                className="pl-10"
                                                disabled
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            El correo no se puede modificar
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Teléfono</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                            <Input
                                                id="phone"
                                                type="tel"
                                                placeholder="+57 300 123 4567"
                                                value={profileData.phone}
                                                onChange={(e) =>
                                                    setProfileData({ ...profileData, phone: e.target.value })
                                                }
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="businessName">Nombre del Negocio</Label>
                                        <div className="relative">
                                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                            <Input
                                                id="businessName"
                                                placeholder="Mi Negocio de Préstamos"
                                                value={profileData.business_name}
                                                onChange={(e) =>
                                                    setProfileData({ ...profileData, business_name: e.target.value })
                                                }
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address">Dirección</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 text-muted-foreground w-4 h-4" />
                                        <Textarea
                                            id="address"
                                            placeholder="Calle 123 #45-67, Barrio, Ciudad"
                                            value={profileData.address}
                                            onChange={(e) =>
                                                setProfileData({ ...profileData, address: e.target.value })
                                            }
                                            className="pl-10 min-h-[80px]"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-primary">
                                    <CreditCard className="w-5 h-5" />
                                    Información de Cobro (QR y Cuentas)
                                </CardTitle>
                                <CardDescription>
                                    Configura cómo quieres que tus clientes te paguen
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <Label>Código QR de Pago</Label>
                                        <div className="flex flex-col items-center gap-4 p-4 border-2 border-dashed rounded-xl border-muted">
                                            {profileData.payment_qr_url ? (
                                                <div className="relative group w-40 h-40">
                                                    <img
                                                        src={profileData.payment_qr_url}
                                                        alt="QR de Pago"
                                                        className="w-full h-full object-contain rounded-lg shadow-sm"
                                                    />
                                                    <Button
                                                        variant="destructive"
                                                        size="icon"
                                                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => setProfileData({ ...profileData, payment_qr_url: "" })}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground">
                                                    <Camera className="w-10 h-10 opacity-20" />
                                                    <p className="text-xs">Sube tu QR de Nequi, Daviplata, etc.</p>
                                                </div>
                                            )}
                                            <Input
                                                id="qr_upload"
                                                type="url"
                                                placeholder="Pega el enlace de tu imagen QR aquí"
                                                value={profileData.payment_qr_url}
                                                onChange={(e) => setProfileData({ ...profileData, payment_qr_url: e.target.value })}
                                                className="text-xs"
                                            />
                                            <p className="text-[10px] text-muted-foreground">
                                                Por ahora, pega el link directo de tu imagen QR.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="paymentInstructions">Instrucciones de Cuenta</Label>
                                            <Textarea
                                                id="paymentInstructions"
                                                placeholder="Ej: Nequi: 300 123 4567 | Bancolombia Ahorros: 123-45678-90"
                                                value={profileData.payment_instructions}
                                                onChange={(e) =>
                                                    setProfileData({ ...profileData, payment_instructions: e.target.value })
                                                }
                                                className="min-h-[180px] text-sm"
                                            />
                                        </div>
                                        <p className="text-[10px] text-muted-foreground">
                                            Estos datos aparecerán en los detalles de préstamo para que se los envíes a tus clientes.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Account Statistics */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Estadísticas de Cuenta</CardTitle>
                                <CardDescription>
                                    Información sobre tu actividad en Krédit
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-4 rounded-xl bg-primary/5 border border-primary/20"
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <CheckCircle className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Cuenta Activa</p>
                                                <p className="text-lg font-bold text-foreground">Verificada</p>
                                            </div>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="p-4 rounded-xl bg-success/5 border border-success/20"
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                                                <User className="w-5 h-5 text-success" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Miembro desde</p>
                                                <p className="text-lg font-bold text-foreground">
                                                    {new Date().toLocaleDateString("es-CO", { month: "short", year: "numeric" })}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="p-4 rounded-xl bg-accent/5 border border-accent/20"
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                                                <Shield className="w-5 h-5 text-accent" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Plan</p>
                                                <p className="text-lg font-bold text-foreground">Premium</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Save Button */}
                        <div className="flex justify-end gap-4">
                            <Button
                                variant="outline"
                                onClick={() => navigate("/dashboard")}
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 w-4 h-4" />
                                        Guardar Cambios
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Profile;
