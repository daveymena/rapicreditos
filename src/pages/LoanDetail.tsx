import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Calendar,
    DollarSign,
    Clock,
    CheckCircle,
    AlertCircle,
    Plus,
    Download,
    Phone,
    User,
    TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Loan {
    id: string;
    loan_number: string;
    principal_amount: number;
    total_amount: number;
    remaining_amount: number;
    paid_amount: number;
    interest_rate: number;
    interest_type?: string;
    installment_amount: number;
    installments: number;
    paid_installments: number;
    frequency: string;
    status: string;
    start_date: string;
    end_date: string;
    notes: string;
    clients: {
        id: string;
        full_name: string;
        phone: string;
        email: string;
    };
}

interface Payment {
    id: string;
    amount: number;
    payment_date: string;
    payment_number: number;
    payment_method: string;
    notes: string;
}


import { calculateEndDate, generateSchedule, Frequency } from "@/lib/loanUtils";
import { jsPDF } from "jspdf";
import { formatCurrency } from "@/lib/utils";

const LoanDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loan, setLoan] = useState<Loan | null>(null);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [schedule, setSchedule] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSavingPayment, setIsSavingPayment] = useState(false);
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);
    const [showLateFeeDialog, setShowLateFeeDialog] = useState(false);
    const [isSavingLateFee, setIsSavingLateFee] = useState(false);
    const [lateFeeForm, setLateFeeForm] = useState({
        amount: "",
        reason: "",
        days: ""
    });

    // Payment form
    const [paymentForm, setPaymentForm] = useState({
        amount: "",
        method: "Efectivo",
        notes: "",
        installmentNumber: ""
    });

    useEffect(() => {
        if (id) {
            loadLoanData();
            loadPayments();
        }
    }, [id]);

    const loadLoanData = async () => {
        try {
            const { data, error } = await supabase
                .from("loans")
                .select(`
                    *,
                    clients (id, full_name, phone, email)
                `)
                .eq("id", id)
                .single();

            if (error) throw error;
            const loanData = data as any;
            setLoan(loanData);

            // Generate schedule for display
            const generatedSchedule = generateSchedule(
                loanData.start_date,
                loanData.frequency as Frequency,
                loanData.installments,
                loanData.installment_amount,
                loanData.paid_installments
            );
            setSchedule(generatedSchedule);

            // Set suggested payment amount
            setPaymentForm(prev => ({
                ...prev,
                amount: loanData.installment_amount.toString(),
                installmentNumber: (loanData.paid_installments + 1).toString()
            }));

        } catch (error) {
            console.error("Error loading loan:", error);
            toast.error("No se pudo cargar el préstamo");
        } finally {
            setIsLoading(false);
        }
    };

    const loadPayments = async () => {
        try {
            const { data, error } = await supabase
                .from("payments")
                .select("*")
                .eq("loan_id", id)
                .order("payment_date", { ascending: false });

            if (error) throw error;
            setPayments(data || []);
        } catch (error) {
            console.error("Error loading payments:", error);
        }
    };

    const handleRegisterPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!loan) return;

        const amount = parseFloat(paymentForm.amount);
        if (isNaN(amount) || amount <= 0) {
            toast.error("Monto inválido");
            return;
        }

        setIsSavingPayment(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Register Payment
            const { error: paymentError } = await supabase.from("payments").insert({
                loan_id: loan.id,
                user_id: user.id,
                amount: amount,
                payment_date: new Date().toISOString(),
                payment_number: parseInt(paymentForm.installmentNumber) || (loan.paid_installments || 0) + 1,
                payment_method: paymentForm.method,
                notes: paymentForm.notes,
                due_date: new Date().toISOString()
            });

            if (paymentError) throw paymentError;

            // 2. Update Loan Status
            const newPaidAmount = (loan.paid_amount || 0) + amount;
            const newRemainingAmount = Math.max(0, loan.total_amount - newPaidAmount);

            // If they paid exactly the installment amount or more, we count it as a paid installment
            // For simplicity, we increment paid_installments
            const newPaidInstallments = (loan.paid_installments || 0) + 1;
            const newStatus = newRemainingAmount <= 0 ? "completed" : "active";

            const { error: loanUpdateError } = await supabase
                .from("loans")
                .update({
                    paid_amount: newPaidAmount,
                    remaining_amount: newRemainingAmount,
                    paid_installments: newPaidInstallments,
                    status: newStatus,
                    updated_at: new Date().toISOString()
                })
                .eq("id", loan.id);

            if (loanUpdateError) throw loanUpdateError;

            toast.success("¡Pago registrado exitosamente!");
            setShowPaymentDialog(false);
            setPaymentForm({ amount: loan.installment_amount.toString(), method: "Efectivo", notes: "", installmentNumber: (newPaidInstallments + 1).toString() });
            loadLoanData();
            loadPayments();
        } catch (error: any) {
            console.error("Error registering payment:", error);
            toast.error(error.message || "Error al registrar el pago");
        } finally {
            setIsSavingPayment(false);
        }
    };

    const handleRegisterLateFee = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!loan) return;

        const amount = parseFloat(lateFeeForm.amount);
        if (isNaN(amount) || amount <= 0) {
            toast.error("Monto inválido");
            return;
        }

        setIsSavingLateFee(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Registrar la multa como un pago con late_fee
            const { error: feeError } = await supabase.from("payments").insert({
                loan_id: loan.id,
                user_id: user.id,
                amount: amount,
                late_fee: amount,
                payment_date: new Date().toISOString(),
                payment_number: 0,
                payment_method: "Multa por mora",
                notes: lateFeeForm.reason || `Mora de ${lateFeeForm.days || "?"} días`,
                due_date: new Date().toISOString()
            });

            if (feeError) throw feeError;

            // Sumar la multa al saldo pendiente
            const { error: loanUpdateError } = await supabase
                .from("loans")
                .update({
                    remaining_amount: loan.remaining_amount + amount,
                    total_amount: loan.total_amount + amount,
                    status: "defaulted",
                    updated_at: new Date().toISOString()
                })
                .eq("id", loan.id);

            if (loanUpdateError) throw loanUpdateError;

            toast.success(`Multa de ${formatCurrency(amount)} aplicada`);
            setShowLateFeeDialog(false);
            setLateFeeForm({ amount: "", reason: "", days: "" });
            loadLoanData();
            loadPayments();
        } catch (error: any) {
            toast.error(error.message || "Error al aplicar la multa");
        } finally {
            setIsSavingLateFee(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const configs: any = {
            active: { label: "Activo", variant: "default" },
            completed: { label: "Pagado", variant: "outline" },
            defaulted: { label: "En Mora", variant: "destructive" },
            pending: { label: "Pendiente", variant: "secondary" }
        };
        const config = configs[status] || configs.pending;
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const handleDownloadReceipt = (payment: Payment) => {
        if (!loan) return;
        const toastId = toast.loading("Generando recibo PDF...");

        try {
            // Usar dimensiones estándar de ticket (80mm)
            const doc = new jsPDF('p', 'mm', [80, 150]);

            doc.setFont("courier", "bold");
            doc.setFontSize(14);
            doc.text("Kredit SAAS", 40, 15, { align: "center" });

            doc.setFontSize(10);
            doc.text("RECIBO DE CAJA", 40, 22, { align: "center" });
            doc.line(10, 25, 70, 25);

            doc.setFont("courier", "normal");
            doc.text(`Fecha: ${new Date(payment.payment_date).toLocaleDateString()}`, 10, 35);
            doc.text(`Credito: ${loan.loan_number}`, 10, 42);
            doc.text(`Cliente: ${loan.clients?.full_name}`, 10, 49);
            doc.text(`Metodo: ${payment.payment_method}`, 10, 56);

            doc.setFontSize(16);
            doc.setFont("courier", "bold");
            doc.text(formatCurrency(payment.amount), 40, 70, { align: "center" });

            doc.setFontSize(10);
            doc.text(`Concepto: Abono #${payment.payment_number}`, 10, 85);

            doc.line(10, 95, 70, 95);
            doc.text("¡PAGO EXITOSO!", 40, 105, { align: "center" });

            const fileName = `Recibo_${loan.loan_number}_A${payment.payment_number}.pdf`;
            doc.save(fileName);
            toast.success("Recibo descargado", { id: toastId });
        } catch (error) {
            console.error("PDF Error:", error);
            toast.error("Error al generar el PDF", { id: toastId });
        }
    };

    const handleDownloadPazYSalvo = () => {
        if (!loan) return;
        const toastId = toast.loading("Generando Paz y Salvo...");

        try {
            const doc = new jsPDF();
            const date = new Date().toLocaleDateString();

            doc.setFontSize(22);
            doc.setFont("helvetica", "bold");
            doc.text("CERTIFICADO DE PAZ Y SALVO", 105, 40, { align: "center" });

            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
            doc.text(`Orden #: ${loan.loan_number}`, 105, 50, { align: "center" });

            const text = `Se certifica que ${loan.clients?.full_name} ha cancelado la totalidad de sus obligaciones vinculadas al préstamo ${loan.loan_number}, por un monto total de ${formatCurrency(loan.total_amount)}.`;

            const splitText = doc.splitTextToSize(text, 170);
            doc.text(splitText, 20, 80);

            doc.text(`Fecha de Expedición: ${date}`, 20, 120);

            doc.setLineWidth(1);
            doc.setDrawColor(5, 150, 105);
            doc.rect(70, 140, 70, 20);
            doc.setTextColor(5, 150, 105);
            doc.setFontSize(14);
            doc.text("TOTALMENTE PAGADO", 105, 152, { align: "center" });

            doc.save(`Paz_y_Salvo_${loan.loan_number}.pdf`);
            toast.success("Paz y Salvo descargado", { id: toastId });
        } catch (error) {
            console.error("PDF Error:", error);
            toast.error("Error al generar Paz y Salvo", { id: toastId });
        }
    };

    if (isLoading) return <DashboardLayout><div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div></DashboardLayout>;
    if (!loan) return <DashboardLayout><div className="text-center py-20">No se encontró el préstamo.</div></DashboardLayout>;

    return (
        <DashboardLayout>
            <div className="max-w-full overflow-x-hidden px-4 md:px-0 space-y-6 pb-20">
                {/* Header Compacto - Estilo App */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="secondary"
                            size="icon"
                            onClick={() => navigate("/loans")}
                            className="h-9 w-9 rounded-full shrink-0"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div className="min-w-0">
                            <h1 className="text-xl font-bold truncate">Detalle de Crédito</h1>
                            <p className="text-xs text-muted-foreground truncate">{loan.loan_number} • {loan.clients?.full_name}</p>
                        </div>
                    </div>

                    {/* Botones de Acción Rápidos */}
                    <div className="grid grid-cols-3 gap-2">
                        <Button
                            variant="outline"
                            onClick={() => navigate(`/loans/${loan.id}/edit`)}
                            className="w-full text-xs h-9"
                        >
                            <Calendar className="mr-2 w-3.5 h-3.5" />
                            Ajustar
                        </Button>

                        {/* Dialog Multa por Mora */}
                        <Dialog open={showLateFeeDialog} onOpenChange={setShowLateFeeDialog}>
                            <DialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full text-xs h-9 border-destructive/40 text-destructive hover:bg-destructive/5"
                                    disabled={loan.status === 'completed'}
                                >
                                    <ShieldAlert className="mr-2 w-3.5 h-3.5" />
                                    Multa
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="w-[92vw] max-w-md rounded-2xl p-4">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2 text-destructive">
                                        <ShieldAlert className="w-4 h-4" />
                                        Aplicar Multa por Mora
                                    </DialogTitle>
                                    <DialogDescription>
                                        El monto se sumará al saldo pendiente del cliente y el crédito pasará a estado "En Mora".
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleRegisterLateFee} className="space-y-4 pt-2">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Días de mora</Label>
                                        <Input
                                            type="number"
                                            placeholder="Ej: 15"
                                            className="h-10"
                                            value={lateFeeForm.days}
                                            onChange={(e) => setLateFeeForm({ ...lateFeeForm, days: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Monto de la multa</Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                required
                                                type="number"
                                                placeholder="0.00"
                                                className="pl-9 h-10"
                                                value={lateFeeForm.amount}
                                                onChange={(e) => setLateFeeForm({ ...lateFeeForm, amount: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Motivo / Descripción</Label>
                                        <Textarea
                                            placeholder="Ej: Pago con 15 días de retraso..."
                                            className="resize-none text-xs h-20"
                                            value={lateFeeForm.reason}
                                            onChange={(e) => setLateFeeForm({ ...lateFeeForm, reason: e.target.value })}
                                        />
                                    </div>
                                    <DialogFooter className="pt-1">
                                        <Button
                                            type="submit"
                                            className="w-full bg-destructive hover:bg-destructive/90 text-white"
                                            disabled={isSavingLateFee}
                                        >
                                            {isSavingLateFee ? "Aplicando..." : "Confirmar Multa"}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
                            <DialogTrigger asChild>
                                <Button className="w-full text-xs h-9 bg-gradient-primary" disabled={loan.status === 'completed'}>
                                    <Plus className="mr-2 w-3.5 h-3.5" />
                                    Abonar
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="w-[92vw] max-w-md rounded-2xl p-4">
                                <DialogHeader>
                                    <DialogTitle>Registrar Pago</DialogTitle>
                                    <DialogDescription>Cuota #{paymentForm.installmentNumber}</DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleRegisterPayment} className="space-y-4 pt-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Monto a pagar</Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                            <Input required type="number" className="pl-9 h-10" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs"># Cuota</Label>
                                            <Input type="number" className="h-10" value={paymentForm.installmentNumber} onChange={(e) => setPaymentForm({ ...paymentForm, installmentNumber: e.target.value })} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">Método</Label>
                                            <Input className="h-10" value={paymentForm.method} onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })} />
                                        </div>
                                    </div>
                                    <DialogFooter className="pt-2">
                                        <Button type="submit" className="w-full" disabled={isSavingPayment}>
                                            {isSavingPayment ? "Procesando..." : "Confirmar Pago"}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Resumen de Saldo Animado */}
                <Card className="bg-gradient-to-br from-primary to-primary-dark text-white border-none shadow-lg overflow-hidden relative">
                    <CardContent className="p-5">
                        <div className="relative z-10">
                            <p className="text-primary-foreground/80 text-xs font-medium uppercase tracking-wider">Saldo Pendiente</p>
                            <h2 className="text-3xl font-bold mt-1">{formatCurrency(loan.remaining_amount)}</h2>
                            <div className="flex items-center gap-2 mt-4 text-[10px]">
                                <div className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md">
                                    {loan.paid_installments} / {loan.installments} Cuotas
                                </div>
                                <div className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md italic">
                                    Tasa: {loan.interest_rate}%
                                </div>
                                {loan.status === 'completed' && (
                                    <Badge className="bg-success text-white border-none animate-pulse">PAGADO</Badge>
                                )}
                            </div>
                        </div>
                        <TrendingUp className="w-24 h-24 text-white/10 absolute -right-4 -bottom-4 rotate-12" />
                    </CardContent>
                </Card>

                {/* Grid de Contenido - Mobile Stacked, Desktop 3 Cols */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Info de Cuotas */}
                        <Card className="border-none shadow-sm bg-secondary/20">
                            <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-sm font-bold flex items-center justify-between">
                                    Plan de Pagos
                                    <span className="text-[10px] font-normal text-muted-foreground">Próximos vencimientos</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <div className="space-y-2">
                                    {schedule.map((inst) => (
                                        <div
                                            key={inst.number}
                                            className={`flex items-center justify-between p-3 rounded-xl border bg-card transition-all ${inst.isPaid ? 'opacity-50 ring-1 ring-success/20' : 'shadow-sm active:scale-[0.98]'}`}
                                            onClick={() => {
                                                if (!inst.isPaid) {
                                                    setPaymentForm(prev => ({ ...prev, amount: inst.amount.toString(), installmentNumber: inst.number.toString() }));
                                                    setShowPaymentDialog(true);
                                                }
                                            }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${inst.isPaid ? 'bg-success/20 text-success' : 'bg-primary/10 text-primary'}`}>
                                                    {inst.number}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm tracking-tight">{formatCurrency(inst.amount)}</p>
                                                    <p className="text-[10px] text-muted-foreground">{new Date(inst.date).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            {inst.isPaid ? <CheckCircle className="w-5 h-5 text-success" /> : <Plus className="w-4 h-4 text-primary" />}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Historial Compacto */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold px-1">Historial de Pagos</h3>
                            {payments.length === 0 ? (
                                <p className="text-xs text-center py-6 text-muted-foreground italic">No hay pagos registrados aún.</p>
                            ) : (
                                <div className="space-y-2">
                                    {payments.map((p) => (
                                        <div key={p.id} className="p-3 border rounded-xl bg-card flex justify-between items-center shadow-xs">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                                                    <Download className="w-4 h-4 text-success" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-success">{formatCurrency(p.amount)}</p>
                                                    <p className="text-[10px] text-muted-foreground">Abono #{p.payment_number} • {new Date(p.payment_date).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => handleDownloadReceipt(p)} className="h-8 w-8">
                                                <Download className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar a Fondo en Móvil */}
                    <div className="space-y-4">
                        <Card className="rounded-2xl border-none bg-muted/30">
                            <CardContent className="p-4 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-sm truncate">{loan.clients?.full_name}</p>
                                        <p className="text-[10px] text-muted-foreground">{loan.clients?.phone}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button variant="outline" size="sm" className="text-[10px] h-8" onClick={() => navigate(`/clients/${loan.clients?.id}`)}>Perfil</Button>
                                    <Button variant="outline" size="sm" className="text-[10px] h-8 bg-success/5 border-success/20 text-success" onClick={() => window.open(`https://wa.me/${loan.clients?.phone.replace(/\D/g, '')}`, '_blank')}>WhatsApp</Button>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="bg-accent/5 rounded-2xl p-4 border border-accent/10">
                            <p className="text-[10px] font-bold text-accent uppercase mb-1">Notas del crédito</p>
                            <p className="text-xs italic text-muted-foreground">{loan.notes || "Sin notas adicionales."}</p>
                        </div>

                        {loan.status === 'completed' && (
                            <Button onClick={handleDownloadPazYSalvo} className="w-full bg-success hover:bg-success/90 text-white font-bold h-10 rounded-xl">
                                <CheckCircle className="mr-2 w-4 h-4" />
                                Generar Paz y Salvo
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default LoanDetail;
