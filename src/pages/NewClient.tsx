import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, User, Phone, Mail, MapPin, Briefcase, Users, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { clientsApi } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";

const NewClient = () => {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    document_type: "CC",
    document_number: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    occupation: "",
    monthly_income: "",
    reference_name: "",
    reference_phone: "",
    reference_relationship: "",
    notes: "",
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      loadClientData();
    }
  }, [id]);

  const loadClientData = async () => {
    setIsFetching(true);
    try {
      const data = await clientsApi.get(id!);
      if (data) {
        setFormData({
          full_name: data.full_name || "",
          document_type: data.document_type || "CC",
          document_number: data.document_number || "",
          phone: data.phone || "",
          email: data.email || "",
          address: data.address || "",
          city: data.city || "",
          occupation: data.occupation || "",
          monthly_income: data.monthly_income?.toString() || "",
          reference_name: data.reference_name || "",
          reference_phone: data.reference_phone || "",
          reference_relationship: data.reference_relationship || "",
          notes: data.notes || "",
        });
      }
    } catch (error: any) {
      toast({ title: "Error", description: "No se pudo cargar el cliente", variant: "destructive" });
    } finally {
      setIsFetching(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const clientData = {
        full_name: formData.full_name,
        document_type: formData.document_type,
        document_number: formData.document_number,
        phone: formData.phone,
        email: formData.email || null,
        address: formData.address || null,
        city: formData.city || null,
        occupation: formData.occupation || null,
        monthly_income: formData.monthly_income ? parseFloat(formData.monthly_income) : null,
        reference_name: formData.reference_name || null,
        reference_phone: formData.reference_phone || null,
        reference_relationship: formData.reference_relationship || null,
        notes: formData.notes || null,
      };

      if (id) {
        await clientsApi.update(id, clientData);
      } else {
        await clientsApi.create(clientData);
      }

      toast({
        title: id ? "¡Cliente actualizado!" : "¡Cliente creado!",
        description: `El cliente ha sido ${id ? 'actualizado' : 'registrado'} exitosamente.`,
      });
      navigate("/clients");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar el cliente",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/clients")}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Nuevo Cliente</h1>
            <p className="text-muted-foreground">Registra un nuevo cliente en tu cartera</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Información Personal
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="full_name">Nombre completo *</Label>
                  <Input
                    id="full_name"
                    placeholder="Juan Pérez"
                    value={formData.full_name}
                    onChange={(e) => handleChange("full_name", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="document_type">Tipo de documento</Label>
                  <Select
                    value={formData.document_type}
                    onValueChange={(value) => handleChange("document_type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                      <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                      <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
                      <SelectItem value="PP">Pasaporte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="document_number">Número de documento</Label>
                  <Input
                    id="document_number"
                    placeholder="1234567890"
                    value={formData.document_number}
                    onChange={(e) => handleChange("document_number", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      placeholder="300 123 4567"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="cliente@correo.com"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Address & Work */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Ubicación y Trabajo
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    placeholder="Calle 123 # 45-67"
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad</Label>
                  <Input
                    id="city"
                    placeholder="Bogotá"
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="occupation">Ocupación</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="occupation"
                      placeholder="Comerciante"
                      value={formData.occupation}
                      onChange={(e) => handleChange("occupation", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthly_income">Ingreso mensual</Label>
                  <Input
                    id="monthly_income"
                    type="number"
                    placeholder="2000000"
                    value={formData.monthly_income}
                    onChange={(e) => handleChange("monthly_income", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Reference */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Referencia Personal
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="reference_name">Nombre de referencia</Label>
                  <Input
                    id="reference_name"
                    placeholder="María García"
                    value={formData.reference_name}
                    onChange={(e) => handleChange("reference_name", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reference_phone">Teléfono de referencia</Label>
                  <Input
                    id="reference_phone"
                    placeholder="300 987 6543"
                    value={formData.reference_phone}
                    onChange={(e) => handleChange("reference_phone", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reference_relationship">Parentesco</Label>
                  <Input
                    id="reference_relationship"
                    placeholder="Hermana"
                    value={formData.reference_relationship}
                    onChange={(e) => handleChange("reference_relationship", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Notes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Notas adicionales</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Información adicional sobre el cliente..."
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  rows={4}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/clients")}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="mr-2 w-5 h-5" />
                  Guardar Cliente
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default NewClient;
