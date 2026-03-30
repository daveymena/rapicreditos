import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  MoreVertical,
  Users as UsersIcon,
  Filter,
  Download,
  Upload,
  FileSpreadsheet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { clientsApi } from "@/lib/apiClient";
import { useAuth } from "@/components/auth/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Client {
  //... existing ...
}

const Clients = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadClients();
    }
  }, [user]);

  const loadClients = async () => {
    try {
      if (!user) return;

      const { data, error } = await clientsApi.list().then(d => ({ data: d, error: null })).catch(e => ({ data: null, error: e }));

      if (error) throw error;
      setClients(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los clientes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTemplate = () => {
    const separator = ";";
    const headers = ["Nombre", "Documento", "Telefono", "Email", "Ciudad", "Estado"];
    const sampleRows = [
      ["Juan Perez", "12345678", "3001234567", "juan@ejemplo.com", "Medellin", "active"],
      ["Maria Lopez", "87654321", "3109876543", "maria@ejemplo.com", "Bogota", "active"]
    ];

    const csvContent = [headers, ...sampleRows]
      .map(row => row.map(cell => `"${cell}"`).join(separator))
      .join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "plantilla_clientes.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = () => {
    if (clients.length === 0) {
      toast({ title: "Sin datos", description: "No hay clientes para exportar", variant: "destructive" });
      return;
    }

    // Usar punto y coma como separador por defecto para Excel en español
    const separator = ";";
    const headers = ["Nombre", "Documento", "Telefono", "Email", "Ciudad", "Estado"];

    const rows = clients.map(c => [
      c.full_name,
      c.document_number || "",
      c.phone || "",
      c.email || "",
      c.city || "",
      c.status
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${(cell || "").toString().replace(/"/g, '""')}"`).join(separator))
      .join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `clientes_rapicredi_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: "Exportación lista", description: "El archivo se ha descargado correctamente." });
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split(/\r?\n/);

        if (lines.length < 2) {
          toast({ title: "Archivo vacío", description: "El archivo no contiene datos válidos.", variant: "destructive" });
          return;
        }

        // Detectar separador (coma o punto y coma)
        const firstLine = lines[0];
        const separator = firstLine.includes(";") ? ";" : ",";

        const clientsToImport = lines.slice(1)
          .filter(line => line.trim() !== "")
          .map((line) => {
            const values = line.split(separator).map(v => v.trim().replace(/^"|"$/g, ''));
            if (!values[0]) return null;
            return {
              full_name: values[0],
              document_number: values[1] || "",
              phone: values[2] || "",
              email: values[3] || "",
              city: values[4] || "",
              status: values[5] || "active"
            };
          })
          .filter(Boolean);

        if (clientsToImport.length > 0) {
          for (const c of clientsToImport) {
            await clientsApi.create(c);
          }

          toast({ title: "Importación completa", description: `Se han registrado ${clientsToImport.length} clientes.` });
          loadClients();
        } else {
          toast({ title: "Sin datos válidos", description: "No se encontraron clientes para importar.", variant: "destructive" });
        }
      } catch (error: any) {
        console.error("Error importando:", error);
        toast({ title: "Error de formato", description: "Verifica que el archivo sea un CSV válido.", variant: "destructive" });
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const filteredClients = clients.filter(client =>
    client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm) ||
    client.document_number?.includes(searchTerm)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-success/20 text-success";
      case "inactive": return "bg-muted text-muted-foreground";
      case "blacklisted": return "bg-destructive/20 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active": return "Activo";
      case "inactive": return "Inactivo";
      case "blacklisted": return "Lista negra";
      default: return status;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Clientes</h1>
            <p className="text-muted-foreground">Gestiona tu cartera de clientes</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleExport()}
              className="border-primary/20 hover:bg-primary/5"
              title="Descargar lista actual"
            >
              <Download className="mr-2 w-4 h-4" />
              Exportar
            </Button>
            <Button
              variant="ghost"
              onClick={() => downloadTemplate()}
              className="text-muted-foreground hover:text-primary"
              title="Descargar plantilla para importar"
            >
              <FileSpreadsheet className="mr-2 w-4 h-4" />
              Plantilla
            </Button>
            <div className="relative">
              <input
                type="file"
                id="csv-import"
                className="hidden"
                accept=".csv"
                onChange={(e) => handleImport(e)}
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById("csv-import")?.click()}
                className="border-primary/20 hover:bg-primary/5"
              >
                <Upload className="mr-2 w-4 h-4" />
                Importar
              </Button>
            </div>
            <Button
              onClick={() => navigate("/clients/new")}
              className="bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow"
            >
              <Plus className="mr-2 w-5 h-5" />
              Nuevo Cliente
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, teléfono o documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
          <Button variant="outline" className="h-12">
            <Filter className="mr-2 w-5 h-5" />
            Filtros
          </Button>
        </div>

        {/* Clients Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredClients.length === 0 ? (
          <Card className="py-16">
            <CardContent className="text-center">
              <UsersIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {searchTerm ? "No se encontraron clientes" : "Sin clientes registrados"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm
                  ? "Intenta con otro término de búsqueda"
                  : "Comienza agregando tu primer cliente"}
              </p>
              {!searchTerm && (
                <Button
                  onClick={() => navigate("/clients/new")}
                  className="bg-gradient-primary text-primary-foreground"
                >
                  <Plus className="mr-2 w-5 h-5" />
                  Agregar Cliente
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map((client, index) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className="hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  onClick={() => navigate(`/clients/${client.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-lg font-bold text-primary">
                            {client.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {client.full_name}
                          </h3>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                            {getStatusLabel(client.status)}
                          </span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/clients/${client.id}`);
                          }}>
                            Ver detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/loans/new?clientId=${client.id}`);
                          }}>
                            Crear préstamo
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        <span>{client.phone}</span>
                      </div>
                      {client.email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          <span className="truncate">{client.email}</span>
                        </div>
                      )}
                      {client.city && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{client.city}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Clients;
