import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
    User,
    Phone,
    Mail,
    MapPin,
    Save,
    CheckCircle,
    ShieldCheck,
    AlertCircle,
    Info,
    DollarSign,
    Calculator,
    Clock,
    Percent,
    Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ClientOnboarding = () => {
    const { lenderId } = useParams();
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [lenderConfig, setLenderConfig] = useState<any>(null);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [calculation, setCalculation] = useState<any>(null);

    const [formData, setFormData] = useState({
        full_name: "",
        phone: "",
        email: "",
        document_number: "",
        address: "",
        city: "",
        occupation: "",
        notes: "",
        // Loan fields
        requested_amount: "",
        installments: "12",
        frequency: "monthly",
    });

    useEffect(() => {
        if (lenderId) loadLenderConfig();
    }, [lenderId]);

    useEffect(() => {
        if (formData.requested_amount) {
            calculateLoan();
        }
    }, [formData.requested_amount, formData.installments, formData.frequency, lenderConfig]);

    const loadLenderConfig = async () => {
        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("full_name, currency, default_interest_rate, late_fee_policy")
                .eq("user_id", lenderId)
                .single();

            if (error) throw error;
            if (data) setLenderConfig(data);
            else setLenderConfig({ full_name: "tu asesor", currency: "COP", default_interest_rate: 20, late_fee_policy: "" });
        } catch (e) {
            console.error("Error loading lender config:", e);
            // Usar config por defecto para que el formulario funcione igual
            setLenderConfig({ full_name: "tu asesor", currency: "COP", default_interest_rate: 20, late_fee_policy: "" });
        }
    };

    const calculateLoan = () => {
        const principal = parseFloat(formData.requested_amount);
        const rate = (lenderConfig?.default_interest_rate || 20) / 100;
        const installments = parseInt(formData.installments);

        if (isNaN(principal) || isNaN(installments)) return;

        // Simple interest calculation (matching NewLoan logic)
        const totalInterest = principal * rate;
        const totalAmount = principal + totalInterest;
        const installmentAmount = totalAmount / installments;

        setCalculation({
            totalInterest,
            totalAmount,
            installmentAmount,
        });
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!acceptedTerms) {
            toast.error("Debes aceptar los términos y condiciones para continuar.");
            return;
        }

        setIsLoading(true);
        try {
            // 1. Create Client
            const { data: clientData, error: clientError } = await supabase
                .from("clients")
                .insert({
                    user_id: lenderId,
                    full_name: formData.full_name,
                    phone: formData.phone,
                    email: formData.email || null,
                    document_number: formData.document_number || null,
                    address: formData.address || null,
                    city: formData.city || null,
                    occupation: formData.occupation || null,
                    notes: `Solicitud vía Link Web. Aceptó términos: ${lenderConfig?.late_fee_policy}`,
                    status: "active"
                })
                .select()
                .single();

            if (clientError) throw clientError;

            // 2. Create Loan (Pending)
            if (calculation) {
                const loanNumber = `REQ-${Date.now().toString().slice(-6)}`;
                const startDate = new Date().toISOString().split('T')[0];
                // Calcular end_date según frecuencia e installments
                const endDateObj = new Date();
                const inst = parseInt(formData.installments) || 1;
                const freq = formData.frequency;
                for (let i = 0; i < inst; i++) {
                    if (freq === 'daily') endDateObj.setDate(endDateObj.getDate() + 1);
                    else if (freq === 'weekly') endDateObj.setDate(endDateObj.getDate() + 7);
                    else if (freq === 'biweekly') endDateObj.setDate(endDateObj.getDate() + 15);
                    else endDateObj.setMonth(endDateObj.getMonth() + 1);
                }
                const endDate = endDateObj.toISOString().split('T')[0];

                const { error: loanError } = await supabase.from("loans").insert({
                    user_id: lenderId,
                    client_id: clientData.id,
                    loan_number: loanNumber,
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
                    notes: `Solicitud enviada por el cliente. ${formData.notes || ""}`,
                    start_date: startDate,
                    end_date: endDate,
                });

                if (loanError) throw loanError;
            }

            setIsSuccess(true);
            toast.success("¡Solicitud enviada con éxito!");
        } catch (error: any) {
            console.error("Error submitting onboarding:", error);
            toast.error("Error al enviar la información. Por favor intenta de nuevo.");
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: lenderConfig?.currency || "COP",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4 text-center">
                <Card className="max-w-md p-8 border-primary/20 shadow-2xl">
                    <CheckCircle className="w-16 h-16 text-primary mx-auto mb-6" />
                    <h1 className="text-2xl font-bold mb-2">¡Solicitud Enviada!</h1>
                    <p className="text-muted-foreground mb-6">
                        Gracias {formData.full_name.split(' ')[0]}. Tu solicitud ha sido enviada a {lenderConfig?.full_name || 'tu asesor'}.
                        Te contactaremos pronto por WhatsApp o Teléfono.
                    </p>
                    <Button onClick={() => window.location.reload()}>Volver</Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/30 py-8 px-4">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header informativo */}
                <div className="text-center space-y-4">
                    <img src="/logo.png" alt="Logo" className="w-20 h-20 mx-auto" />
                    <h1 className="text-3xl font-bold">Solicitud de Préstamo Rápido</h1>
                    <p className="text-muted-foreground">Estás solicitando un crédito con {lenderConfig?.full_name || 'tu asesor financiero'}</p>

                    <div className="flex flex-wrap justify-center gap-3">
                        <div className="bg-primary/10 text-primary border border-primary/20 rounded-full px-4 py-1 text-sm flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            Moneda: {lenderConfig?.currency || 'COP'}
                        </div>
                        <div className="bg-primary/10 text-primary border border-primary/20 rounded-full px-4 py-1 text-sm flex items-center gap-2">
                            <Percent className="w-4 h-4" />
                            Interés: {lenderConfig?.default_interest_rate || '20'}% mensual
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3 space-y-6">
                        {/* Datos Personales */}
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5 text-primary" />
                                    Tus Datos Personales
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Nombre completo *</Label>
                                    <Input required value={formData.full_name} onChange={(e) => handleChange("full_name", e.target.value)} placeholder="Juan Pérez" />
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>WhatsApp / Teléfono *</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                            <Input required className="pl-10" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} placeholder="300 123 4567" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Documento de Identidad *</Label>
                                        <Input required value={formData.document_number} onChange={(e) => handleChange("document_number", e.target.value)} placeholder="CC / ID" />
                                    </div>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Ciudad</Label>
                                        <Input value={formData.city} onChange={(e) => handleChange("city", e.target.value)} placeholder="Bogotá" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Ocupación</Label>
                                        <Input value={formData.occupation} onChange={(e) => handleChange("occupation", e.target.value)} placeholder="Comerciante, Empleado..." />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Datos del Préstamo */}
                        <Card className="shadow-lg border-primary/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calculator className="w-5 h-5 text-primary" />
                                    ¿Cuánto necesitas?
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Monto del Préstamo *</Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                            <Input required type="number" className="pl-10 text-xl font-bold" value={formData.requested_amount} onChange={(e) => handleChange("requested_amount", e.target.value)} placeholder="1,000,000" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Número de Cuotas</Label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                            <Input required type="number" className="pl-10" value={formData.installments} onChange={(e) => handleChange("installments", e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Frecuencia de Pago</Label>
                                    <Select value={formData.frequency} onValueChange={(v) => handleChange("frequency", v)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="daily">Diario</SelectItem>
                                            <SelectItem value="weekly">Semanal</SelectItem>
                                            <SelectItem value="biweekly">Quincenal</SelectItem>
                                            <SelectItem value="monthly">Mensual</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>¿Para qué necesitas el dinero? (Opcional)</Label>
                                    <Textarea value={formData.notes} onChange={(e) => handleChange("notes", e.target.value)} placeholder="Compra de mercancía, emergencia, etc." />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        {/* Resumen de Cálculo */}
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
                                            <p className="text-3xl font-black text-primary">{formatCurrency(calculation.installmentAmount)}</p>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground font-medium">Monto solicitado:</span>
                                                <span className="font-bold">{formatCurrency(parseFloat(formData.requested_amount))}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground font-medium">Interés total (20%):</span>
                                                <span>{formatCurrency(calculation.totalInterest)}</span>
                                            </div>
                                            <div className="flex justify-between border-t pt-2 mt-2">
                                                <span className="font-bold">Total a pagar:</span>
                                                <span className="font-bold text-lg">{formatCurrency(calculation.totalAmount)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-muted-foreground">
                                        <Calculator className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                        <p className="text-sm">Ingresa el monto para ver el cálculo</p>
                                    </div>
                                )}

                                {/* Términos y Advertencias */}
                                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                    <div className="flex items-center gap-2 text-yellow-800 font-bold mb-2">
                                        <AlertCircle className="w-4 h-4" />
                                        Términos de Mora
                                    </div>
                                    <p className="text-[12px] text-yellow-900 leading-tight mb-4">
                                        {lenderConfig?.late_fee_policy || "Los pagos deben realizarse en las fechas pactadas. Se generarán cargos adicionales por mora si hay retrasos."}
                                    </p>
                                    <div className="flex items-start gap-2">
                                        <Checkbox
                                            id="terms"
                                            checked={acceptedTerms}
                                            onCheckedChange={(c) => setAcceptedTerms(c as boolean)}
                                            className="mt-1 border-yellow-400"
                                        />
                                        <label htmlFor="terms" className="text-[11px] font-medium text-yellow-900 cursor-pointer">
                                            He leído y acepto los cargos por mora y las condiciones de cobro del prestamista.
                                        </label>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading || !acceptedTerms || !formData.full_name || !formData.phone || !formData.document_number || !formData.requested_amount}
                                    className="w-full h-14 text-lg bg-primary hover:bg-primary-hover shadow-glow"
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
