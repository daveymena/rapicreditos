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
    CreditCard,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
    payment_qr_url: string;
    payment_instructions: string;
    two_factor_enabled: boolean;
}

const Profile = () => {
    const navigate = useNavigate();
    const { user, refreshUser, loading: authLoading } = useAuth();
    const [isSaving, setIsSaving] = useState(false);

    const [profileData, setProfileData] = useState<ProfileData>({
        full_name: "",
        email: "",
        phone: "",
        address: "",
        business_name: "",
        avatar_url: "",
        whatsapp_connected: false,
        payment_qr_url: "",
        payment_instructions: "",
        two_factor_enabled: false,
    });

    useEffect(() => {
        if (user) {
            setProfileData({
                full_name: user.full_name || "",
                email: user.email || "",
                phone: user.phone || "",
                address: user.address || "",
                business_name: user.business_name || "",
                avatar_url: user.avatar_url || "",
                whatsapp_connected: user.whatsapp_connected || false,
                payment_qr_url: (user as any).payment_qr_url || "",
                payment_instructions: (user as any).payment_instructions || "",
                two_factor_enabled: (user as any).two_factor_enabled || false,
            });
        }
    }, [user]);

    const handleSave = async () => {
        if (!profileData.full_name) { 
            toast.error("El nombre completo es requerido"); 
            return; 
        }
        setIsSaving(true);
        try {
            await authApi.updateProfile({
                full_name: profileData.full_name,
                business_name: profileData.business_name || null,
                phone: profileData.phone || null,
                address: profileData.address || null,
                avatar_url: profileData.avatar_url || null,
                payment_qr_url: profileData.payment_qr_url || null,
                payment_instructions: profileData.payment_instructions || null,
                two_factor_enabled: profileData.two_factor_enabled,
            });
            await refreshUser();
            toast.success("¡Perfil actualizado!");
        } catch (error: any) {
            toast.error("Error al guardar el perfil");
        } finally {
            setIsSaving(false);
        }
    };

    const getInitials = (name: string) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: "avatar_url" | "payment_qr_url") => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error("La imagen es demasiado grande. Máximo 2MB.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            setProfileData(prev => ({ ...prev, [field]: base64 }));
        };
        reader.readAsDataURL(file);
    };

    if (authLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    if (!user) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
                        <h2 className="text-xl font-bold mb-2">Error al cargar perfil</h2>
                        <p className="text-muted-foreground mb-4">No se pudo cargar la información del usuario</p>
                        <Button onClick={() => navigate("/dashboard")}>Volver al Dashboard</Button>
                    </div>
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
                                    <div className="relative group">
                                        <Avatar className="w-32 h-32 border-4 border-card shadow-2xl">
                                            <AvatarImage src={profileData.avatar_url} />
                                            <AvatarFallback className="text-2xl bg-gradient-primary text-primary-foreground">
                                                {getInitials(profileData.full_name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <label 
                                            htmlFor="avatar-upload" 
                                            className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-all border-4 border-card"
                                        >
                                            <Camera className="w-5 h-5" />
                                            <input 
                                                id="avatar-upload" 
                                                type="file" 
                                                accept="image/*" 
                                                className="hidden" 
                                                onChange={(e) => handleFileChange(e, "avatar_url")} 
                                            />
                                        </label>
                                    </div>
                                    <p className="text-xs text-muted-foreground text-center">
                                        JPG, PNG o GIF. Máximo 2MB.
                                    </p>

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
                                            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                                                <Shield className="w-5 h-5 text-destructive" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">Seguridad (2FA)</p>
                                                <p className="text-xs text-muted-foreground">Doble Factor</p>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={profileData.two_factor_enabled}
                                            onCheckedChange={(checked) =>
                                                setProfileData({ ...profileData, two_factor_enabled: checked })
                                            }
                                        />
                                    </div>

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
                                        <div className="flex flex-col items-center gap-4 w-full">
                                            <div className="relative w-full aspect-square max-w-[200px] border-2 border-dashed rounded-2xl border-muted bg-muted/20 flex items-center justify-center overflow-hidden group">
                                                {profileData.payment_qr_url ? (
                                                    <>
                                                        <img
                                                            src={profileData.payment_qr_url}
                                                            alt="QR de Pago"
                                                            className="w-full h-full object-contain p-2"
                                                        />
                                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                            <label htmlFor="qr-upload-change" className="p-2 bg-white/20 hover:bg-white/40 rounded-full cursor-pointer transition-colors">
                                                                <Camera className="w-5 h-5 text-white" />
                                                            </label>
                                                            <button 
                                                                onClick={() => setProfileData({ ...profileData, payment_qr_url: "" })}
                                                                className="p-2 bg-red-500/80 hover:bg-red-600 rounded-full transition-colors"
                                                            >
                                                                <X className="w-5 h-5 text-white" />
                                                            </button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <label htmlFor="qr-upload" className="flex flex-col items-center justify-center cursor-pointer w-full h-full hover:bg-muted/40 transition-colors gap-2">
                                                        <Camera className="w-10 h-10 opacity-20" />
                                                        <p className="text-xs text-muted-foreground font-medium">Subir Imagen QR</p>
                                                        <input 
                                                            id="qr-upload" 
                                                            type="file" 
                                                            accept="image/*" 
                                                            className="hidden" 
                                                            onChange={(e) => handleFileChange(e, "payment_qr_url")} 
                                                        />
                                                    </label>
                                                )}
                                                <input 
                                                    id="qr-upload-change" 
                                                    type="file" 
                                                    accept="image/*" 
                                                    className="hidden" 
                                                    onChange={(e) => handleFileChange(e, "payment_qr_url")} 
                                                />
                                            </div>
                                            <p className="text-[10px] text-muted-foreground text-center">
                                                Sube tu QR de Nequi, Daviplata o cualquier cuenta para que tus clientes lo vean.
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
                                                    {new Date(user.created_at).toLocaleDateString("es-CO", { month: "short", year: "numeric" })}
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
                                                <p className="text-lg font-bold text-foreground">
                                                    {user.subscription_status === "pro" ? "Premium" : "Gratis"}
                                                </p>
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
