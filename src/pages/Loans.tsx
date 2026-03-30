import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    DollarSign,
    Search,
    Filter,
    Plus,
    Eye,
    Edit,
    Trash2,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    Clock,
    Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { loansApi } from "@/lib/apiClient";
import { toast } from "sonner";

interface Loan {
    id: string;
    loan_number: string;
    principal_amount: number;
    total_amount: number;
    remaining_amount: number;
    paid_amount: number;
    interest_rate: number;
    installments: number;
    paid_installments: number;
    frequency: string;
    status: string;
    start_date: string;
    end_date: string;
    clients?: {
        full_name: string;
        phone: string;
    };
}

const Loans = () => {
    const [loans, setLoans] = useState<Loan[]>([]);
    const [filteredLoans, setFilteredLoans] = useState<Loan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const navigate = useNavigate();

    useEffect(() => {
        loadLoans();
    }, []);

    useEffect(() => {
        filterLoans();
    }, [searchTerm, statusFilter, loans]);

    const loadLoans = async () => {
        try {
            const data = await loansApi.list();
            setLoans(data || []);
        } catch (error) {
            console.error("Error loading loans:", error);
            toast.error("Error al cargar los préstamos");
        } finally {
            setIsLoading(false);
        }
    };

    const filterLoans = () => {
        let filtered = [...loans];

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(
                (loan) =>
                    loan.loan_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    loan.clients?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by status
        if (statusFilter !== "all") {
            filtered = filtered.filter((loan) => loan.status === statusFilter);
        }

        setFilteredLoans(filtered);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const handleDeleteLoan = async (id: string) => {
        if (!confirm("¿Estás seguro de eliminar este préstamo? Esta acción no se puede deshacer.")) {
            return;
        }

        try {
            await loansApi.update(id, { status: 'cancelled' });
            toast.success("Préstamo eliminado exitosamente");
            loadLoans();
        } catch (error) {
            console.error("Error deleting loan:", error);
            toast.error("Error al eliminar el préstamo");
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            active: { label: "Activo", variant: "default" as const, icon: TrendingUp },
            completed: { label: "Pagado", variant: "outline" as const, icon: CheckCircle },
            defaulted: { label: "En Mora", variant: "destructive" as const, icon: AlertCircle },
            pending: { label: "Pendiente", variant: "secondary" as const, icon: Clock },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <Badge variant={config.variant} className="flex items-center gap-1">
                <Icon className="w-3 h-3" />
                {config.label}
            </Badge>
        );
    };

    const getFrequencyLabel = (frequency: string) => {
        const frequencies: Record<string, string> = {
            daily: "Diario",
            weekly: "Semanal",
            biweekly: "Quincenal",
            monthly: "Mensual",
        };
        return frequencies[frequency] || frequency;
    };

    const calculateProgress = (loan: Loan) => {
        return ((loan.paid_amount || 0) / loan.total_amount) * 100;
    };

    const stats = {
        total: loans.length,
        active: loans.filter((l) => l.status === "active").length,
        completed: loans.filter((l) => l.status === "completed").length,
        defaulted: loans.filter((l) => l.status === "defaulted").length,
        totalCapital: loans
            .filter((l) => l.status === "active")
            .reduce((sum, l) => sum + (l.remaining_amount || 0), 0),
    };

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Gestión de Préstamos</h1>
                        <p className="text-muted-foreground">
                            Administra y da seguimiento a todos tus préstamos
                        </p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <Button
                            variant="outline"
                            onClick={() => navigate("/simulator")}
                            className="hover:bg-primary/5 hover:border-primary"
                        >
                            <TrendingUp className="w-4 h-4 sm:mr-2" />
                            <span className="hidden sm:inline">Simulador</span>
                        </Button>
                        <Button
                            onClick={() => navigate("/loans/new")}
                            className="bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow"
                        >
                            <Plus className="w-5 h-5 sm:mr-2" />
                            <span className="hidden sm:inline">Nuevo Préstamo</span>
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0 }}
                    >
                        <Card className="stat-card">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary-glow" />
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Total Préstamos</p>
                                        <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                                        <DollarSign className="w-6 h-6 text-primary-foreground" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="stat-card">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-success to-primary" />
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Activos</p>
                                        <p className="text-2xl font-bold text-foreground">{stats.active}</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success to-primary flex items-center justify-center">
                                        <TrendingUp className="w-6 h-6 text-primary-foreground" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="stat-card">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-warning" />
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Pagados</p>
                                        <p className="text-2xl font-bold text-foreground">{stats.completed}</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-warning flex items-center justify-center">
                                        <CheckCircle className="w-6 h-6 text-primary-foreground" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card className="stat-card">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-destructive to-warning" />
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">En Mora</p>
                                        <p className="text-2xl font-bold text-foreground">{stats.defaulted}</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-destructive to-warning flex items-center justify-center">
                                        <AlertCircle className="w-6 h-6 text-primary-foreground" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card className="stat-card">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />
                            <CardContent className="pt-6">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Capital en Calle</p>
                                    <p className="text-xl font-bold text-foreground">
                                        {formatCurrency(stats.totalCapital)}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                <Input
                                    placeholder="Buscar por número de préstamo o cliente..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full md:w-[200px]">
                                    <Filter className="mr-2 w-4 h-4" />
                                    <SelectValue placeholder="Filtrar por estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los estados</SelectItem>
                                    <SelectItem value="active">Activos</SelectItem>
                                    <SelectItem value="completed">Pagados</SelectItem>
                                    <SelectItem value="defaulted">En Mora</SelectItem>
                                    <SelectItem value="pending">Pendientes</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Loans Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Listado de Préstamos</span>
                            <Button variant="outline" size="sm">
                                <Download className="mr-2 w-4 h-4" />
                                Exportar
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : filteredLoans.length === 0 ? (
                            <div className="text-center py-12">
                                <DollarSign className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                                <h3 className="text-lg font-semibold mb-2">No hay préstamos</h3>
                                <p className="text-muted-foreground mb-6">
                                    {searchTerm || statusFilter !== "all"
                                        ? "No se encontraron préstamos con los filtros aplicados"
                                        : "Comienza creando tu primer préstamo"}
                                </p>
                                <Button onClick={() => navigate("/loans/new")}>
                                    <Plus className="mr-2 w-4 h-4" />
                                    Crear Préstamo
                                </Button>
                            </div>
                        ) : (
                            <>
                                {/* Vista Desktop: Tabla */}
                                <div className="hidden md:block overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Número</TableHead>
                                                <TableHead>Cliente</TableHead>
                                                <TableHead>Monto</TableHead>
                                                <TableHead>Pagado</TableHead>
                                                <TableHead>Saldo</TableHead>
                                                <TableHead>Progreso</TableHead>
                                                <TableHead>Frecuencia</TableHead>
                                                <TableHead>Estado</TableHead>
                                                <TableHead className="text-right">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredLoans.map((loan) => (
                                                <TableRow key={loan.id} className="group hover:bg-secondary/50">
                                                    <TableCell className="font-medium">{loan.loan_number}</TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium">{loan.clients?.full_name}</p>
                                                            <p className="text-xs text-muted-foreground">{loan.clients?.phone}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{formatCurrency(loan.total_amount)}</TableCell>
                                                    <TableCell className="text-success">{formatCurrency(loan.paid_amount || 0)}</TableCell>
                                                    <TableCell className="text-primary font-semibold">{formatCurrency(loan.remaining_amount)}</TableCell>
                                                    <TableCell>
                                                        <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                                                            <div className="h-full bg-primary" style={{ width: `${calculateProgress(loan)}%` }} />
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{getFrequencyLabel(loan.frequency)}</TableCell>
                                                    <TableCell>{getStatusBadge(loan.status)}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="sm" onClick={() => navigate(`/loans/${loan.id}`)}>
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" onClick={() => navigate(`/loans/${loan.id}/edit`)}>
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Vista Móvil: Tarjetas */}
                                <div className="grid grid-cols-1 gap-4 md:hidden">
                                    {filteredLoans.map((loan) => (
                                        <Card key={loan.id} className="bg-card hover:bg-muted/20 transition-colors" onClick={() => navigate(`/loans/${loan.id}`)}>
                                            <CardContent className="p-4 space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-bold text-lg text-primary">{loan.clients?.full_name}</span>
                                                            <Badge variant="outline" className="text-[10px] h-5">{loan.loan_number}</Badge>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {getFrequencyLabel(loan.frequency)}
                                                        </p>
                                                    </div>
                                                    {getStatusBadge(loan.status)}
                                                </div>

                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <div className="bg-secondary/30 p-2 rounded-lg">
                                                        <p className="text-xs text-muted-foreground">Prestado</p>
                                                        <p className="font-semibold">{formatCurrency(loan.total_amount)}</p>
                                                    </div>
                                                    <div className="bg-secondary/30 p-2 rounded-lg">
                                                        <p className="text-xs text-muted-foreground">Saldo</p>
                                                        <p className="font-bold text-destructive">{formatCurrency(loan.remaining_amount)}</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-xs text-muted-foreground">
                                                        <span>Progreso de pago</span>
                                                        <span>{Math.round(calculateProgress(loan))}%</span>
                                                    </div>
                                                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                                                        <div className="h-full bg-gradient-to-r from-success to-primary transition-all duration-500" style={{ width: `${calculateProgress(loan)}%` }} />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default Loans;
