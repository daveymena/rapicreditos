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
import { supabase } from "@/integrations/supabase/client";
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
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [userId, setUserId] = useState<string>("");
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
    }, []);

    const loadProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate("/login");
                return;
            }

            setUserId(user.id);

            // Load profile data
            const { data: profile, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("user_id", user.id)
                .single();

            if (error && error.code !== "PGRST116") {
                throw error;
            }

            if (profile) {
                const data = profile as any;
                setProfileData({
                    full_name: data.full_name || "",
                    email: data.email || user.email || "",
                    phone: data.phone || "",
                    address: data.address || "",
                    business_name: data.business_name || "",
                    avatar_url: data.avatar_url || "",
                    whatsapp_connected: data.whatsapp_connected || false,
                    currency: data.currency || "COP",
                    default_interest_rate: data.default_interest_rate || 20,
                    late_fee_policy: data.late_fee_policy || "Los pagos atrasados generan un cargo adicional del 5% sobre el valor de la cuota.",
                    payment_qr_url: data.payment_qr_url || "",
                    payment_instructions: data.payment_instructions || "",
                });
            } else {
                setProfileData({ ...profileData, email: user.email || "" });
            }
        } catch (error) {
            console.error("Error loading profile:", error);
            toast.error("Error al cargar el perfil");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!profileData.full_name) {
            toast.error("El nombre completo es requerido");
            return;
        }

        setIsSaving(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate("/login");
                return;
            }

            const { data: existingProfile } = await supabase
                .from("profiles")
                .select("id")
                .eq("user_id", user.id)
                .single();

            const profilePayload = {
                user_id: user.id,
                full_name: profileData.full_name,
                email: profileData.email,
                phone: profileData.phone || null,
                address: profileData.address || null,
                business_name: profileData.business_name || null,
                avatar_url: profileData.avatar_url || null,
                whatsapp_connected: profileData.whatsapp_connected,
                updated_at: new Date().toISOString(),
            };

            const { error } = existingProfile
                ? await supabase.from("profiles").update(profilePayload).eq("user_id", user.id)
                : await supabase.from("profiles").insert([profilePayload]);

            if (error) throw error;

            toast.success("¡Perfil y configuración actualizados!");
            loadProfile(); // Reload to sync
        } catch (error: any) {
            console.error("Error saving profile:", error);
            if (error.code === "PGRST204" || error.message?.includes("column")) {
                toast.error("Error de base de datos: Faltan columnas en la tabla profiles. Por favor, ejecuta el script SQL de reparación en Supabase.", {
                    duration: 6000,
                });
            } else {
                toast.error("Error al guardar el perfil: " + (error.message || "Error desconocido"));
            }
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
                                                <p className="text-xs text-muted-foreground">Desactivado</p>
                                            </div>
                                        </div>
                                        <Switch disabled />
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
