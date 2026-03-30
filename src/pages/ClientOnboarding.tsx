import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
    User, Phone, Mail, MapPin, Save, CheckCircle, ShieldCheck,
    AlertCircle, DollarSign, Calculator, Clock, Percent, Briefcase, Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/apiClient";
import { toast } from "sonner";

const ClientOnboarding = () => {
    const { lenderId } = useParams();
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [lenderConfig, setLenderConfig] = useState<any>(null);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [calculation, setCalculation] = useState<any>(null);

    const [formData, setFormData] = useState({
        // Datos personales
        full_name: "",
        document_type: "CC",
        document_number: "",
        phone: "",
        email: "",
        // Ubicación y trabajo
        address: "",
        city: "",
        occupation: "",
        monthly_income: "",
        // Referencia
        reference_name: "",
        reference_phone: "",
        reference_relationship: "",
        // Notas
        notes: "",
        // Préstamo
        requested_amount: "",
        installments: "12",
        frequency: "monthly",
    });

    useEffect(() => {
        if (lenderId) loadLenderConfig();
    }, [lenderId]);

    useEffect(() => {
        if (formData.requested_amount) calculateLoan();
    }, [formData.requested_amount, formData.installments, formData.frequency, lenderConfig]);

    const loadLenderConfig = async () => {
        // Config pública del prestamista — usar defaults por ahora
        setLenderConfig({ full_name: "tu asesor", currency: "COP", default_interest_rate: 20, late_fee_policy: "" });
    };

    const calculateLoan = () => {
        const principal = parseFloat(formData.requested_amount);
        const rate = (lenderConfig?.default_interest_rate || 20) / 100;
        const installments = parseInt(formData.installments);
        if (isNaN(principal) || isNaN(installments) || principal <= 0) return;
        const totalInterest = principal * rate;
        const totalAmount = principal + totalInterest;
        setCalculation({ totalInterest, totalAmount, installmentAmount: totalAmount / installments });
    };

    const handleChange = (field: string, value: string) =>
        setFormData(prev => ({ ...prev, [field]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!acceptedTerms) { toast.error("Debes aceptar los términos para continuar."); return; }

        setIsLoading(true);
        try {
            const clientData = await api.post<any>(`/api/clients`, {
                full_name: formData.full_name,
                document_type: formData.document_type,
                document_number: formData.document_number || null,
                phone: formData.phone,
                email: formData.email || null,
                address: formData.address || null,
                city: formData.city || null,
                occupation: formData.occupation || null,
                monthly_income: formData.monthly_income ? parseFloat(formData.monthly_income) : null,
                reference_name: formData.reference_name || null,
                reference_phone: formData.reference_phone || null,
                reference_relationship: formData.reference_relationship || null,
                notes: formData.notes || `Solicitud vía Link Web.`,
                status: "active",
            });

            if (calculation) {
                const endDateObj = new Date();
                const inst = parseInt(formData.installments) || 1;
                for (let i = 0; i < inst; i++) {
                    if (formData.frequency === 'daily') endDateObj.setDate(endDateObj.getDate() + 1);
                    else if (formData.frequency === 'weekly') endDateObj.setDate(endDateObj.getDate() + 7);
                    else if (formData.frequency === 'biweekly') endDateObj.setDate(endDateObj.getDate() + 15);
                    else endDateObj.setMonth(endDateObj.getMonth() + 1);
                }
                await api.post('/api/loans', {
                    client_id: clientData.id,
                    principal_amount: parseFloat(formData.requested_amount),
                    interest_rate: lenderConfig?.default_interest_rate || 20,
                    interest_type: "simple",
                    total_interest: calculation.totalInterest,
                    total_amount: calculation.totalAmount,
                    remaining_amount: calculation.totalAmount,
                    paid_amount: 0,
                    installments: inst,
                    installment_amount: calculation.installmentAmount,
                    frequency: formData.frequency,
                    status: "pending",
                    notes: `Solicitud del cliente. ${formData.notes || ""}`,
                    start_date: new Date().toISOString().split('T')[0],
                    end_date: endDateObj.toISOString().split('T')[0],
                });
            }

            setIsSuccess(true);
            toast.success("¡Solicitud enviada con éxito!");
        } catch (error: any) {
            console.error(error);
            toast.error("Error al enviar. Por favor intenta de nuevo.");
        } finally {
            setIsLoading(false);
        }
    };

    const fmt = (n: number) => new Intl.NumberFormat("es-CO", {
        style: "currency", currency: lenderConfig?.currency || "COP",
        minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(n);

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4 text-center">
                <Card className="max-w-md p-8 border-primary/20 shadow-2xl">
                    <CheckCircle className="w-16 h-16 text-primary mx-auto mb-6" />
                    <h1 className="text-2xl font-bold mb-2">¡Solicitud Enviada!</h1>
                    <p className="text-muted-foreground mb-6">
                        Gracias {formData.full_name.split(' ')[0]}. Tu solicitud fue enviada a {lenderConfig?.full_name || 'tu asesor'}.
                        Te contactaremos pronto.
                    </p>
                    <Button onClick={() => window.location.reload()}>Nueva solicitud</Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/30 py-8 px-4">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-3">
                    <h1 className="text-3xl font-bold">Solicitud de Préstamo</h1>
                    <p className="text-muted-foreground">Con {lenderConfig?.full_name || 'tu asesor financiero'}</p>
                    <div className="flex flex-wrap justify-center gap-3">
                        <span className="bg-primary/10 text-primary border border-primary/20 rounded-full px-4 py-1 text-sm flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />{lenderConfig?.currency || 'COP'}
                        </span>
                        <span className="bg-primary/10 text-primary border border-primary/20 rounded-full px-4 py-1 text-sm flex items-center gap-2">
                            <Percent className="w-4 h-4" />{lenderConfig?.default_interest_rate || 20}% interés
                        </span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3 space-y-6">

                        {/* Información Personal */}
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <User className="w-5 h-5 text-primary" />Información Personal
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Nombre completo *</Label>
                                    <Input required value={formData.full_name} onChange={e => handleChange("full_name", e.target.value)} placeholder="Juan Pérez García" />
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Tipo de documento</Label>
                                        <Select value={formData.document_type} onValueChange={v => handleChange("document_type", v)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                                                <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                                                <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
                                                <SelectItem value="PA">Pasaporte</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Número de documento *</Label>
                                        <Input required value={formData.document_number} onChange={e => handleChange("document_number", e.target.value)} placeholder="1234567890" />
                                    </div>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Teléfono / WhatsApp *</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                            <Input required className="pl-10" value={formData.phone} onChange={e => handleChange("phone", e.target.value)} placeholder="300 123 4567" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Correo electrónico</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                            <Input type="email" className="pl-10" value={formData.email} onChange={e => handleChange("email", e.target.value)} placeholder="correo@ejemplo.com" />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Ubicación y Trabajo */}
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Briefcase className="w-5 h-5 text-primary" />Ubicación y Trabajo
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Dirección</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                        <Input className="pl-10" value={formData.address} onChange={e => handleChange("address", e.target.value)} placeholder="Calle 123 # 45-67" />
                                    </div>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Ciudad</Label>
                                        <Input value={formData.city} onChange={e => handleChange("city", e.target.value)} placeholder="Bogotá" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Ocupación</Label>
                                        <Input value={formData.occupation} onChange={e => handleChange("occupation", e.target.value)} placeholder="Comerciante, Empleado..." />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Ingreso mensual</Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                        <Input type="number" className="pl-10" value={formData.monthly_income} onChange={e => handleChange("monthly_income", e.target.value)} placeholder="1,500,000" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Referencia Personal */}
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Users className="w-5 h-5 text-primary" />Referencia Personal
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Nombre de referencia</Label>
                                        <Input value={formData.reference_name} onChange={e => handleChange("reference_name", e.target.value)} placeholder="María García" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Teléfono de referencia</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                            <Input className="pl-10" value={formData.reference_phone} onChange={e => handleChange("reference_phone", e.target.value)} placeholder="310 987 6543" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Parentesco</Label>
                                    <Select value={formData.reference_relationship} onValueChange={v => handleChange("reference_relationship", v)}>
                                        <SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Familiar">Familiar</SelectItem>
                                            <SelectItem value="Cónyuge">Cónyuge</SelectItem>
                                            <SelectItem value="Amigo">Amigo/a</SelectItem>
                                            <SelectItem value="Compañero de trabajo">Compañero de trabajo</SelectItem>
                                            <SelectItem value="Vecino">Vecino/a</SelectItem>
                                            <SelectItem value="Otro">Otro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Datos del Préstamo */}
                        <Card className="shadow-lg border-primary/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Calculator className="w-5 h-5 text-primary" />¿Cuánto necesitas?
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Monto del préstamo *</Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                            <Input required type="number" className="pl-10 font-bold" value={formData.requested_amount} onChange={e => handleChange("requested_amount", e.target.value)} placeholder="1,000,000" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Número de cuotas</Label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                            <Input required type="number" className="pl-10" value={formData.installments} onChange={e => handleChange("installments", e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Frecuencia de pago</Label>
                                    <Select value={formData.frequency} onValueChange={v => handleChange("frequency", v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="daily">Diario</SelectItem>
                                            <SelectItem value="weekly">Semanal</SelectItem>
                                            <SelectItem value="biweekly">Quincenal</SelectItem>
                                            <SelectItem value="monthly">Mensual</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Notas adicionales</Label>
                                    <Textarea value={formData.notes} onChange={e => handleChange("notes", e.target.value)} placeholder="¿Para qué necesitas el dinero? Compra de mercancía, emergencia, etc." className="resize-none" rows={3} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar resumen */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="sticky top-6 shadow-xl border-primary/20 overflow-hidden">
                            <div className="bg-primary h-2 w-full" />
                            <CardHeader>
                                <CardTitle className="text-lg">Resumen de tu Solicitud</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {calculation ? (
                                    <div className="space-y-4">
                                        <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                                            <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Tu cuota sería de:</p>
                                            <p className="text-3xl font-black text-primary">{fmt(calculation.installmentAmount)}</p>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Monto solicitado:</span>
                                                <span className="font-bold">{fmt(parseFloat(formData.requested_amount))}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Interés ({lenderConfig?.default_interest_rate || 20}%):</span>
                                                <span>{fmt(calculation.totalInterest)}</span>
                                            </div>
                                            <div className="flex justify-between border-t pt-2">
                                                <span className="font-bold">Total a pagar:</span>
                                                <span className="font-bold text-lg">{fmt(calculation.totalAmount)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-muted-foreground">
                                        <Calculator className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                        <p className="text-sm">Ingresa el monto para ver el cálculo</p>
                                    </div>
                                )}

                                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                    <div className="flex items-center gap-2 text-yellow-800 font-bold mb-2">
                                        <AlertCircle className="w-4 h-4" />Términos de Mora
                                    </div>
                                    <p className="text-[12px] text-yellow-900 leading-tight mb-4">
                                        {lenderConfig?.late_fee_policy || "Los pagos deben realizarse en las fechas pactadas. Se generarán cargos adicionales por mora."}
                                    </p>
                                    <div className="flex items-start gap-2">
                                        <Checkbox id="terms" checked={acceptedTerms} onCheckedChange={c => setAcceptedTerms(c as boolean)} className="mt-1 border-yellow-400" />
                                        <label htmlFor="terms" className="text-[11px] font-medium text-yellow-900 cursor-pointer">
                                            He leído y acepto los cargos por mora y las condiciones del prestamista.
                                        </label>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading || !acceptedTerms || !formData.full_name || !formData.phone || !formData.document_number || !formData.requested_amount}
                                    className="w-full h-14 text-lg bg-primary hover:bg-primary/90"
                                >
                                    {isLoading ? "Enviando..." : "Enviar Solicitud"}
                                    <Save className="ml-2 w-5 h-5" />
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </form>

                <div className="text-center py-8">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs">
                        <ShieldCheck className="w-4 h-4 text-primary" />
                        Tus datos viajan encriptados y seguros con Krédit
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientOnboarding;
