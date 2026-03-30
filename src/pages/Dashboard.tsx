import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  DollarSign,
  Users,
  TrendingUp,
  AlertTriangle,
  PlusCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/components/auth/AuthContext";
import { toast } from "sonner";
import { loansApi, clientsApi } from "@/lib/apiClient";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface Stats {
  totalCapital: number;
  totalClients: number;
  activeLoans: number;
  overdueLoans: number;
  totalEarnings: number;
  pendingPayments: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalCapital: 0,
    totalClients: 0,
    activeLoans: 0,
    overdueLoans: 0,
    totalEarnings: 0,
    pendingPayments: 0,
  });
  const [recentLoans, setRecentLoans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      if (!user) return;

      const [clients, loans] = await Promise.all([
        clientsApi.list(),
        loansApi.list(),
      ]);

      const activeLoans = loans.filter((l: any) => l.status === "active");
      const overdueLoans = loans.filter((l: any) => l.status === "defaulted");

      setStats({
        totalCapital: activeLoans.reduce((sum: number, l: any) => sum + Number(l.remaining_amount || 0), 0),
        totalClients: clients.length,
        activeLoans: activeLoans.length,
        overdueLoans: overdueLoans.length,
        totalEarnings: loans.reduce((sum: number, l: any) => sum + Number(l.paid_amount || 0), 0),
        pendingPayments: activeLoans.reduce((sum: number, l: any) => sum + Number(l.remaining_amount || 0), 0),
      });

      // Recent loans (ya los tenemos, tomamos los últimos 5)
      setRecentLoans(loans.slice(0, 5));
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const statCards = [
    {
      title: "Capital en la Calle",
      value: formatCurrency(stats.totalCapital),
      icon: DollarSign,
      trend: "+12%",
      trendUp: true,
      color: "from-primary to-primary-glow",
    },
    {
      title: "Total Clientes",
      value: stats.totalClients.toString(),
      icon: Users,
      trend: "+3",
      trendUp: true,
      color: "from-accent to-warning",
    },
    {
      title: "Préstamos Activos",
      value: stats.activeLoans.toString(),
      icon: TrendingUp,
      trend: stats.activeLoans > 0 ? "Activos" : "Sin préstamos",
      trendUp: true,
      color: "from-success to-primary",
    },
    {
      title: "En Mora",
      value: stats.overdueLoans.toString(),
      icon: AlertTriangle,
      trend: stats.overdueLoans > 0 ? "Atención" : "Todo al día",
      trendUp: stats.overdueLoans === 0,
      color: "from-destructive to-warning",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Resumen de tu cartera de préstamos</p>
          </div>
          <Button
            onClick={() => navigate("/loans/new")}
            className="bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow"
          >
            <PlusCircle className="mr-2 w-5 h-5" />
            Nuevo Préstamo
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="stat-card overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${stat.color}`} />
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-4">
                    {stat.trendUp ? (
                      <ArrowUpRight className="w-4 h-4 text-success" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-destructive" />
                    )}
                    <span className={`text-sm ${stat.trendUp ? "text-success" : "text-destructive"}`}>
                      {stat.trend}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chart Section */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Rendimiento de Cartera</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={[
                      { name: 'Ene', monto: 4000 },
                      { name: 'Feb', monto: 3000 },
                      { name: 'Mar', monto: 2000 },
                      { name: 'Abr', monto: 2780 },
                      { name: 'May', monto: 1890 },
                      { name: 'Jun', monto: 2390 },
                      { name: 'Jul', monto: stats.totalCapital / 1000 },
                    ]}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorMonto" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" opacity={0.1} />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      tickFormatter={(value) => `$${value}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="monto"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorMonto)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                className="w-full justify-start h-14 hover:bg-primary/5 hover:border-primary border-primary/20 bg-primary/5"
                onClick={() => {
                  if (user) {
                    const link = `${window.location.origin}/unirme/${user.id}`;
                    navigator.clipboard.writeText(link);
                    toast.success("¡Link de registro copiado!");
                  }
                }}
              >
                <div className="mr-3 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <PlusCircle className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-bold text-primary">Compartir Link de Registro</p>
                  <p className="text-xs text-muted-foreground">Tus clientes podrán registrarse solos</p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-14 hover:bg-primary/5 hover:border-primary"
                onClick={() => navigate("/clients/new")}
              >
                <Users className="mr-3 w-5 h-5 text-primary" />
                <div className="text-left">
                  <p className="font-medium">Nuevo Cliente</p>
                  <p className="text-xs text-muted-foreground">Registrar un cliente nuevo</p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-14 hover:bg-primary/5 hover:border-primary"
                onClick={() => navigate("/loans/new")}
              >
                <DollarSign className="mr-3 w-5 h-5 text-primary" />
                <div className="text-left">
                  <p className="font-medium">Nuevo Préstamo</p>
                  <p className="text-xs text-muted-foreground">Crear un préstamo nuevo</p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-14 hover:bg-primary/5 hover:border-primary"
                onClick={() => navigate("/simulator")}
              >
                <TrendingUp className="mr-3 w-5 h-5 text-primary" />
                <div className="text-left">
                  <p className="font-medium">Simulador</p>
                  <p className="text-xs text-muted-foreground">Calcular cuotas y fechas</p>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-1 gap-6">
          {/* Recent Loans */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Préstamos Recientes</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/loans")}>
                Ver todos
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : recentLoans.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No hay préstamos registrados</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => navigate("/loans/new")}
                  >
                    Crear primer préstamo
                  </Button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentLoans.map((loan, index) => (
                    <motion.div
                      key={loan.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-all cursor-pointer group"
                      onClick={() => navigate(`/loans/${loan.id}`)}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <Users className="w-5 h-5" />
                        </div>
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${loan.status === "active" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                          {loan.status}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-foreground group-hover:text-primary transition-colors">{loan.clients?.full_name}</p>
                        <p className="text-xs text-muted-foreground mb-3">{loan.loan_number}</p>
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Monto</p>
                            <p className="font-bold text-lg">{formatCurrency(loan.total_amount)}</p>
                          </div>
                          <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
